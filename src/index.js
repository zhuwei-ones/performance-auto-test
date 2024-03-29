const chromeLauncher = require('chrome-launcher');

import {
  createPerformanceReport, getAllOptionsWithDefaultValue, logger
} from './utils';
import { getTaskList, runTasks } from './utils/task';

async function PerformanceTest(options) {
  const currentOptions = getAllOptionsWithDefaultValue(options);

  const { preview } = currentOptions;

  logger.info('开始性能测试');

  logger.info('性能测试参数---->', currentOptions);

  const taskList = getTaskList(currentOptions);

  // [{type,result}]
  const taskResultList = await runTasks(taskList, {
    onDone: currentOptions.onDone,
    onBegin: currentOptions.onBegin,
    onError: currentOptions.onError,
    onEnd: currentOptions.onEnd,
    onAllDone: currentOptions.onAllDone
  });

  try {
    logger.info('正在输出性能报告');

    const reportPath = await createPerformanceReport(taskResultList, currentOptions);

    if (preview) {
      await chromeLauncher.launch({
        startingUrl: `file://${reportPath}`
      });
    }
    logger.success('性能报告输出成功');
  } catch (error) {
    logger.error('性能报告输出失败', error);
    throw error;
  }
}

export default PerformanceTest;
