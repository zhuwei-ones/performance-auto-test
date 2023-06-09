import { statSync, writeFileSync } from 'fs-extra';
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

export function getLineChartSvg({
  list, outputPath, title, name
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
        type: 'line',
        label: {
          show: true,
          position: 'top'
        }
      };
    })
  };

  // 在 SSR 模式下第一个参数不需要再传入 DOM 对象
  const chart = echarts.init(null, null, {
    renderer: 'svg', // 必须使用 SVG 模式
    ssr: true, // 开启 SSR
    width: 1000, // 需要指明高和宽
    height: 400
  });
  // 像正常使用一样 setOption
  chart.setOption(options);

  // 输出字符串
  const svgStr = chart.renderToSVGString();
  const path = `${outputPath}/${name}.svg`;

  writeFileSync(path, svgStr, 'utf-8');

  return `${name}.svg`;
}
