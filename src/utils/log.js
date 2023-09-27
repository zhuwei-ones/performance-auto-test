import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';

const {
  combine, timestamp, label, printf
} = format;

import PkgJson from '../../package.json';

const levelColorMap = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'green',
  success: 'green'
};

const myFormat = (type)=>{
  return printf(({
    level, message, label: currentLabel, timestamp: _, ...rest
  }) => {
    const color = levelColorMap[level];
    let restString = JSON.stringify(rest, undefined, 2);
    restString = restString === '{}' ? '' : restString;

    const result = `[${new Date().toLocaleString()}] [${currentLabel}] ${level}: ${message} ${restString}`;

    return type === 'console' ? chalk[color](
      result
    ) : result;
  });
};

const isTest = process.env.NODE_ENV === 'test';

export const logger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    success: 2
  },
  transports: [
    // (info)=>myFormat({ ...info, type: 'console' })
    new transports.Console({
      format: combine(label({ label: PkgJson.name }), timestamp(), format.prettyPrint(), myFormat('console')),
      silent: isTest
    }),
    new transports.File({
      filename: 'logs/performance-error.log',
      level: 'error',
      format: combine(label({ label: PkgJson.name }), timestamp(), format.prettyPrint(), myFormat('file')),
      silent: isTest
    }),
    new transports.File({
      filename: 'logs/performance-log.log',
      format: combine(label({ label: PkgJson.name }), timestamp(), format.prettyPrint(), myFormat('file')),
      silent: isTest
    })
  ]
});

// 打印测试链接以及配置
export const printfPerformanceTestContent = () => {};
