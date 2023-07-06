const chromeLauncher = require('chrome-launcher');
import lighthouse from 'lighthouse';
import { createLighthouseReport } from '../utils/file';

const launchChromeAndRunLighthouse = async (url, options, config) => {
  const { chromeFlags } = options;
  const chrome = await chromeLauncher.launch({
    chromeFlags
  });

  const runnerResult = await lighthouse(
    url,
    {
      port: chrome.port,
      ...options
    },
    config
  );

  await chrome.kill();

  return runnerResult;
};

export async function runLighthouse(url, options) {
  const {
    outputPath, urlKey, urlIndex, lighthouseConfig, lighthouseOptions
  } = options;

  let runnerResult = await launchChromeAndRunLighthouse(
    url,
    lighthouseOptions,
    lighthouseConfig
  );

  const audits = runnerResult.lhr.audits;

  await createLighthouseReport({
    url: url,
    urlKey: urlKey,
    index: urlIndex,
    outputPath,
    resultList: runnerResult,
    lighthouseConfig
  });

  runnerResult = null;

  return audits;
}
