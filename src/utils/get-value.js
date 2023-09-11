import { forEach } from 'lodash';
import {
  ensureDirSync,
  ensureFileSync,
  pathExistsSync,
  readFileSync,
  readJsonSync
} from 'fs-extra';
import { resolve } from 'path';
import { parse } from 'url';
import _ from 'lodash';

import {
  COMPARE_METRICS_TYPE_MAP,
  CWD,
  METRICS_LIGHTHOUSE_MAP,
  METRICS_SECOND_UNIT,
  METRICS_SITESPEED_MAP,
  METRICS_STANDARD_MAP,
  PERFORMANCE_TOOLS_MAP,
  SITESPEED_JSON_RESULT_DIR
} from '../const';
import { logger } from './log';

export function isValidNumber(value) {
  return _.isNumber(+value) && !_.isNaN(+value) && !_.isNil(value);
}

export function getValueRange(value, bestValue, worstValue) {
  if (
    !isValidNumber(value)
    || !isValidNumber(bestValue)
    || !isValidNumber(worstValue)
  ) {
    return '';
  }
  if (value < bestValue) {
    return 'good';
  }
  if (value > worstValue) {
    return 'bad';
  }
  return 'middle';
}

export function getAbsolutePath(_path) {
  return resolve(CWD, _path);
}

export function getConfigJson(path) {
  if (!path) {
    return null;
  }

  const abPath = getAbsolutePath(path);

  try {
    if (pathExistsSync(abPath)) {
      const content = readFileSync(abPath);
      const currentContent = content.toString();

      if (currentContent) {
        const configData = JSON.parse(currentContent);
        return configData;
      }

      return null;
    }

    return null;
  } catch (error) {
    console.log('解析配置文件失败', error);
    return null;
  }
}

export function getRelativePath(path) {
  return path.replace(`${CWD}/`, '');
}

// dir/time/tool-name/
export function getLighthouseReportPath({
  outputPath, name, index, saveAllJson, saveAssetJson, saveReport2Png, isSaveUnAprroveReport
}) {
  const prefixPath = `${outputPath}/${name}/${index}`;
  const result = {};

  if (saveReport2Png) {
    result.pngFilePath = `${prefixPath}.png`;
    ensureFileSync(result.pngFilePath);
  } else {
    result.htmlFilePath = `${prefixPath}.html`;
    ensureFileSync(result.htmlFilePath);
  }

  if (saveAllJson || isSaveUnAprroveReport) {
    result.allJsonFilePath = `${prefixPath}.all.json`;
    ensureFileSync(result.allJsonFilePath);
  }

  if (saveAssetJson) {
    result.assetJsonFilePath = `${prefixPath}.trace.json`;
    ensureFileSync(result.assetJsonFilePath);
  }

  return result;
}

export function getSitespeedReportPath(parentPath, name) {
  const dir = `${parentPath}/${name}`;
  ensureDirSync(dir);
  return dir;
}

/**
 * 计算数组百分位数
 * @param {Array} arr 数组
 * @param {Number} percentile 百分位数，范围 0-100
 */
export function getArrPercentile(arr, percentile) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return undefined;
  }

  let sortedArr = arr.slice().sort((a, b) => a - b);
  let len = sortedArr.length;

  // 计算索引位置
  const fraction = (len * percentile) / 100;
  let index = Math.ceil(fraction);

  // 处理一些边界情况
  if (index >= len) {
    return sortedArr[len - 1];
  }
  if (index <= 0) {
    return sortedArr[0];
  }
  if (len < 2) {
    return sortedArr[0];
  }

  return sortedArr[index - 1];
}

export function json2CliOptions(params) {
  const cliOptions = [];
  const list = Object.keys(params);

  for (let index = 0; index < list?.length; index += 1) {
    let key = list[index];
    const currentVal = params[key];

    // 值为 false 忽略
    if (currentVal === false || currentVal === 'false') {
      continue;
    }

    cliOptions.push('--' + key);

    // 值不是 true，压入选项的值
    if (currentVal && currentVal !== true && currentVal !== 'true') {
      cliOptions.push(currentVal);
    }
  }

  return cliOptions;
}

function joinNonEmpty(strings, delimeter) {
  return strings.filter(Boolean).join(delimeter);
}

function toSafeKey(key) {
  if (!key) return '';
  // U+2013 : EN DASH – as used on https://en.wikipedia.org/wiki/2019–20_coronavirus_pandemic
  return key.replace(/[.~ /+|,?&%–:)(]|%7C/g, '_');
}

export function getKeypathFromUrl(url, includeQueryParams, useHash, group) {
  function flattenQueryParams(params) {
    if (!params) {
      return '';
    }
    return Object.keys(params).reduce(
      (result, key) => joinNonEmpty([result, key, params[key]], '_'),
      ''
    );
  }

  const newUrl = parse(url, !!includeQueryParams);

  let path = toSafeKey(newUrl.pathname);

  path = joinNonEmpty([path, toSafeKey(flattenQueryParams(newUrl.query))], '_');
  path = joinNonEmpty([path, toSafeKey(newUrl.hash)], '_');

  const keys = [toSafeKey(group || newUrl.host), path];

  return joinNonEmpty(keys, '_');
}

export function getSitespeedCommand(url, options = {}) {
  const currentOptions = json2CliOptions(options).join(' ');

  const command = `
   npx  sitespeed.io ${url} ${currentOptions}  
  `;

  logger.info(`sitespeed command--> ${command}`);

  return command;
}

// 把6大性能指标提取出来
export function getLighthouseWebVital(result) {
  const metricsList = Object.keys(METRICS_LIGHTHOUSE_MAP);
  return metricsList.reduce((preValue, metricsKey) => {
    const name = METRICS_LIGHTHOUSE_MAP[metricsKey];
    let value = Number(result?.[name]?.numericValue?.toFixed(3));

    // 同一把所有指标都统一成一个单位
    if (value && METRICS_SECOND_UNIT.includes(metricsKey)) {
      value *= 1000;
    }

    return {
      ...preValue,
      [metricsKey]: value ?? -0.1
    };
  }, {});
}

// 把6大性能指标提取出来
export function getSitespeedWebVital(result) {
  const metricsList = Object.keys(METRICS_SITESPEED_MAP);
  const googleWebVitals = result.googleWebVitals;
  const currentUrlMetircs = metricsList.reduce((preInfo, mtsKey) => {
    const googleWebVitalsKey = METRICS_SITESPEED_MAP[mtsKey];
    const value = Number(googleWebVitals?.[googleWebVitalsKey]?.median);

    // 同一把所有指标都统一成一个单位
    if (value && METRICS_SECOND_UNIT.includes(mtsKey)) {
      value *= 1000;
    }

    return {
      ...preInfo,
      [mtsKey]: value ?? -0.1
    };
  }, {});
  return currentUrlMetircs;
}

const RESULT_DEAL_MAP = {
  [PERFORMANCE_TOOLS_MAP.SITESPEED]: getSitespeedWebVital,
  [PERFORMANCE_TOOLS_MAP.LIGHTHOUSE]: getLighthouseWebVital
};

export function getRunnerResultWebVitals({ type, result }) {
  const func = RESULT_DEAL_MAP[type];
  return func?.(result) || result;
}

export function getLighthouseWebVitals(lighthouseResultList = []) {
  const metricsList = Object.keys(METRICS_LIGHTHOUSE_MAP);
  const allUrls = Object.keys(lighthouseResultList);

  return allUrls.reduce((pre, key) => {
    // 每个url的数组

    const result = lighthouseResultList[key];
    const resultList = result?.resultList || [];
    const urlMetrics = pre;
    const iterations = resultList.length;

    const currentUrlMetircs = resultList
      // 性能结果对象数组 精简成 6大性能指标数组
      .map((re) => getLighthouseWebVital(re));

    const avgMetircs = currentUrlMetircs
      // 把所有结果相同指标相加合并
      .reduce((preValue, currentValue) => {
        const values = {};
        metricsList.forEach((mts) => {
          const preVal = preValue[mts] || 0;
          values[mts] = preVal + currentValue[mts];
        });
        return values;
      }, {});

    // currentUrlMetircs = [{LCP:0,CLS:0,FCP:0,FID:0,FCP:0,SI:0,TBT:0}]
    const metircsAllList = currentUrlMetircs.reduce((preValue, currentValue) => {
      const values = {};
      metricsList.forEach((mts) => {
        const preVal = preValue[mts] || [];
        values[mts] = [...preVal, currentValue[mts]];
      });
      return values;
    }, {});

    const percentiles = {};
    Object.keys(metircsAllList).forEach((metircsKey) => {
      const arr = metircsAllList[metircsKey];
      const percentile75 = getArrPercentile(arr, 75).toFixed(3);
      const percentile90 = getArrPercentile(arr, 90).toFixed(3);
      percentiles[`${metircsKey}_75`] = percentile75;
      percentiles[`${metircsKey}_90`] = percentile90;
      percentiles[`${metircsKey}List`] = arr;
    });

    // 单个url 测试的指标取平均值
    forEach(avgMetircs, (value, metircsKey) => {
      avgMetircs[metircsKey] = (value / iterations).toFixed(3);
    });

    urlMetrics[key] = {
      url: result.url,
      metircs: { ...avgMetircs, ...percentiles }
    };

    return urlMetrics;
  }, {});
}

export function readSitespeedJsonReport(dir) {
  const jsonPath = `${dir}/${SITESPEED_JSON_RESULT_DIR}`;

  if (!pathExistsSync(jsonPath)) {
    return {};
  }

  const json = readJsonSync(jsonPath);
  return json;
}

export function getSitespeedWebVitals(sitespeedResultList) {
  const allUrls = Object.keys(sitespeedResultList);

  // console.log('sitespeedResultList', sitespeedResultList);

  return allUrls.reduce((pre, url) => {
    const result = sitespeedResultList[url];
    const resultList = result?.resultList || [];
    // const googleWebVitals = resultList?.[0].googleWebVitals;
    const urlMetrics = pre;

    const currentUrlMetircs = getSitespeedWebVital(resultList?.[0]);

    urlMetrics[url] = {
      url: result.url,
      metircs: currentUrlMetircs
    };

    return urlMetrics;
  }, {});
}

export function getCurrentMetricsStandard(metricsOptions) {
  return METRICS_STANDARD_MAP.filter((key) => {
    const value = metricsOptions[key.toLowerCase()];
    return typeof value !== 'undefined';
  });
}

export function getMetricsValueByCompareType(metircs, metricsKey, compareMetricsType) {
  if (compareMetricsType === COMPARE_METRICS_TYPE_MAP.AVG) {
    return metircs?.[metricsKey];
  }

  return metircs?.[`${metricsKey}_${compareMetricsType.slice(1)}`];
}

export function kbToMb(kb) {
  const mb = kb / 1024; // 将 KB 转换为 MB

  if (mb <= 1) {
    return kb + ' KB';
  }
  return mb + ' MB';
}
