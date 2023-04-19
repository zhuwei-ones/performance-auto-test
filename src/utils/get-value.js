import { forEach } from 'lodash';
import {
  ensureDirSync, ensureFileSync, pathExistsSync, readFileSync, readJsonSync
} from 'fs-extra';
import { resolve } from 'path';
import { parse } from 'url';
import {
  CWD,
  METRICS_LIGHTHOUSE_MAP,
  METRICS_SITESPEED_MAP,
  SITESPEED_JSON_RESULT_DIR
} from '../const';
import { logger } from './log';

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
export function getLighthouseReportPath(parentPath, name, index) {
  const htmlFile = `${parentPath}/${name}/${index}.html`;
  const jsonFile = `${parentPath}/${name}/${index}.json`;
  ensureFileSync(jsonFile);
  ensureFileSync(htmlFile);
  return {
    htmlFilePath: htmlFile,
    jsonFilePath: jsonFile
  };
}

export function getSitespeedReportPath(parentPath, name) {
  const dir = `${parentPath}/${name}`;
  ensureDirSync(dir);
  return dir;
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

  path = joinNonEmpty(
    [path, toSafeKey(flattenQueryParams(newUrl.query))],
    '_'
  );
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

export function getLighthouseWebVitals(lighthouseResultList = []) {
  const metricsList = Object.keys(METRICS_LIGHTHOUSE_MAP);
  const allUrls = Object.keys(lighthouseResultList);

  // console.log('lighthouseResultList', lighthouseResultList);

  return allUrls
    .reduce((pre, key)=>{
      // 每个url的数组

      const result = lighthouseResultList[key];
      const resultList = result?.resultList || [];
      const urlMetrics = pre;
      const iterations = resultList.length;

      const currentUrlMetircs = resultList
        // 性能结果对象数组 精简成 6大性能指标数组
        .map((re)=>{
          const audits = re;

          // console.log('audits', audits);

          // 把6大性能指标提取出来
          return metricsList
            .reduce((preValue, metricsKey)=>{
              const name = METRICS_LIGHTHOUSE_MAP[metricsKey];
              return {
                ...preValue,
                [metricsKey]: +(audits[name]?.numericValue?.toFixed(3) || -0.1)
              };
            }, {});
        })
        // 把所有结果相同指标合并
        .reduce((preValue, currentValue)=>{
          const values = {};
          metricsList.forEach(mts=>{
            const preVal = preValue[mts] || 0;
            values[mts] = preVal + currentValue[mts];
          });
          return values;
        }, {});

      // 单个url 测试的指标取平均值
      forEach(currentUrlMetircs, (value, metircsKey)=>{
        currentUrlMetircs[metircsKey] = (value / iterations).toFixed(3);
      });

      urlMetrics[key] = {
        url: result.url,
        metircs: currentUrlMetircs
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
  const metricsList = Object.keys(METRICS_SITESPEED_MAP);
  const allUrls = Object.keys(sitespeedResultList);

  // console.log('sitespeedResultList', sitespeedResultList);

  return allUrls
    .reduce((pre, url)=>{
      const result = sitespeedResultList[url];
      const resultList = result?.resultList || [];
      const googleWebVitals = resultList?.[0].googleWebVitals;
      const urlMetrics = pre;

      const currentUrlMetircs = metricsList.reduce((preInfo, mtsKey)=>{
        const googleWebVitalsKey = METRICS_SITESPEED_MAP[mtsKey];
        return {
          ...preInfo,
          [mtsKey]: googleWebVitals?.[googleWebVitalsKey]?.median || -0.1
        };
      }, {});

      urlMetrics[url] = {
        url: result.url,
        metircs: currentUrlMetircs
      };

      return urlMetrics;
    }, {});
}
