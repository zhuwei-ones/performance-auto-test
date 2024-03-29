import { writeFile, writeJson } from 'fs-extra';
import { METRICS_LIGHTHOUSE_MAP } from '../const';
import { createPngFormHtml } from './common';
import { getCurrentMetricsStandard, getLighthouseReportPath } from './get-value';

export async function createLighthouseReport(options) {
  // runnerResult.lhr.categories.performance.score * 100

  const {
    urlKey, index, outputPath, resultList, lighthouseConfig, metricsConfig
  } = options;

  const audits = resultList.lhr.audits;
  const goodMetrics = metricsConfig?.good;

  // 判断这次报告是否通过，不过不通过则保存详情json数据
  const isSaveUnAprroveReport = !goodMetrics ? false
    : getCurrentMetricsStandard(goodMetrics).some(metricsName=>{
      const keyName = METRICS_LIGHTHOUSE_MAP[metricsName];
      let value = audits[keyName]?.numericValue;
      const standardValue = goodMetrics[metricsName.toLocaleLowerCase()];
      if (value && standardValue) {
        return +value.toFixed(3) > standardValue;
      }
      return false;
    });

  const {
    saveAllJson, saveAssets, saveReport2Png
  } = lighthouseConfig;
  const { report: reportHtml, ...rest } = resultList;
  const {
    htmlFilePath, pngFilePath, allJsonFilePath, assetJsonFilePath
  } = getLighthouseReportPath({
    outputPath,
    name: urlKey,
    index,
    saveAllJson,
    saveAssets,
    saveReport2Png,
    isSaveUnAprroveReport
  });

  const writeTasks = [];

  if (saveReport2Png) {
    writeTasks.push(createPngFormHtml({ outputPath: pngFilePath, htmlContent: reportHtml }));
  } else {
    writeTasks.push(writeFile(htmlFilePath, reportHtml));
  }

  if (saveAllJson || isSaveUnAprroveReport) {
    writeTasks.push(
      writeJson(allJsonFilePath, rest, { spaces: 4 })
    );
  } else if (saveAssets) {
    // 是否保存 trace json
    writeTasks.push(
      writeJson(assetJsonFilePath, resultList.artifacts, { spaces: 4 })
    );
  }

  return Promise.all(writeTasks);
}
