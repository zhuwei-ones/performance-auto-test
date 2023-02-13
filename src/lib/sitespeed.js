import { waterfall } from 'async';
import shelljs from 'shelljs';
import {
  getKeypathFromUrl, getSitespeedCommand,
  getSitespeedReportPath, getSitespeedWebVitals,
  readSitespeedJsonReport
} from '../utils';

export async function runSitespeed(options) {
  const {
    urls, outputPath, sitespeedConfig
  } = options;

  const testResultList = await waterfall(urls.map(url=>{
    return async (preResult = {})=>{
      const urlKey = getKeypathFromUrl(url);
      const currentOutputPath = getSitespeedReportPath(outputPath, urlKey);

      return new Promise((res)=>{
        shelljs.exec(
          getSitespeedCommand(url, {
            ...sitespeedConfig,
            outputFolder: currentOutputPath
          })
        );

        const preUrlResult = preResult[urlKey] || [];
        const runnerResult = readSitespeedJsonReport(currentOutputPath);

        res({
          ...preResult,
          [urlKey]: [...preUrlResult, runnerResult]
        });
      });
    };
  }));

  return getSitespeedWebVitals(testResultList);
}
