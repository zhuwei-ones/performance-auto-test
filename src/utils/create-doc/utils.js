import { ensureFileSync, readFileSync, writeFileSync } from 'fs-extra';
import json2md from 'json2md';
import { marked } from 'marked';
import glob from 'glob';
import { basename } from 'path';
import {
  COLOR_MAP,
  METRICS_RANGE_MAP,
  PERFORMANCE_TOOLS_MAP,
  REPORT_TYPE_MAP
} from '../../const';

import { convertMd2pPng, getLineChartSvg } from '../common';

json2md.converters.redText = (input) => {
  return `<font color="${COLOR_MAP.RED}">${input}</font>`;
};

json2md.converters.greenText = (input) => {
  return `<font color="${COLOR_MAP.GREEN}">${input}</font>`;
};

json2md.converters.orangeText = (input) => {
  return `<font color="${COLOR_MAP.ORANGE}">${input}</font>`;
};

json2md.converters.textList = (list) => {
  const result = list
    .map((item) => {
      return `<font color="${METRICS_RANGE_MAP[item.type] || '#999'}">${
        item.input
      }</font><br>`;
    })
    .join('');

  return `<div>${result}</div>`;
};

const getHtmlResult = ({ bodyStr, title }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head> 
        <title>${title}</title> 
        <meta charset="UTF-8" /> 
        <meta name="viewport" content="width=device-width, initial-scale=1" /> 
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/markdown-css-smartisan/github-markdown.css" /> 
        <style>
          .markdown-body {
              width: 80%;
              margin: 0 auto;
          }
        </style> 
      </head> 
      <body> 
        <article class="markdown-body">
          ${bodyStr}
        </article>  
      </body>
    </html>
  `;
};

export const getToolCompareChartImg = async (data) => {
  const {
    result, outputPath, type, metricsType
  } = data;
  const urls = Object.keys(result);
  const listData = [];

  for (let i = 0; i < urls.length; i += 1) {
    const urlKey = urls[i];
    const urlItemData = result[urlKey];
    const { url, metircs } = urlItemData;
    const metricsData = metircs[`${metricsType}List`];

    if (!metricsData || metricsData.length === 0) {
      return {};
    }

    listData.push({
      data: metricsData,
      name: url
    });
  }

  const path = await getLineChartSvg({
    list: listData,
    title: metricsType,
    outputPath: outputPath,
    name: `${type}-${metricsType}`
  });

  return {
    img: { title: 'My image title', source: path, alt: 'My image alt' }
  };
};

export const getLighthouseReportLinks = ({
  toolOutputPath,
  outputPath,
  result,
  options
}) => {
  const reportUrls = {};
  const { lighthouseConfig } = options;
  const { saveReport2Png } = lighthouseConfig || {};
  const urlDirs = glob.sync(`${toolOutputPath}/*`);

  urlDirs.forEach((dir) => {
    const ext = saveReport2Png ? 'png' : 'html';
    const htmlList = glob.sync(`${dir}/*.${ext}`);
    const url = dir.match(/.+\/(.[^/]+)$/)?.[1];
    const reg = new RegExp(`(\\d+)\\.${ext}$`);

    reportUrls[url] = htmlList
      .sort((file1, file2) => {
        const fileNameA = parseInt(file1.match(reg)?.[1], 10);
        const fileNameB = parseInt(file2.match(reg)?.[1], 10);
        return fileNameA - fileNameB;
      })
      .map((item, index) => {
        return {
          link: {
            title: `run-${index + 1}`,
            source: `${item.replace(`${outputPath}/`, '')}`
          }
        };
      });
  });

  const content = Object.keys(reportUrls).map((urlKey) => {
    const reportUrl = reportUrls[urlKey] || [];
    return [result[urlKey]?.url, ...reportUrl];
  });
  return {
    table: {
      headers: [
        '测试页面',
        '测试结果',
        ...new Array(content?.[0]?.slice(2).length).fill('')
      ],
      rows: content
    }
  };
};

export const getSitespeedReportLinks = ({
  toolOutputPath,
  outputPath,
  result
}) => {
  const reportUrls = {};
  const urlDirs = glob.sync(`${toolOutputPath}/*`);

  urlDirs.forEach((dir) => {
    const htmlList = glob.sync(`${dir}/pages/**/*.html`);
    const url = dir.match(/.+\/(.[^/]+)$/)?.[1];

    reportUrls[url] = htmlList
      .map((item, index) => {
        const htmlName = basename(item, 'html');
        const urlName = +htmlName;

        if (Number.isNaN(urlName)) {
          return null;
        }

        return {
          link: {
            title: `run-${index + 1}`,
            source: `${item.replace(`${outputPath}/`, '')}`
          }
        };
      })
      .filter((e) => e);

    reportUrls[url] = [
      {
        link: {
          title: 'run-总览',
          source: `${dir.replace(`${outputPath}/`, '')}/index.html`
        }
      },
      ...reportUrls[url]
    ];
  });

  const content = Object.keys(reportUrls).map((urlKey) => {
    const reportUrl = reportUrls[urlKey] || [];
    return [result[urlKey]?.url, ...reportUrl];
  });

  return {
    table: {
      headers: [
        '测试页面',
        '测试结果',
        ...new Array(content?.[0]?.slice(2).length).fill('')
      ],
      rows: content
    }
  };
};

export const TOOL_REPORT_LINK_FUNC_MAP = {
  [PERFORMANCE_TOOLS_MAP.LIGHTHOUSE]: getLighthouseReportLinks,
  [PERFORMANCE_TOOLS_MAP.SITESPEED]: getSitespeedReportLinks
};

export const createHtmlReport = (content, options) => {
  const { outputPath } = options;

  let htmlContent = marked.parse(content);

  htmlContent = getHtmlResult({ bodyStr: htmlContent, title: '性能测试报告' });

  const reportPath = `${outputPath}/report.html`;

  ensureFileSync(reportPath);

  writeFileSync(reportPath, htmlContent);

  return reportPath;
};

export const createMdReport = (content, options) => {
  const { outputPath } = options;

  const reportPath = `${outputPath}/report.md`;

  ensureFileSync(reportPath);

  writeFileSync(reportPath, content);

  return reportPath;
};

export const createReportFile = (content, options) => {
  const { reportType } = options;
  if (reportType === REPORT_TYPE_MAP.MD) {
    return createMdReport(content, options);
  }

  return createHtmlReport(content, options);
};

export const createReportPng = (content, options) => {
  const { outputPath } = options;
  const regex = /!\[.*?\]\((.*?)\)/g;
  let match = regex.exec(content);
  let mdContent = content;

  while (match) {
    // 使用正则表达式获取图片路径
    const imageContent = match[1];
    const [imagePath] = imageContent.split(' ');

    // 读取图片文件并转换为 base64 编码
    const imageBase64 = readFileSync(`${outputPath}/${imagePath}`, 'utf-8');
    const base64Data = Buffer.from(imageBase64).toString('base64');

    // 替换原始的图片路径为 base64 编码
    mdContent = mdContent.replace(
      imagePath,
      `data:image/svg+xml;base64,${base64Data}`
    );
    match = regex.exec(content);
  }

  return convertMd2pPng({ mdContent, outputPath });
};
