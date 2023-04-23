import PerformanceTest from "../src";


import useServer from '../example/server'
import { removeSync, statSync } from "fs-extra";
import {  getAbsolutePath, getOutputPath } from "../src/utils";
import { DEFAULT_LIGHTHOUSE_REPORT_DIR, DEFAULT_SITESPEED_REPORT_DIR } from "../src/const";
import { glob } from "glob";


const url = "http://localhost:8091";
const _oup = "test-output"
const _oupAbsolute = getAbsolutePath(_oup)
jest.setTimeout(100000);

let server
beforeAll(async () => {
  server  = await useServer()
  removeSync(_oupAbsolute);
});

afterAll(() => {
  server && server.close();
  removeSync(_oupAbsolute);
});


// https://github.com/justinribeiro/lighthouse-jest-example

test("Test Main Entry", async () => {
  await PerformanceTest({
    urls: [
      url
    ],
    iterations: 1,
    outputPath:_oupAbsolute ,
  });

  const lighthouseReportDir = getAbsolutePath(`${_oup}/**/${DEFAULT_LIGHTHOUSE_REPORT_DIR}/**/1.json`);
  const sitespeedReportDir = getAbsolutePath(`${_oup}/**/${DEFAULT_SITESPEED_REPORT_DIR}/**/data/browsertime.summary-localhost.json`);

  const lChildDir = glob.sync(lighthouseReportDir)?.[0]
  const sChildDir = glob.sync(sitespeedReportDir)?.[0]

  expect(statSync(lChildDir).size).toBeGreaterThan(1000);
  expect(statSync(sChildDir).size).toBeGreaterThan(1000);

});
