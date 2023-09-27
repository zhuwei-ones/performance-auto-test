import PerformanceTest from "../src";

import useServer from "../example/server";
import { removeSync, statSync } from "fs-extra";
import { getAbsolutePath } from "../src/utils";
import {
  DEFAULT_LIGHTHOUSE_REPORT_DIR,
  DEFAULT_SITESPEED_REPORT_DIR,
} from "../src/const";
import { glob } from "glob";

const url1 = "http://localhost:8091";
const url2 = "http://localhost:8091/2.html";
const _oup = "test-output";
const _oupAbsolute = getAbsolutePath(_oup);
jest.setTimeout(100000);

let server;
beforeAll(async () => {
  server = await useServer();
  removeSync(_oupAbsolute);
});

afterAll(() => {
  server && server.close();
  removeSync(_oupAbsolute);
});

beforeEach(() => {
  removeSync(_oupAbsolute);
});

// https://github.com/justinribeiro/lighthouse-jest-example

test("Test Main Entry", async () => {
  await PerformanceTest({
    urls: [url1],
    iterations: 1,
    outputPath: _oupAbsolute,
  });

  const lighthouseReportDir = getAbsolutePath(
    `${_oup}/**/${DEFAULT_LIGHTHOUSE_REPORT_DIR}/**/1.html`
  );
  const sitespeedReportDir = getAbsolutePath(
    `${_oup}/**/${DEFAULT_SITESPEED_REPORT_DIR}/**/data/browsertime.summary-localhost.json`
  );

  const lChildDir = glob.sync(lighthouseReportDir)?.[0];
  const sChildDir = glob.sync(sitespeedReportDir)?.[0];

  expect(statSync(lChildDir).size).toBeGreaterThan(1000);
  expect(statSync(sChildDir).size).toBeGreaterThan(1000);
});

test("Test Main Entry Only Performance", async () => {
  await PerformanceTest({
    urls: [url1],
    iterations: 1,
    outputPath: _oupAbsolute,
    sitespeed: false,
  });

  const lighthouseReportDir = getAbsolutePath(
    `${_oup}/**/${DEFAULT_LIGHTHOUSE_REPORT_DIR}/**/1.html`
  );
  const sitespeedReportDir = getAbsolutePath(
    `${_oup}/**/${DEFAULT_SITESPEED_REPORT_DIR}/**/data/browsertime.summary-localhost.json`
  );

  const lChildDir = glob.sync(lighthouseReportDir)?.[0];
  const sChildDir = glob.sync(sitespeedReportDir)?.[0];

  expect(statSync(lChildDir).size).toBeGreaterThan(1000);
  expect(sChildDir).toBeUndefined();
});

test("Test Main Entry Only Sitespeed", async () => {
  await PerformanceTest({
    urls: [url1],
    iterations: 1,
    outputPath: _oupAbsolute,
    lighthouse: false,
  });

  const lighthouseReportDir = getAbsolutePath(
    `${_oup}/**/${DEFAULT_LIGHTHOUSE_REPORT_DIR}/**/1.html`
  );
  const sitespeedReportDir = getAbsolutePath(
    `${_oup}/**/${DEFAULT_SITESPEED_REPORT_DIR}/**/data/browsertime.summary-localhost.json`
  );

  const lChildDir = glob.sync(lighthouseReportDir)?.[0];
  const sChildDir = glob.sync(sitespeedReportDir)?.[0];

  expect(statSync(sChildDir).size).toBeGreaterThan(1000);
  expect(lChildDir).toBeUndefined();
});

test("Test Main Entry With Hooks", async () => {
  const hookResult = {};

  await PerformanceTest({
    urls: [url1],
    iterations: 1,
    outputPath: _oupAbsolute,
    sitespeed: false,
    onDone: ({result}) => {
      hookResult.onDone = true;
    },
    onBegin: () => {
      hookResult.onBegin = true;
    },
    onEnd: () => {
      hookResult.onEnd = true;
    },
    onAllDone: () => {
      hookResult.onAllDone = true;
    },
  });

  expect(hookResult).toEqual({
    onDone: true,
    onBegin: true,
    onEnd: true,
    onAllDone: true,
  });
});


test("Test Main Entry With onDone Hooks", async () => {

  let doneResult = {}

  await PerformanceTest({
    urls: [url1],
    iterations: 1,
    outputPath: _oupAbsolute,
    sitespeed: false,
    onDone: ({result}) => {
      doneResult=result
    },
  });
  expect(doneResult.LCP).toBeGreaterThanOrEqual(0)
  expect(doneResult.CLS).toBeGreaterThanOrEqual(0)
  expect(doneResult.FCP).toBeGreaterThanOrEqual(0)
})

test("Test Main Entry With onAllDone Hooks", async () => {

  let doneResult = {}

  await PerformanceTest({
    urls: [url1],
    iterations: 1,
    outputPath: _oupAbsolute,
    sitespeed: false,
    onAllDone: (result) => {
      doneResult=result
    },
  });

  expect(doneResult?.[0]?.result?.[0].metrics?.LCP?.avg).toBeGreaterThanOrEqual(0)
  expect(doneResult?.[0]?.result?.[0].metrics?.LCP?.p75).toBeGreaterThanOrEqual(0)
  expect(doneResult?.[0]?.result?.[0].metrics?.LCP?.p90).toBeGreaterThanOrEqual(0)
})

test("Test Main Entry With Interrupt", async () => {
  await PerformanceTest({
    urls: [url1,url2],
    iterations: 4,
    outputPath: _oupAbsolute,
    sitespeed: false,
    onDone: ({index,url}) => {

      // url1 中止，其他url正常运行
      if(index===2 && url===url1){
        return { interrupt: true}
      }
    },
  });

  const lighthouseReportDir = getAbsolutePath(`${_oup}/**/${DEFAULT_LIGHTHOUSE_REPORT_DIR}/**/*.html`);

  const lChildDir = glob.sync(lighthouseReportDir)

  expect(lChildDir.length).toEqual(6);
});
