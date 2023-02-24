const chromeLauncher = require('chrome-launcher');

import ProgressBar from 'progress';
import {
  createPerformanceReport, getAllOptionsWithDefaultValue, logger, printfPerformanceTestContent
} from './utils';
import { getTaskList, runTasks } from './utils/task';

async function PerformanceTest(options) {
  const currentOptions = getAllOptionsWithDefaultValue(options);
  const { urls, iterations } = currentOptions;
  const bar = new ProgressBar('Website Performance Test [:bar] :percent :elapseds', {
    complete: '=',
    incomplete: ' ',
    width: 40,
    total: urls.length * iterations * 2
  });

  logger.info('开始性能测试');

  printfPerformanceTestContent();

  const taskList = getTaskList(currentOptions);

  // [{type,result}]
  const taskResultList = await runTasks(taskList, {
    onBegin: () => {
      logger.info(`开始 ${1} 能测试`);
    },
    onDone: () => {
      bar.tick(1);
    },
    onAllDone: () => {
      logger.success(`${1} 性能测试 完成`);
    }
  });

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
