import {
  ensureFileSync, statSync, writeFileSync
} from 'fs-extra';
import { convert2img } from 'mdimg';
import nodeHtmlToImage from 'node-html-to-image';

const echarts = require('echarts');

export function debounce(cb, delay = 250) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

export function sleep(time = 200) {
  return new Promise((res)=>{
    setTimeout(()=>{
      res('');
    }, time);
  });
}

export function isDir(dirPath) {
  try {
    return statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

export function isTestEnv() {
  return process.env.NODE_ENV === 'test';
}

export async function getLineChartSvgContent({
  list, title
}) {
  const options = {
    title: { text: title },
    legend: {
      data: list.map(item=>item.name)
    },
    xAxis: {
      type: 'category',
      data: list[0].data.map((_, index)=>`run-${index + 1}`)
    },
    yAxis: {
      type: 'value'
    },
    series: list.map(item=>{
      return {
        ...item,
        type: 'line'
        // label: {
        //   show: true,
        //   position: 'top'
        // }
      };
    })
  };

  // 在 SSR 模式下第一个参数不需要再传入 DOM 对象
  const chart = await echarts.init(null, null, {
    renderer: 'svg', // 必须使用 SVG 模式
    ssr: true, // 开启 SSR
    width: 1920, // 需要指明高和宽
    height: 1080,
    animation: false
  });

  // 像正常使用一样 setOption
  await chart.setOption(options);

  // 输出字符串
  const svgStr = chart.renderToSVGString();

  return svgStr;
}

export async function getLineChartSvg({
  list, outputPath, title, name
}) {
  // 输出字符串
  const svgStr = await getLineChartSvgContent({ list, title });
  const path = `${outputPath}/${name}.svg`;

  ensureFileSync(path);
  writeFileSync(path, svgStr, 'utf-8');

  return `${name}.svg`;
}

export async function convertMd2pPng({
  outputPath, mdContent
}) {
  const path = `${outputPath}/report.png`;
  await convert2img({
    mdText: mdContent,
    outputFilename: path,
    width: 1260,
    cssTemplate: 'github'
  });
  return path;
}

export async function createPngFormHtml({ outputPath, htmlContent }) {
  return nodeHtmlToImage({
    output: outputPath,
    html: htmlContent
  });
}
