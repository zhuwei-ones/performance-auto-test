import Joi from 'joi';
import {
  COMMON_TEST_CONFIG, DEFAULT_LIGHTHOUSE_REPORT_DIR,
  DEFAULT_REPORT_DIR, DEFAULT_SITESPEED_REPORT_DIR, PERFORMANCE_TOOLS_MAP
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
  const { urls, iterations, outputPath } = optoins;

  return {
    urls: urls,
    iterations,
    outputPath: `${outputPath}/${DEFAULT_LIGHTHOUSE_REPORT_DIR}`
  };
}

export function getSitespeedOptions(optoins = {}) {
  const { urls, iterations, outputPath } = optoins;

  return {
    urls: urls,
    iterations,
    outputPath: `${outputPath}/${DEFAULT_SITESPEED_REPORT_DIR}`
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
    ...options,
    testTime: testTime,
    testTools: `${PERFORMANCE_TOOLS_MAP.LIGHTHOUSE} + ${PERFORMANCE_TOOLS_MAP.SITESPEED}`,
    iterations: iterations || 3,
    outputPath: getOutputPath(outputPath, testTime)
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
    sitespeedOptions,
    setting: {
      userAgent: COMMON_TEST_CONFIG.USER_AGENT,
      downloadKbps: COMMON_TEST_CONFIG.DOWNLOAD_KBPS,
      uploadKbps: COMMON_TEST_CONFIG.UPLOAD_KBPS,
      width: COMMON_TEST_CONFIG.SCREEN_PC_WIDTH,
      height: COMMON_TEST_CONFIG.SCREEN_PC_HEIGHT,
      latency: COMMON_TEST_CONFIG.LATENCY,
      ...currentOptions.setting
    }
  };
}
