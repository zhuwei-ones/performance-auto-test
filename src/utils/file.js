import { writeFile, writeJson } from 'fs-extra';
import { getLighthouseReportPath } from './get-value';

export async function createLighthouseReport(options) {
  // runnerResult.lhr.categories.performance.score * 100

  const {
    urlKey, index, outputPath, resultList, lighthouseConfig
  } = options;

  const { saveAllJson, saveAssets } = lighthouseConfig;

  const { report: reportHtml, ...rest } = resultList;
  const { htmlFilePath, allJsonFilePath, assetJsonFilePath } = getLighthouseReportPath({
    outputPath,
    name: urlKey,
    index,
    saveAllJson,
    saveAssets
  });

  const writeTasks = [writeFile(htmlFilePath, reportHtml)];

  console.log('saveAllJson', saveAllJson, allJsonFilePath);

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
