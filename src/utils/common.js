import { statSync } from 'fs-extra';

export function debounce(cb, delay = 250) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

export function sleep(time = 200) {
  return new Promise((res)=>{
    setTimeout(()=>{
      res('');
    }, time);
  });
}

export function isDir(dirPath) {
  try {
    return statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

export function isTestEnv() {
  return process.env.NODE_ENV === 'test';
}
