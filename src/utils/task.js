import { waterfall } from 'async';
import ProgressBar from 'progress';
import { PERFORMANCE_TOOLS_LIST, PERFORMANCE_TOOLS_MAP } from '../const';
import { runLighthouse } from '../lib/lighthouse';
import { runSitespeed } from '../lib/sitespeed';
import { getLighthouseWebVitals, getSitespeedWebVitals } from './get-value';
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
    logger.info(`${tool} 开始第${index} 次测试 ${url}} `);
    const result = await func();
    onDone?.({ tool, url });
    logger.success(`${tool} 测试 ${url}} ，第${index} 次完成`);
    return result;
  } catch (error) {
    onError?.(error);
    logger.error(`${tool} 测试第${index} 次 ${url}} 失败`, error);
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
              return runTask(async ()=>{
                const runnerResult = await taskFunc(url, {
                  ...taskOptions,
                  urlIndex: index,
                  urlKey: urlKey
                });

                progressBar.tick(1);

                return {
                  ...preUrlTestResult,
                  [urlKey]: {
                    url,
                    resultList: [...(preUrlTestResult?.[urlKey]?.resultList || []), runnerResult]
                  }
                };
              }, { options: { tool: type, url, index }, lifecycles });
            };
          })
        );

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
