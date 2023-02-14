import { writeFile, writeJson } from 'fs-extra';

export async function createLighthouseReport(lighthouseResultList, { getReportOutputPath }) {
  // runnerResult.lhr.categories.performance.score * 100

  return Promise.all(Object.keys(lighthouseResultList).map(key=>{
    const resultList = lighthouseResultList[key]?.resultList;

    return resultList.map((result, index)=>{
      const { report: reportHtml, ...rest } = result;
      const { htmlFilePath, jsonFilePath } = getReportOutputPath(key, index + 1);
      return Promise.all([
        writeFile(htmlFilePath, reportHtml),
        writeJson(jsonFilePath, rest, { spaces: 4 })
      ]);
    });
  }).flat());
}
