import { runLighthouse } from "../src/lib/lighthouse";
import {
  getAbsolutePath,
  getKeypathFromUrl,
  getOutputPath,
} from "../src/utils";
import { runSitespeed } from "../src/lib/sitespeed";
import {
  DEFAULT_LIGHTHOUSE_REPORT_DIR,
  DEFAULT_SITESPEED_REPORT_DIR,
  LIGHTHOUSE_DEFAULT_CONFIG,
  SITESPEED_DEFAULT_CONFIG,
} from "../src/const";
import useServer from '../example/server'

import { removeSync, statSync } from "fs-extra";

const url = "http://localhost:8091";
const key = getKeypathFromUrl(url);
const outputPath = getOutputPath("test-output");
const outputPathParent = getAbsolutePath("test-output");
jest.setTimeout(50000);

let server

beforeAll(async () => {
  server  = await useServer()
  removeSync(outputPathParent);
});

afterAll(() => {
  server && server.close();
  removeSync(outputPathParent);
});

test("Test Sitespeed Entry", async () => {
  const outputPath2 = `${outputPath}/${DEFAULT_SITESPEED_REPORT_DIR}`;
  const result = await runSitespeed(url, {
    outputPath: outputPath2,
    urlKey: key,
    urlIndex: 1,
    sitespeedConfig: SITESPEED_DEFAULT_CONFIG,
  });
  expect(
    result.googleWebVitals?.cumulativeLayoutShift?.mean
  ).not.toBeUndefined();
  expect(
    result.googleWebVitals?.largestContentfulPaint?.mean
  ).not.toBeUndefined();
  expect(
    result.googleWebVitals?.firstContentfulPaint?.mean
  ).not.toBeUndefined();
});

test("Test Ligthhouse Entry", async () => {
  const outputPath2 = `${outputPath}/${DEFAULT_LIGHTHOUSE_REPORT_DIR}`;
  const result = await runLighthouse(url, {
    outputPath: outputPath2,
    urlKey: key,
    urlIndex: 1,
    lighthouseConfig: LIGHTHOUSE_DEFAULT_CONFIG,
  });
  expect(statSync(`${outputPath2}/${key}/1.json`).size).toBeGreaterThan(1000);
  expect(statSync(`${outputPath2}/${key}/1.html`).size).toBeGreaterThan(1000);
  expect(result["first-contentful-paint"]?.numericValue).not.toBeUndefined();
  expect(result["largest-contentful-paint"]?.numericValue).not.toBeUndefined();
  expect(result["cumulative-layout-shift"]?.numericValue).not.toBeUndefined();
});
