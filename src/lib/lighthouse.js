const chromeLauncher = require('chrome-launcher');
import lighthouse from 'lighthouse';
import { LIGHTHOUSE_DEFAULT_OPTIONS } from '../const';
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

export async function runLighthouse(url, options) {
  const {
    outputPath, urlKey, urlIndex, lighthouseConfig
  } = options;

  let runnerResult = await launchChromeAndRunLighthouse(
    url,
    null,
    lighthouseConfig
  );

  const audits = runnerResult.lhr.audits;

  await createLighthouseReport({
    url: url,
    urlKey: urlKey,
    index: urlIndex,
    outputPath,
    resultList: runnerResult
  });

  return audits;
}
