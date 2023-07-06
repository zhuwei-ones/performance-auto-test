import { writeFile, writeJson } from 'fs-extra';
import { getLighthouseReportPath } from './get-value';

export async function createLighthouseReport(options) {
  // runnerResult.lhr.categories.performance.score * 100

  const {
    urlKey, index, outputPath, resultList, lighthouseConfig
  } = options;

  const { report: reportHtml } = resultList;
  const { htmlFilePath, jsonFilePath } = getLighthouseReportPath(outputPath, urlKey, index);

  const writeTasks = [
    writeFile(htmlFilePath, reportHtml)
  ];

  // 是否保存 trace json
  if (lighthouseConfig.saveAssets) {
    writeTasks.push(writeJson(jsonFilePath, resultList.artifacts, { spaces: 4 }));
  }

  return Promise.all(writeTasks);
}
