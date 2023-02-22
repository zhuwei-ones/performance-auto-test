import { writeFile, writeJson } from 'fs-extra';
import { getLighthouseReportPath } from './get-value';

export async function createLighthouseReport(options) {
  // runnerResult.lhr.categories.performance.score * 100

  const {
    urlKey, index, outputPath, resultList
  } = options;

  const { report: reportHtml, ...rest } = resultList;
  const { htmlFilePath, jsonFilePath } = getLighthouseReportPath(outputPath, urlKey, index);
  return Promise.all([
    writeFile(htmlFilePath, reportHtml),
    writeJson(jsonFilePath, rest, { spaces: 4 })
  ]);
}
