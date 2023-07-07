import { writeFile, writeJson } from 'fs-extra';
import { getLighthouseReportPath } from './get-value';

export async function createLighthouseReport(options) {
  // runnerResult.lhr.categories.performance.score * 100

  const {
    urlKey, index, outputPath, resultList, lighthouseConfig
  } = options;

  const { saveAllJson, saveAssets } = lighthouseConfig;

  const { report: reportHtml, ...rest } = resultList;
  const { htmlFilePath, allJsonFilePath, assetJsonFile } = getLighthouseReportPath(outputPath, urlKey, index);

  const writeTasks = [writeFile(htmlFilePath, reportHtml)];

  if (saveAllJson) {
    writeTasks.push(
      writeJson(allJsonFilePath, rest, { spaces: 4 })
    );
  } else if (saveAssets) {
    // 是否保存 trace json
    writeTasks.push(
      writeJson(assetJsonFile, resultList.artifacts, { spaces: 4 })
    );
  }

  return Promise.all(writeTasks);
}
