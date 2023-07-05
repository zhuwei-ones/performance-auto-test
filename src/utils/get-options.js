import Joi from 'joi';
import { isNil, omitBy } from 'lodash';
import {
  COMMON_TEST_CONFIG, COMPARE_METRICS_TYPE_MAP, DEFAULT_LIGHTHOUSE_REPORT_DIR,
  DEFAULT_REPORT_DIR,
  DEFAULT_SITESPEED_REPORT_DIR, LIGHTHOUSE_DEFAULT_CONFIG,
  LIGHTHOUSE_DEFAULT_OPTIONS,
  METRICS_CONFIG,
  PERFORMANCE_TOOLS_LIST,
  PERFORMANCE_TOOLS_MAP, REPORT_TYPE_MAP, SITESPEED_DEFAULT_CONFIG
} from '../const';
import { getAbsolutePath, getKeypathFromUrl } from './get-value';

export function verifyOptions(options = {}) {
  const schema = Joi.object({
    urls: Joi.array().items(Joi.string().uri().required()).single()
      .required(),
    iterations: Joi.number(),
    outputPath: Joi.string(),
    metricsConfig: Joi.object(),
    lighthouseConfig: Joi.object(),
    sitespeedConfig: Joi.object(),
    setting: Joi.object(),
    lighthouse: Joi.boolean(),
    sitespeed: Joi.boolean(),
    reportType: [...Object.values(REPORT_TYPE_MAP)],
    compareMetricsType: [...Object.values(COMPARE_METRICS_TYPE_MAP)]
  });

  const result = schema.validate(options);

  if (result.error) {
    throw result.error;
  }

  return result.value;
}

export function getLighthouseOptions(optoins = {}) {
  const {
    urls, iterations, outputPath, setting, lighthouseConfig = {}
  } = optoins;

  const {
    chromeFlags, onlyCategories, output, extraHeaders, ...configRest
  } = lighthouseConfig;

  const lighthouseOptions = {
    chromeFlags, onlyCategories, output, extraHeaders
  };

  return {
    urls: urls.map(url=>{
      return new Array(iterations).fill(0)
        .map((_, index)=>({ url, index: index + 1, urlKey: getKeypathFromUrl(url) }));
    }).flat(),
    iterations,
    outputPath: `${outputPath}/${DEFAULT_LIGHTHOUSE_REPORT_DIR}`,
    lighthouseConfig: {
      ...LIGHTHOUSE_DEFAULT_CONFIG,
      ...configRest,
      settings: {
        ...LIGHTHOUSE_DEFAULT_CONFIG.settings,
        ...configRest.settings,
        throttling: { // constants.throttling.desktopDense4G,
          ...LIGHTHOUSE_DEFAULT_CONFIG.settings.throttling,
          ...(configRest?.settings?.throttling || {}),
          rttMs: setting.latency, // Round-Trip Time，往返时延，从发送端发送数据开始，到发送端收到来自接收端的确认
          requestLatencyMs: setting.latency, // 0 means unset
          downloadThroughputKbps: setting.downloadKbps,
          uploadThroughputKbps: setting.uploadKbps,
          cpuSlowdownMultiplier: setting.cpuSlowdown
        },
        screenEmulation: {
          ...LIGHTHOUSE_DEFAULT_CONFIG.settings.screenEmulation,
          ...(configRest?.settings?.screenEmulation || {}),

          // setting 的权重比 lighthouseConf 大
          width: setting.width,
          height: setting.height
        },
        emulatedUserAgent: setting.userAgent
        || configRest.settings.userAgent
        || LIGHTHOUSE_DEFAULT_CONFIG.settings.emulatedUserAgent
      }
    },
    lighthouseOptions: {
      ...LIGHTHOUSE_DEFAULT_OPTIONS,
      ...omitBy(lighthouseOptions, isNil)
    }
  };
}

export function getSitespeedOptions(optoins = {}) {
  const {
    urls, iterations, outputPath, setting, sitespeedConfig = {}
  } = optoins;

  return {
    urls: urls.map((url, index)=>({ url, index: index + 1, urlKey: getKeypathFromUrl(url) })),
    iterations,
    outputPath: `${outputPath}/${DEFAULT_SITESPEED_REPORT_DIR}`,
    sitespeedConfig: {
      ...SITESPEED_DEFAULT_CONFIG,
      ...sitespeedConfig,
      'chrome.CPUThrottlingRate': setting.cpuSlowdown,
      'browsertime.iterations': iterations,
      'browsertime.connectivity.profile': 'custom',
      'browsertime.connectivity.downstreamKbps': setting.downloadKbps,
      'browsertime.connectivity.upstreamKbps': setting.uploadKbps,
      'browsertime.connectivity.latency': `'${setting.latency}'`,
      'browsertime.userAgent': `'${setting.userAgent}'`,
      'browsertime.viewPort': `${setting.width}x${setting.height}`
    }
  };
}

export function getOutputPath(outputPath, testTime = new Date()) {
  const currentOutput = outputPath || DEFAULT_REPORT_DIR;
  const currentTime = `${testTime.getFullYear()}_${testTime.getMonth() + 1}_${testTime.getDate()}_${testTime.getHours()}_${testTime.getMinutes()}_${testTime.getSeconds()}`;

  return getAbsolutePath(`${currentOutput}/${currentTime}`);
}

export function getDefaultOptions(options) {
  const {
    iterations,
    outputPath,
    metricsConfig = {}
  } = options;

  const testTime = new Date();

  return {
    iterations: iterations || 3,
    outputPath: getOutputPath(outputPath, testTime),
    preview: options.preview || false,
    reportType: options.reportType || REPORT_TYPE_MAP.HTML,
    compareMetricsType: options.compareMetricsType || COMPARE_METRICS_TYPE_MAP.AVG,
    ...options,
    metricsConfig: {
      good: {
        lcp: METRICS_CONFIG.GOOD.LCP,
        cls: METRICS_CONFIG.GOOD.CLS,
        // fid: METRICS_CONFIG.GOOD.FID,
        ...(metricsConfig?.good || {})
      },
      bad: {
        lcp: METRICS_CONFIG.BAD.LCP,
        cls: METRICS_CONFIG.BAD.CLS,
        // fid: METRICS_CONFIG.BAD.FID,
        ...(metricsConfig?.bad || {})
      }
    },
    setting: {
      userAgent: COMMON_TEST_CONFIG.USER_AGENT,
      downloadKbps: COMMON_TEST_CONFIG.DOWNLOAD_KBPS,
      uploadKbps: COMMON_TEST_CONFIG.UPLOAD_KBPS,
      width: COMMON_TEST_CONFIG.SCREEN_PC_WIDTH,
      height: COMMON_TEST_CONFIG.SCREEN_PC_HEIGHT,
      latency: COMMON_TEST_CONFIG.LATENCY,
      cpuSlowdown: COMMON_TEST_CONFIG.CPU_SLOWDOWN,
      ...options.setting
    },
    testTime: testTime,
    testTools: [
      PERFORMANCE_TOOLS_MAP.LIGHTHOUSE,
      PERFORMANCE_TOOLS_MAP.SITESPEED
    ],

    // 默认开启所有的测试工具
    [PERFORMANCE_TOOLS_MAP.LIGHTHOUSE]: options[PERFORMANCE_TOOLS_MAP.LIGHTHOUSE] ?? true,
    [PERFORMANCE_TOOLS_MAP.SITESPEED]: options[PERFORMANCE_TOOLS_MAP.SITESPEED] ?? true

  };
}

const GET_TOOL_OPTIONS_MAP = {
  [PERFORMANCE_TOOLS_MAP.LIGHTHOUSE]: getLighthouseOptions,
  [PERFORMANCE_TOOLS_MAP.SITESPEED]: getSitespeedOptions
};

export function getAllOptionsWithDefaultValue(options = {}) {
  const newOptions = verifyOptions(options);

  const currentOptions = getDefaultOptions({
    ...options,
    ...newOptions
  });

  // 根据配置项，读取工具对应的配置
  PERFORMANCE_TOOLS_LIST.forEach((toolName) => {
    if (currentOptions[toolName]) {
      currentOptions[`${toolName}Options`] = GET_TOOL_OPTIONS_MAP[toolName](currentOptions);
    }
  });

  return currentOptions;
}
