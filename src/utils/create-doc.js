import { ensureFileSync, writeFileSync } from 'fs-extra';
import json2md from 'json2md';
import { marked } from 'marked';
import glob from 'glob';
import { basename } from 'path';
import {
  COLOR_MAP,
  KBPS_NAME, METRICS_REPORT_MAP, METRICS_SECOND_UNIT, METRICS_STANDARD_MAP, PERFORMANCE_TOOLS_MAP
} from '../const';
import { logger } from './log';

json2md.converters.redText = (input)=> {
  return `<font color="${COLOR_MAP.RED}">${input}</font>`;
};

json2md.converters.greenText = (input)=> {
  return `<font color="${COLOR_MAP.GREEN}">${input}</font>`;
};

json2md.converters.orangeText = (input)=> {
  return `<font color="${COLOR_MAP.ORANGE}">${input}</font>`;
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

export const getReportConclusion = ({ performanceResultList, metricsConfig })=>{
  // 总的是否通过
  // 链接表格 具体那个不通过
  const content = [];
  const { good: goodMetrics } = metricsConfig;

  const allTools = Object.keys(performanceResultList);
  const oneToolName = allTools[0];
  const oneTool = performanceResultList[oneToolName];
  const allUrls = Object.keys(oneTool);

  allUrls.forEach(urlKey=>{
    const urlData = oneTool[urlKey];
    const obj = [];

    obj.push(urlData.url);

    allTools.forEach((tool)=>{
      const isUnApprove = METRICS_STANDARD_MAP.some(metricsKey=>{
        const pageData = performanceResultList[tool][urlKey];
        let pageMetrics = pageData?.metircs?.[metricsKey];
        const metricsLowerKey = metricsKey.toLowerCase();
        const goodMetricsVal = goodMetrics[metricsLowerKey];

        // 需要一个地方，同一把所有指标都统一成一个单位
        // 如果不是 s 单位的，就需要除1000
        if (METRICS_SECOND_UNIT.includes(metricsKey)) {
          pageMetrics *= 1000;
        }

        const isBest = goodMetricsVal && goodMetricsVal >= pageMetrics;

        return !isBest;
      });

      obj.push(isUnApprove ? { redText: '不通过' } : { greenText: '通过' });
    });
    content.push(obj);
  });

  return [
    { h2: '测试结论' },
    {
      table: {
        headers: ['Page', ...allTools],
        rows: content
      }
    }
  ];
};

export const getToolCompareTableData = ({ performanceResultList, metricsConfig })=>{
  const content = [];

  const { good: goodMetrics, bad: badMetrics } = metricsConfig;

  // console.log('performance data--->', performanceResultList);

  const allTools = Object.keys(performanceResultList);
  const oneToolName = allTools[0];
  const oneTool = performanceResultList[oneToolName];
  const allUrls = Object.keys(oneTool);

  allUrls.forEach(urlKey=>{
    const urlData = oneTool[urlKey];

    allTools.forEach((tool, index)=>{
      const obj = [];
      if (index === 0) {
        obj.push(urlData.url);
      } else {
        obj.push('-');
      }

      obj.push(tool);

      METRICS_REPORT_MAP.forEach(metricsKey=>{
        const pageData = performanceResultList[tool][urlKey];
        let pageMetrics = pageData?.metircs?.[metricsKey];
        const metricsLowerKey = metricsKey.toLowerCase();
        const goodMetricsVal = goodMetrics[metricsLowerKey];
        const badMetricsVal = badMetrics[metricsLowerKey];

        if (typeof pageMetrics !== 'undefined') {
          // 如果不是 s 单位的，就需要除1000
          if (!METRICS_SECOND_UNIT.includes(metricsKey)) {
            pageMetrics = (pageMetrics / 1000).toFixed(3);
          }
          const isBest = goodMetricsVal && goodMetricsVal / 1000 >= pageMetrics;
          const isWorst = badMetricsVal && badMetricsVal / 1000 <= pageMetrics;
          const isMiddle = badMetricsVal
                          && goodMetricsVal
                          && goodMetricsVal / 1000 < pageMetrics
                          && badMetricsVal / 1000 > pageMetrics;

          pageMetrics = `${pageMetrics} s`;

          if (isBest) {
            pageMetrics = {
              greenText: pageMetrics
            };
          } else if (isWorst) {
            pageMetrics = {
              redText: pageMetrics
            };
          } else if (isMiddle) {
            pageMetrics = {
              orangeText: pageMetrics
            };
          }
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

export const getMetricsStandardDataTable = (metricsConfig)=>{
  const { good, bad } = metricsConfig;

  return {
    table: {
      headers: ['', ...METRICS_STANDARD_MAP],
      rows: [
        [{ greenText: '最优' }, ...METRICS_STANDARD_MAP.map(key=>{ return `${good[key.toLowerCase()]} ms`; })],
        [{ redText: '最差' }, ...METRICS_STANDARD_MAP.map(key=>{ return `${bad[key.toLowerCase()]} ms`; })]
      ]
    }
  };
};

export const getLighthouseReportLinks = ({ toolOutputPath, outputPath, result })=>{
  const reportUrls = {};
  const urlDirs = glob.sync(`${toolOutputPath}/*`);

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
      result[urlKey]?.url,
      ...reportUrl
    ];
  });
  return {
    table: {
      headers: ['测试页面', '测试结果', ...new Array(content?.[0]?.slice(2).length).fill('')],
      rows: content
    }
  };
};

export const getSitespeedReportLinks = ({ toolOutputPath, outputPath, result })=>{
  const reportUrls = {};
  const urlDirs = glob.sync(`${toolOutputPath}/*`);

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
      result[urlKey]?.url,
      ...reportUrl
    ];
  });

  return {
    table: {
      headers: ['测试页面', '测试结果', ...new Array(content?.[0]?.slice(2).length).fill('')],
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
      value: testTools.join('、')
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

const TOOL_REPORT_LINK_FUNC_MAP = {
  [PERFORMANCE_TOOLS_MAP.LIGHTHOUSE]: getLighthouseReportLinks,
  [PERFORMANCE_TOOLS_MAP.SITESPEED]: getSitespeedReportLinks
};

export const createPerformanceReport = (performanceResultList, options)=>{
  const {
    outputPath,
    metricsConfig,
    setting, testTime, testTools, iterations
  } = options;

  const json = [];

  // console.log('performanceResultList--->', performanceResultList);

  const performanceResultMap = performanceResultList.reduce((pre, current)=>{
    return {
      ...pre,
      [current.type]: current.result
    };
  }, {});

  json.push({ h1: '性能测试报告' });

  json.push(getReportConclusion({
    performanceResultList: performanceResultMap,
    metricsConfig
  }));

  json.push({ h3: '测试环境' });
  json.push(getTestEnvTableData({
    ...setting, testTime, testTools, iterations
  }));

  json.push({ h3: '指标标准' });
  json.push(getMetricsStandardDataTable(metricsConfig));

  json.push({ h3: '性能测试工具结果对比报告' });
  json.push(getToolCompareTableData({
    performanceResultList: performanceResultMap,
    metricsConfig
  }));

  performanceResultList.forEach((item)=>{
    const { type, result } = item;
    const getToolReportLinkFunc = TOOL_REPORT_LINK_FUNC_MAP[type];

    json.push({ h3: `${type} 具体报告` });
    json.push(getToolReportLinkFunc({
      toolOutputPath: options[`${type}Options`].outputPath,
      outputPath,
      result
    }));
  });

  logger.info('report result json--->', JSON.stringify(json, null, { space: 2 }));

  const content = json2md(json);

  // console.log('md content--->', content);

  let htmlContent = marked.parse(content);

  htmlContent = getHtmlResult({ bodyStr: htmlContent, title: '性能测试报告' });

  const reportPath = `${outputPath}/report.html`;

  ensureFileSync(reportPath);

  writeFileSync(reportPath, htmlContent);

  return reportPath;
};
