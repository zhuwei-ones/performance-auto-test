import Joi from 'joi';
import {
  COMMON_TEST_CONFIG, DEFAULT_LIGHTHOUSE_REPORT_DIR,
  DEFAULT_REPORT_DIR,
  DEFAULT_SITESPEED_REPORT_DIR, LIGHTHOUSE_DEFAULT_CONFIG,
  PERFORMANCE_TOOLS_MAP, SITESPEED_DEFAULT_OPTIONS
} from '../const';
import { getAbsolutePath } from './get-value';

export function verifyOptions(options = {}) {
  const schema = Joi.object({
    urls: Joi.array().items(Joi.string().uri()).single()
      .required(),

    iterations: Joi.number(),

    outputPath: Joi.string()

  });

  const result = schema.validate(options);

  if (result.error) {
    throw result.error;
  }
}

export function getLighthouseOptions(optoins = {}) {
  const {
    urls, iterations, outputPath, setting, lighthouseConfig = {}
  } = optoins;

  return {
    urls: urls,
    iterations,
    outputPath: `${outputPath}/${DEFAULT_LIGHTHOUSE_REPORT_DIR}`,
    lighthouseConfig: {
      ...LIGHTHOUSE_DEFAULT_CONFIG,
      ...lighthouseConfig,
      throttling: { // constants.throttling.desktopDense4G,
        ...LIGHTHOUSE_DEFAULT_CONFIG.settings.throttling,
        ...(lighthouseConfig?.settings?.throttling || {}),
        requestLatencyMs: setting.latency, // 0 means unset
        downloadThroughputKbps: setting.downloadKbps,
        uploadThroughputKbps: setting.uploadKbps
      },
      screenEmulation: {
        ...LIGHTHOUSE_DEFAULT_CONFIG.settings.screenEmulation,
        ...(lighthouseConfig?.settings?.screenEmulation || {}),

        // setting 的权重比 lighthouseConf 大
        width: setting.width,
        height: setting.height
      },
      emulatedUserAgent: setting.userAgent
        || lighthouseConfig.settings.userAgent
        || LIGHTHOUSE_DEFAULT_CONFIG.settings.emulatedUserAgent
    }
  };
}

export function getSitespeedOptions(optoins = {}) {
  const {
    urls, iterations, outputPath, setting, sitespeedConfig = {}
  } = optoins;

  return {
    urls: urls,
    iterations,
    outputPath: `${outputPath}/${DEFAULT_SITESPEED_REPORT_DIR}`,
    sitespeedConfig: {
      ...SITESPEED_DEFAULT_OPTIONS,
      ...sitespeedConfig,
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
  const currentTime = testTime?.toLocaleString?.().replace(/\/|:|\s/g, '_');

  return getAbsolutePath(`${currentOutput}/${currentTime}`);
}

export function getDefaultOptions(options) {
  const {
    iterations,
    outputPath
  } = options;

  const testTime = new Date();

  return {
    iterations: iterations || 3,
    outputPath: getOutputPath(outputPath, testTime),
    ...options,
    setting: {
      ...options.setting,
      userAgent: COMMON_TEST_CONFIG.USER_AGENT,
      downloadKbps: COMMON_TEST_CONFIG.DOWNLOAD_KBPS,
      uploadKbps: COMMON_TEST_CONFIG.UPLOAD_KBPS,
      width: COMMON_TEST_CONFIG.SCREEN_PC_WIDTH,
      height: COMMON_TEST_CONFIG.SCREEN_PC_HEIGHT,
      latency: COMMON_TEST_CONFIG.LATENCY
    },
    testTime: testTime,
    testTools: `${PERFORMANCE_TOOLS_MAP.LIGHTHOUSE} + ${PERFORMANCE_TOOLS_MAP.SITESPEED}`

  };
}

export function getAllOptionsWithDefaultValue(options = {}) {
  verifyOptions(options);

  const currentOptions = getDefaultOptions(options);
  const lighthouseOptions = getLighthouseOptions(currentOptions);
  const sitespeedOptions = getSitespeedOptions(currentOptions);

  return {
    ...currentOptions,
    lighthouseOptions,
    sitespeedOptions
  };
}
