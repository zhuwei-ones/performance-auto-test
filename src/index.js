const chromeLauncher = require('chrome-launcher');

import {
  createPerformanceReport, getAllOptionsWithDefaultValue, logger, printfPerformanceTestContent
} from './utils';
import { getTaskList, runTasks } from './utils/task';

async function PerformanceTest(options) {
  const currentOptions = getAllOptionsWithDefaultValue(options);

  logger.info('开始性能测试');

  printfPerformanceTestContent();

  const taskList = getTaskList(currentOptions);

  // [{type,result}]
  const taskResultList = await runTasks(taskList);

  try {
    logger.info('正在输出性能报告');

    const reportPath = await createPerformanceReport(taskResultList, currentOptions);

    await chromeLauncher.launch({
      startingUrl: `file://${reportPath}`
    });
    logger.success('性能报告输出成功');
  } catch (error) {
    logger.error('性能报告输出失败', error);
    throw error;
  }
}

export default PerformanceTest;
