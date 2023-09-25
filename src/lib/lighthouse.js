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
    outputPath, urlKey, urlIndex, lighthouseConfig, lighthouseOptions, metricsConfig
  } = options;

  const {
    pure
  } = lighthouseConfig;

  let runnerResult = await launchChromeAndRunLighthouse(
    url,
    lighthouseOptions,
    lighthouseConfig
  );

  const audits = runnerResult.lhr.audits;

  // 纯净模式，不保存每次测试的具体报告
  if (!pure) {
    await createLighthouseReport({
      url: url,
      urlKey: urlKey,
      index: urlIndex,
      outputPath,
      resultList: runnerResult,
      lighthouseConfig,
      metricsConfig
    });
  }

  runnerResult = null;

  return audits;
}
