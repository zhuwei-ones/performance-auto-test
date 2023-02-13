const chromeLauncher = require('chrome-launcher');
import lighthouse from 'lighthouse';
import { LIGHTHOUSE_CONFIG, LIGHTHOUSE_DEFAULT_OPTIONS } from '../const';
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
  const { urls, iterations, outputPath } = options;

  const runUrllist = urls.map(url=>{
    return new Array(iterations).fill(url);
  }).flat();

  const testhouseResultList = await waterfall(runUrllist.map((url)=>{
    return async (preResult = {})=>{
      const urlKey = getKeypathFromUrl(url);
      const runnerResult = await launchChromeAndRunLighthouse(
        url,
        null,
        LIGHTHOUSE_CONFIG
      );

      const preUrlResult = preResult[urlKey] || [];

      return {
        ...preResult,
        [urlKey]: [...preUrlResult, runnerResult]
      };
    };
  }));

  await createLighthouseReport(testhouseResultList, {
    getReportOutputPath: (pageUrl, index)=>{
      return getLighthouseReportPath(outputPath, pageUrl, index);
    }
  });

  return getLighthouseWebVitals(testhouseResultList);
}
