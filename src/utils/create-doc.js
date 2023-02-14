import { writeFileSync } from 'fs-extra';
import json2md from 'json2md';
import { marked } from 'marked';
import glob from 'glob';
import { basename } from 'path';
import {
  KBPS_NAME, METRICS_REPORT_MAP, METRICS_SECOND_UNIT, PERFORMANCE_TOOLS_MAP
} from '../const';

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

export const getToolCompareTableData = (lighthouseResult, sitespeedResult)=>{
  const content = [];

  const data = {
    [PERFORMANCE_TOOLS_MAP.LIGHTHOUSE]: lighthouseResult,
    [PERFORMANCE_TOOLS_MAP.SITESPEED]: sitespeedResult
  };

  console.log('performance data--->', data);

  const allUrls = Object.keys(lighthouseResult);
  const allTools = Object.keys(data);

  allUrls.forEach(urlKey=>{
    const urlData = lighthouseResult[urlKey];

    allTools.forEach((tool, index)=>{
      const obj = [];
      if (index === 0) {
        obj.push(urlData.url);
      } else {
        obj.push('-');
      }

      obj.push(tool);

      METRICS_REPORT_MAP.forEach(metricsKey=>{
        const pageData = data[tool][urlKey];
        let pageMetrics = pageData?.metircs?.[metricsKey];

        if (pageMetrics) {
          // 如果不是 s 单位的，就需要除1000
          if (!METRICS_SECOND_UNIT.includes(metricsKey)) {
            pageMetrics = (pageMetrics / 1000).toFixed(3);
          }
          pageMetrics = `${pageMetrics} s`;
        } else {
          pageMetrics = '-';
        }

        obj.push(pageMetrics);
      });
      content.push(obj);
    });
  });

  return {
    table: {
      headers: ['Page', 'Tool', ...METRICS_REPORT_MAP],
      rows: content
    }
  };
};

export const getLighthouseReportLinks = ({ lighthouseOutputPath, outputPath, lighthouseResult })=>{
  const reportUrls = {};
  const urlDirs = glob.sync(`${lighthouseOutputPath}/*`);

  urlDirs.forEach(dir=>{
    const htmlList = glob.sync(`${dir}/*.html`);
    const url = dir.match(/.+\/(.[^/]+)$/)?.[1];

    reportUrls[url] = htmlList.map((item, index)=>{
      return {
        link: {
          title: `run-${index + 1}`,
          source: `${item.replace(`${outputPath}/`, '')}`
        }
      };
    });
  });

  const content = Object.keys(reportUrls).map(urlKey=>{
    const reportUrl = reportUrls[urlKey] || [];
    return [
      lighthouseResult[urlKey]?.url,
      ...reportUrl
    ];
  });
  return {
    table: {
      headers: ['测试页面', '测试结果', ...new Array(content?.[0].slice(2).length).fill('')],
      rows: content
    }
  };
};

export const getSitespeedReportLinks = ({ sitespeedOutputPath, outputPath, sitespeedResult })=>{
  const reportUrls = {};
  const urlDirs = glob.sync(`${sitespeedOutputPath}/*`);

  urlDirs.forEach(dir=>{
    const htmlList = glob.sync(`${dir}/pages/**/*.html`);
    const url = dir.match(/.+\/(.[^/]+)$/)?.[1];

    reportUrls[url] = htmlList.map((item, index)=>{
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
    }).filter(e=>e);

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

  const content = Object.keys(reportUrls).map(urlKey=>{
    const reportUrl = reportUrls[urlKey] || [];
    return [
      sitespeedResult[urlKey]?.url,
      ...reportUrl
    ];
  });

  return {
    table: {
      headers: ['测试页面', '测试结果', ...new Array(content?.[0].slice(2).length).fill('')],
      rows: content
    }
  };
};

export const getTestEnvTableData = (options)=>{
  const {
    testTime, testTools, userAgent, downloadKbps, uploadKbps, width, height, latency, iterations
  } = options;

  const TestEnvHeader = [
    {
      title: '测试时间',
      value: testTime.toLocaleString()
    }, {
      title: '测试工具',
      value: testTools
    }, {
      title: '网络状态',
      value: `上传速度：${KBPS_NAME[downloadKbps]}，下载速度${KBPS_NAME[uploadKbps]}，延迟：${latency}ms`
    }, {
      title: '浏览器信息',
      value: userAgent
    }, {
      title: '浏览器尺寸',
      value: `${width}x${height}`
    }, {
      title: '测试次数',
      value: iterations
    }
  ];

  const TableHeader = ['-', '-'];
  const TableContent = [];

  TestEnvHeader.forEach((item)=>{
    TableContent.push([
      item.title,
      item.value
    ]);
  });

  return {
    table: {
      headers: TableHeader,
      rows: TableContent
    }
  };
};

export const createPerformanceReport = (params)=>{
  const {
    lighthouseResult,
    lighthouseOptions,
    sitespeedOptions,
    sitespeedResult,
    outputPath,
    setting, testTime, testTools, iterations
  } = params;

  const json = [];

  json.push({ h1: '性能测试报告' });
  json.push({ h2: '测试结论（测试通过）' });

  json.push({ h3: '测试环境' });
  json.push(getTestEnvTableData({
    ...setting, testTime, testTools, iterations
  }));

  json.push({ h3: '性能测试工具结果对比报告' });
  json.push(getToolCompareTableData(lighthouseResult, sitespeedResult));

  json.push({ h3: 'Lighthouse 具体报告' });
  json.push(getLighthouseReportLinks({
    lighthouseOutputPath: lighthouseOptions.outputPath,
    outputPath,
    lighthouseResult
  }));

  json.push({ h3: 'Sitespeed 具体报告' });
  json.push(getSitespeedReportLinks({
    sitespeedOutputPath: sitespeedOptions.outputPath,
    outputPath,
    sitespeedResult
  }));

  console.log('md json--->', JSON.stringify(json, null, { space: 4 }));

  const content = json2md(json);

  console.log('md content--->', content);

  let htmlContent = marked.parse(content);

  htmlContent = getHtmlResult({ bodyStr: htmlContent, title: '性能测试报告' });

  const reportPath = `${outputPath}/report.html`;

  writeFileSync(reportPath, htmlContent);

  return reportPath;
};
