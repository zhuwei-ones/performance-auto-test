import { writeFile, writeJson } from 'fs-extra';
import { createPngFormHtml } from './common';
import { getLighthouseReportPath } from './get-value';

export async function createLighthouseReport(options) {
  // runnerResult.lhr.categories.performance.score * 100

  const {
    urlKey, index, outputPath, resultList, lighthouseConfig
  } = options;

  const { saveAllJson, saveAssets, saveReport2Png } = lighthouseConfig;

  const { report: reportHtml, ...rest } = resultList;
  const {
    htmlFilePath, pngFilePath, allJsonFilePath, assetJsonFilePath
  } = getLighthouseReportPath({
    outputPath,
    name: urlKey,
    index,
    saveAllJson,
    saveAssets,
    saveReport2Png
  });

  const writeTasks = [];

  if (saveReport2Png) {
    writeTasks.push(createPngFormHtml({ outputPath: pngFilePath, htmlContent: reportHtml }));
  } else {
    writeTasks.push(writeFile(htmlFilePath, reportHtml));
  }

  if (saveAllJson) {
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
