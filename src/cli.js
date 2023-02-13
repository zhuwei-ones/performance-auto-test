#!/usr/bin/env node

const yargs = require('yargs');
const { logger, getConfigJson } = require('../dist/utils');
const { DEFAULT_CONFIG_PATH } = require('../dist/lib/const.js');
// const performanceTest = require('../dist/cli.js');

function main() {
  try {
    const options = yargs
      .usage('Usage: -c <file path>')
      .option('config', { alias: 'c', describe: '配置文件路径', type: 'string' })
      .option('outputPath', { alias: 'o', describe: '文件输出目录', type: 'string' })
      .argv;

    let configData;
    if (options.config) {
      configData = getConfigJson(options.config);
    }

    if (!configData) {
      configData = getConfigJson(DEFAULT_CONFIG_PATH);
    }

    logger.error('请检查是否有 performance-test 的配置');
  } catch (error) {
    logger.error(error);
  }
}

main();
