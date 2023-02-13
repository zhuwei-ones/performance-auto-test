import { writeFile } from 'fs-extra';

export async function createLighthouseReport(lighthouseResultList, { getReportOutputPath }) {
  // runnerResult.lhr.categories.performance.score * 100

  return Promise.all(Object.keys(lighthouseResultList).map(key=>{
    const resultList = lighthouseResultList[key];

    return resultList.map((result, index)=>{
      const reportHtml = result.report;
      return writeFile(getReportOutputPath(key, index + 1), reportHtml);
    });
  }).flat());
}
