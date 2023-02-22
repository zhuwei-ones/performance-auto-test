const chromeLauncher = require('chrome-launcher');
import lighthouse from 'lighthouse';
import { LIGHTHOUSE_DEFAULT_OPTIONS } from '../const';
import {
  getKeypathFromUrl, getLighthouseReportPath, getLighthouseWebVitals
} from '../utils';
import { waterfall } from 'async';
import { createLighthouseReport } from '../utils/file';

const launchChromeAndRunLighthouse = async (url, options, config) => {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless']
  });

  const runnerResult = await lighthouse(
    url,
    {
      port: chrome.port,
      ...LIGHTHOUSE_DEFAULT_OPTIONS,
      ...options
    },
    config
  );

  await chrome.kill();

  return runnerResult;
};

export async function runLighthouse(options) {
  const {
    urls, iterations, outputPath, lighthouseConfig
  } = options;

  const runUrllist = urls.map(url=>{
    return new Array(iterations).fill(0).map((_, index)=>({ url: url, index: index + 1 }));
  }).flat();

  const testhouseResultList = await waterfall(runUrllist.map(({ url, index })=>{
    return async (preResult = {})=>{
      const urlKey = getKeypathFromUrl(url);
      let runnerResult = await launchChromeAndRunLighthouse(
        url,
        null,
        lighthouseConfig
      );

      const audits = runnerResult.lhr.audits;
      const preUrlResult = preResult[urlKey] || {};

      await createLighthouseReport({
        url: url,
        urlKey: urlKey,
        index: index,
        outputPath,
        resultList: runnerResult
      });

      return {
        ...preResult,
        [urlKey]: {
          url: url,
          resultList: [...preUrlResult.resultList || [], {
            lhr: {
              audits: audits
            }
          }]
        }
      };
    };
  }));

  return getLighthouseWebVitals(testhouseResultList);
}
