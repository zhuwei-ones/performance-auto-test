import { exec } from 'child_process';
import util from 'util';

import {
  getSitespeedCommand,
  getSitespeedReportPath,
  readSitespeedJsonReport
} from '../utils';

export async function runSitespeed(url, options) {
  const {
    urlKey, outputPath, sitespeedConfig
  } = options;

  const currentOutputPath = getSitespeedReportPath(outputPath, urlKey);

  await util.promisify(exec)(getSitespeedCommand(url, {
    ...sitespeedConfig,
    outputFolder: currentOutputPath
  }));

  const runnerResult = readSitespeedJsonReport(currentOutputPath);

  return runnerResult;
}
