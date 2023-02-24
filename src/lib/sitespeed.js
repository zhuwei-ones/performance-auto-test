import shelljs from 'shelljs';
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

  shelljs.exec(
    getSitespeedCommand(url, {
      ...sitespeedConfig,
      outputFolder: currentOutputPath
    })
  );

  const runnerResult = readSitespeedJsonReport(currentOutputPath);

  return runnerResult;
}
