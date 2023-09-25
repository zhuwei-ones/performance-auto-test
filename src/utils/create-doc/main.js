import dayjs from 'dayjs';
import json2md from 'json2md';
import { METRICS_REPORT_MAP } from '../../const';
import {
  getCurrentMetricsStandard, getMetricsValueByCompareType, getValueRange, isValidNumber, kbToMb
} from '../get-value';
import { logger } from '../log';
import {
  createReportFile, createReportPng, getToolCompareChartImg, TOOL_REPORT_LINK_FUNC_MAP
} from './utils';

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
          // 毫秒 转成 秒 单位
          pageMetricsAvg = (pageMetricsAvg / 1000).toFixed(3);
          pageMetrics75 = (pageMetrics75 / 1000).toFixed(3);
          pageMetrics90 = (pageMetrics90 / 1000).toFixed(3);

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

  // json.push({ h3: '性能测试工具结果对比报告' });
  // json.push(
  //   getToolCompareTableData({
  //     performanceResultList: performanceResultMap,
  //     metricsConfig
  //   })
  // );

  await Promise.all(
    performanceResultList.map(async (item) => {
      const { type, result } = item;
      const getToolReportLinkFunc = TOOL_REPORT_LINK_FUNC_MAP[type];

      // json.push({ h3: `${type} 具体报告` });
      // json.push(
      //   getToolReportLinkFunc({
      //     toolOutputPath: options[`${type}Options`].outputPath,
      //     outputPath,
      //     result,
      //     options: options[`${type}Options`]
      //   })
      // );

      const svgList = getCurrentMetricsStandard(metricsConfig.good).map((key) => {
        return getToolCompareChartImg({
          ...item,
          outputPath,
          metricsType: key
        });
      });

      const metricsSvgList = await Promise.all(svgList);

      if (metricsSvgList.length > 0) {
        json.push({ h4: `${type} 折线图` });

        metricsSvgList.forEach((metricsSvg) => {
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
    console.log(
      '输出照片发生错误，但是为了不影响后续流程，所以不抛出错误，具体可以自己查看 \n\n',
      error
    );
  }

  // console.log('md content--->', content);

  return createReportFile(content, options);
};
