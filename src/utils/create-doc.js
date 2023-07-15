import { ensureFileSync, readFileSync, writeFileSync } from 'fs-extra';
import json2md from 'json2md';
import { marked } from 'marked';
import glob from 'glob';
import { basename } from 'path';
import {
  COLOR_MAP,
  METRICS_MAP,
  METRICS_RANGE_MAP,
  METRICS_REPORT_MAP,
  METRICS_SECOND_UNIT,
  PERFORMANCE_TOOLS_MAP,
  REPORT_TYPE_MAP
} from '../const';

import {
  getCurrentMetricsStandard,
  getMetricsValueByCompareType,
  getValueRange,
  isValidNumber,
  kbToMb
} from './get-value';
import { logger } from './log';
import { convertMd2pPng, getLineChartSvg } from './common';
import dayjs from 'dayjs';

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

export const getReportConclusion = ({
  performanceResultList,
  metricsConfig,
  compareMetricsType
}) => {
  // 总的是否通过
  // 链接表格 具体那个不通过
  const content = [];
  const { good: goodMetrics } = metricsConfig;

  const allTools = Object.keys(performanceResultList);
  const oneToolName = allTools[0];
  const oneTool = performanceResultList[oneToolName];
  const allUrls = Object.keys(oneTool);

  allUrls.forEach((urlKey) => {
    const urlData = oneTool[urlKey];
    const obj = [];

    obj.push(urlData.url);

    allTools.forEach((tool) => {
      const isUnApprove = getCurrentMetricsStandard(goodMetrics).some(
        (metricsKey) => {
          const pageData = performanceResultList[tool][urlKey];
          let pageMetrics = getMetricsValueByCompareType(
            pageData.metircs,
            metricsKey,
            compareMetricsType
          );

          const metricsLowerKey = metricsKey.toLowerCase();
          const goodMetricsVal = goodMetrics[metricsLowerKey];

          // 需要一个地方，同一把所有指标都统一成一个单位
          // 如果不是 s 单位的，就需要除1000
          if (METRICS_SECOND_UNIT.includes(metricsKey)) {
            pageMetrics *= 1000;
          }

          const isBest = goodMetricsVal && goodMetricsVal >= pageMetrics;

          return !isBest;
        }
      );

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

export const getToolCompareTableData = ({
  performanceResultList,
  metricsConfig
}) => {
  const content = [];

  const { good: goodMetrics, bad: badMetrics } = metricsConfig;

  // console.log('performance data--->', performanceResultList);

  const allTools = Object.keys(performanceResultList);
  const oneToolName = allTools[0];
  const oneTool = performanceResultList[oneToolName];
  const allUrls = Object.keys(oneTool);

  allUrls.forEach((urlKey) => {
    const urlData = oneTool[urlKey];

    allTools.forEach((tool, index) => {
      const obj = [];
      if (index === 0) {
        obj.push(urlData.url);
      } else {
        obj.push('-');
      }

      obj.push(tool);

      METRICS_REPORT_MAP.forEach((metricsKey) => {
        const pageData = performanceResultList[tool][urlKey];
        let pageMetrics = {};
        let pageMetricsAvg = pageData?.metircs?.[metricsKey];
        let pageMetrics75 = pageData?.metircs?.[`${metricsKey}_75`];
        let pageMetrics90 = pageData?.metircs?.[`${metricsKey}_90`];
        const metricsLowerKey = metricsKey.toLowerCase();
        const goodMetricsVal = goodMetrics[metricsLowerKey];
        const badMetricsVal = badMetrics[metricsLowerKey];

        if (typeof pageMetricsAvg !== 'undefined') {
          // 如果不是 s 单位的，就需要除1000
          if (!METRICS_SECOND_UNIT.includes(metricsKey)) {
            pageMetricsAvg = (pageMetricsAvg / 1000).toFixed(3);
            pageMetrics75 = (pageMetrics75 / 1000).toFixed(3);
            pageMetrics90 = (pageMetrics90 / 1000).toFixed(3);
          }

          const goodMetricsMSVal = goodMetricsVal / 1000;
          const badMetricsMSVal = badMetricsVal / 1000;
          const metricsAvgRange = getValueRange(
            pageMetricsAvg,
            goodMetricsMSVal,
            badMetricsMSVal
          );
          const metrics75Range = getValueRange(
            pageMetrics75,
            goodMetricsMSVal,
            badMetricsMSVal
          );
          const metrics90Range = getValueRange(
            pageMetrics90,
            goodMetricsMSVal,
            badMetricsMSVal
          );

          const pageMetricsAvgUnit = `AVG: ${pageMetricsAvg} s`;
          const pageMetrics75Unit = `P75: ${pageMetrics75} s`;
          const pageMetrics90Unit = `P90: ${pageMetrics90} s`;

          const textList = [];

          if (isValidNumber(pageMetricsAvg)) {
            textList.push({
              type: metricsAvgRange,
              input: pageMetricsAvgUnit
            });
          }

          if (isValidNumber(pageMetrics75)) {
            textList.push({
              type: metrics75Range,
              input: pageMetrics75Unit
            });
          }

          if (isValidNumber(pageMetrics90)) {
            textList.push({
              type: metrics90Range,
              input: pageMetrics90Unit
            });
          }

          pageMetrics = {
            textList: textList
          };
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
      return '';
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

export const getMetricsStandardDataTable = (metricsConfig) => {
  const { good, bad } = metricsConfig;

  return {
    table: {
      headers: ['', ...getCurrentMetricsStandard(good)],
      rows: [
        [
          { greenText: '最优' },
          ...getCurrentMetricsStandard(good).map((key) => {
            return `${good[key.toLowerCase()]} ms`;
          })
        ],
        [
          { redText: '最差' },
          ...getCurrentMetricsStandard(bad).map((key) => {
            return `${bad[key.toLowerCase()]} ms`;
          })
        ]
      ]
    }
  };
};

export const getLighthouseReportLinks = ({
  toolOutputPath,
  outputPath,
  result
}) => {
  const reportUrls = {};
  const urlDirs = glob.sync(`${toolOutputPath}/*`);

  urlDirs.forEach((dir) => {
    const htmlList = glob.sync(`${dir}/*.html`);
    const url = dir.match(/.+\/(.[^/]+)$/)?.[1];

    reportUrls[url] = htmlList.map((item, index) => {
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

export const getTestEnvTableData = (options) => {
  const {
    testTime,
    testTools,
    userAgent,
    downloadKbps,
    uploadKbps,
    width,
    height,
    latency,
    iterations
  } = options;

  const TestEnvHeader = [
    {
      title: '测试时间',
      value: dayjs(testTime).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '测试工具',
      value: testTools.join('、')
    },
    {
      title: '网络状态',
      value: `上传速度：${kbToMb(downloadKbps)}，下载速度：${kbToMb(
        uploadKbps
      )}，延迟：${latency}ms`
    },
    {
      title: '浏览器信息',
      value: userAgent
    },
    {
      title: '浏览器尺寸',
      value: `${width}x${height}`
    },
    {
      title: '测试次数',
      value: iterations
    }
  ];

  const TableHeader = ['-', '-'];
  const TableContent = [];

  TestEnvHeader.forEach((item) => {
    TableContent.push([item.title, item.value]);
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

export const createPerformanceReport = async (
  performanceResultList,
  options
) => {
  const {
    outputPath,
    metricsConfig,
    setting,
    testTime,
    testTools,
    iterations,
    compareMetricsType
  } = options;

  const json = [];

  // console.log('performanceResultList--->', JSON.stringify(performanceResultList));

  const performanceResultMap = performanceResultList.reduce((pre, current) => {
    return {
      ...pre,
      [current.type]: current.result
    };
  }, {});

  json.push({ h1: '性能测试报告' });

  json.push(
    getReportConclusion({
      performanceResultList: performanceResultMap,
      metricsConfig,
      compareMetricsType
    })
  );

  json.push({ h3: '测试环境' });
  json.push(
    getTestEnvTableData({
      ...setting,
      testTime,
      testTools,
      iterations
    })
  );

  json.push({ h3: '指标标准' });
  json.push(getMetricsStandardDataTable(metricsConfig));

  json.push({ h3: '性能测试工具结果对比报告' });
  json.push(
    getToolCompareTableData({
      performanceResultList: performanceResultMap,
      metricsConfig
    })
  );

  await Promise.all(
    performanceResultList.map(async (item) => {
      const { type, result } = item;
      const getToolReportLinkFunc = TOOL_REPORT_LINK_FUNC_MAP[type];

      json.push({ h3: `${type} 具体报告` });
      json.push(
        getToolReportLinkFunc({
          toolOutputPath: options[`${type}Options`].outputPath,
          outputPath,
          result
        })
      );

      const metricsSvgList = await Promise.all(
        getCurrentMetricsStandard(metricsConfig.good).map((key) => getToolCompareChartImg({
          ...item,
          outputPath,
          metricsType: key
        }))
      );

      if (metricsSvgList.length > 0) {
        json.push({ h4: `${type} 折线图` });

        metricsSvgList.forEach(metricsSvg=>{
          json.push(metricsSvg);
        });
      }
    })
  );
  logger.info(
    'report result json--->',
    JSON.stringify(json, null, { space: 2 })
  );

  const content = json2md(json);

  try {
    await createReportPng(content, { outputPath });
  } catch (error) {
    console.log('输出照片发生错误，但是为了不影响后续流程，所以不抛出错误，具体可以自己查看 \n\n', error);
  }

  // console.log('md content--->', content);

  return createReportFile(content, options);
};
