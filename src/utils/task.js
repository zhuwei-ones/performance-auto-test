import { waterfall } from 'async';
import ProgressBar from 'progress';
import { PERFORMANCE_TOOLS_LIST, PERFORMANCE_TOOLS_MAP } from '../const';
import { runLighthouse } from '../lib/lighthouse';
import { runSitespeed } from '../lib/sitespeed';
import { getLighthouseWebVitals, getRunnerResultWebVitals, getSitespeedWebVitals } from './get-value';
import { logger } from './log';

const TASK_MAP = {
  [PERFORMANCE_TOOLS_MAP.SITESPEED]: runSitespeed,
  [PERFORMANCE_TOOLS_MAP.LIGHTHOUSE]: runLighthouse
};

const TASK_RESULT_FUNC_MAP = {
  [PERFORMANCE_TOOLS_MAP.LIGHTHOUSE]: getLighthouseWebVitals,
  [PERFORMANCE_TOOLS_MAP.SITESPEED]: getSitespeedWebVitals
};

export async function runTask(func, { options, lifecycles } = {}) {
  const {
    onDone, onError, onBegin, onEnd
  } = lifecycles;

  const { tool, url, index } = options;

  try {
    onBegin?.({ tool, url });
    logger.info(`${tool} 开始第 ${index} 次测试 ${url} `);

    // 测试工具的报告
    const runnerResult = await func();
    const { interrupt = false } = await onDone?.({
      tool, url, index, result: getRunnerResultWebVitals({ type: tool, result: runnerResult })
    }) || {};
    logger.success(`${tool} 测试 ${url} ，第 ${index} 次完成 `);

    return {
      runnerResult,
      interrupt
    };
  } catch (error) {
    onError?.(error);
    logger.error(`${tool} 测试第 ${index} 次 ${url} 失败 `, error);
    throw error;
  } finally {
    onEnd?.({ tool });
  }
}

// 跑所有工具性能测试
export async function runPerformanceTasks(taskList, lifecycles = {}) {
  if (taskList?.length < 1) {
    return [];
  }

  // 工具按顺序执行
  const performanceResult = await waterfall(
    taskList.map((taskItem)=>{
      return async (preToolResult)=>{
        const { type, options: taskOptions } = taskItem;
        const { urls } = taskOptions;
        const taskFunc = TASK_MAP[type];

        const progressBar = new ProgressBar(`${type} Runing [:bar] :percent :etas`, {
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: urls.length
        });

        // url 按顺序测试
        const currentToolResult = await waterfall(
          urls.map(({ url, urlKey, index })=>{
            return async (preUrlTestResult = {})=>{
              const { interrupt = false } = preUrlTestResult;

              // 如果上一个url已经终止，剩余的url不再测试
              if (interrupt) {
                return preUrlTestResult;
              }

              // runTask 会返回是否终止后续测试
              const runResult = await runTask(async ()=>{
                // 单次报告的测试结果
                const result = await taskFunc(url, {
                  ...taskOptions,
                  urlIndex: index,
                  urlKey: urlKey
                });

                progressBar.tick(1);

                return result;
              }, {
                options: {
                  tool: type, url, index
                },
                lifecycles
              });

              const { runnerResult } = runResult;
              const preResult = preUrlTestResult?.[urlKey]?.resultList || [];
              const finallyResult = [...preResult, runnerResult];

              return {
                ...preUrlTestResult,
                [urlKey]: {
                  url,
                  resultList: finallyResult
                },
                interrupt: runResult.interrupt
              };
            };
          })
        );

        delete currentToolResult.interrupt;

        return {
          ...preToolResult,
          [type]: currentToolResult
        };
      };
    })
  );
  return performanceResult;
}

// 处理工具测试结果
export async function getTaskResult(taskResultList = []) {
  if (Object.keys(taskResultList).length < 1) {
    return [];
  }

  return Promise.all(
    Object.keys(taskResultList).map((taskType)=>{
      const taskResult = taskResultList[taskType];
      const taskResultFunc = TASK_RESULT_FUNC_MAP[taskType];
      return {
        type: taskType,
        result: taskResultFunc(taskResult)
      };
    })
  );
}

export function getTaskList(options = []) {
  const taskList = [];
  PERFORMANCE_TOOLS_LIST.forEach((toolType)=>{
    const toolOptions = options[`${toolType}Options`];
    if (toolOptions) {
      taskList.push({
        type: toolType,
        options: toolOptions
      });
    }
  });
  return taskList;
}

export async function runTasks(task, lifecycles = {}) {
  const {
    onAllDone
  } = lifecycles;

  const taskResultList = await runPerformanceTasks(task, lifecycles);

  const finalResult = await getTaskResult(taskResultList);

  onAllDone?.();

  return finalResult;
}
