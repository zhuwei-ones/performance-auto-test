const chromeLauncher = require('chrome-launcher');

import { runLighthouse } from './lib/lighthouse';
import { runSitespeed } from './lib/sitespeed';
import {
  createPerformanceReport, getAllOptionsWithDefaultValue, logger, printfPerformanceTestContent
} from './utils';

async function PerformanceTest(options) {
  const currentOptions = getAllOptionsWithDefaultValue(options);

  const {
    lighthouseOptions, sitespeedOptions, outputPath,
    setting, testTime, testTools, iterations, metricsConfig
  } = currentOptions;

  logger.info('开始性能测试');

  printfPerformanceTestContent();

  const lighthouseResult = await runLighthouse(lighthouseOptions);

  logger.success('lighthouse性能测试 完成');

  const sitespeedResult = await runSitespeed(sitespeedOptions);

  logger.success('sitespeed性能测试 完成');

  try {
    logger.info('正在输出性能报告');

    const reportPath = await createPerformanceReport({
      lighthouseOptions,
      sitespeedOptions,
      lighthouseResult,
      sitespeedResult,
      outputPath,
      setting,
      testTime,
      testTools,
      iterations,
      metricsConfig
    });

    chromeLauncher.launch({
      startingUrl: `file://${reportPath}`
    });

    logger.success('性能报告输出成功');
  } catch (error) {
    logger.error('性能报告输出失败', error);
    throw error;
  }
}

export default PerformanceTest;
