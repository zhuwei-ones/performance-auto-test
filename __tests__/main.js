import PerformanceTest from "../src";

import useServer from "../example/server";
import { removeSync, statSync } from "fs-extra";
import { getAbsolutePath } from "../src/utils";
import {
  DEFAULT_LIGHTHOUSE_REPORT_DIR,
  DEFAULT_SITESPEED_REPORT_DIR,
} from "../src/const";
import { glob } from "glob";

const url = "http://localhost:8091";
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
    urls: [url],
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
    urls: [url],
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
    urls: [url],
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
  let doneResult = {}

  await PerformanceTest({
    urls: [url],
    iterations: 1,
    outputPath: _oupAbsolute,
    sitespeed: false,
    onDone: ({result}) => {
      hookResult.onDone = true;
      doneResult=result
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
  expect(doneResult.LCP).toBeGreaterThanOrEqual(0)
  expect(doneResult.CLS).toBeGreaterThanOrEqual(0)
  expect(doneResult.FCP).toBeGreaterThanOrEqual(0)
});

test("Test Main Entry With Interrupt", async () => {
  await PerformanceTest({
    urls: [url],
    iterations: 4,
    outputPath: _oupAbsolute,
    sitespeed: false,
    onDone: ({index,result}) => {
      if(index===2){
      console.log("result",result)

        return { interrupt: true}
      }
    },
  });

  const lighthouseReportDir = getAbsolutePath(`${_oup}/**/${DEFAULT_LIGHTHOUSE_REPORT_DIR}/**/*.html`);

  const lChildDir = glob.sync(lighthouseReportDir)

  expect(lChildDir.length).toEqual(2);
});
