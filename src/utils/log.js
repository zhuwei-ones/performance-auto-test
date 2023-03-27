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

const myFormat = printf(({
  level, message, label: currentLabel
}) => {
  const color = levelColorMap[level];
  return chalk[color](`[${new Date().toLocaleString()}] [${currentLabel}] ${level}: ${message}`);
});

export const logger = createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    success: 2
  },
  format: combine(
    label({ label: PkgJson.name }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console()]
});

// 打印测试链接以及配置
export const printfPerformanceTestContent = ()=>{

};
