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
  LIGHTHOUSE_DEFAULT_OPTIONS,
  SITESPEED_DEFAULT_CONFIG,
} from "../src/const";
import useServer from '../example/server'

import { existsSync, removeSync, statSync } from "fs-extra";

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

beforeEach(()=>{
  removeSync(outputPathParent);
})

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

describe("Test Ligthhouse Entry",()=>{

  test("lighthouse default", async () => {
    const outputPath2 = `${outputPath}/${DEFAULT_LIGHTHOUSE_REPORT_DIR}`;
    const result = await runLighthouse(url, {
      outputPath: outputPath2,
      urlKey: key,
      urlIndex: 1,
      lighthouseConfig: LIGHTHOUSE_DEFAULT_CONFIG,
      lighthouseOptions: LIGHTHOUSE_DEFAULT_OPTIONS
    });
    expect(existsSync(`${outputPath2}/${key}/1.trace.json`)).toBe(false);
    expect(existsSync(`${outputPath2}/${key}/1.all.json`)).toBe(false);
    expect(statSync(`${outputPath2}/${key}/1.html`).size).toBeGreaterThan(1000);
    expect(result["first-contentful-paint"]?.numericValue).not.toBeUndefined();
    expect(result["largest-contentful-paint"]?.numericValue).not.toBeUndefined();
    expect(result["cumulative-layout-shift"]?.numericValue).not.toBeUndefined();
  });

  test("lighthouse output trace json", async () => {
    const outputPath2 = `${outputPath}/${DEFAULT_LIGHTHOUSE_REPORT_DIR}`;
    const result = await runLighthouse(url, {
      outputPath: outputPath2,
      urlKey: key,
      urlIndex: 1,
      lighthouseConfig: {
        ...LIGHTHOUSE_DEFAULT_CONFIG,
        saveAssets: true
      },
      lighthouseOptions: LIGHTHOUSE_DEFAULT_OPTIONS
    });
    expect(statSync(`${outputPath2}/${key}/1.trace.json`).size).toBeGreaterThan(1000);
    expect(existsSync(`${outputPath2}/${key}/1.all.json`)).toBe(false);
  });


  test("lighthouse output all json", async () => {
    const outputPath2 = `${outputPath}/${DEFAULT_LIGHTHOUSE_REPORT_DIR}`;
    const result = await runLighthouse(url, {
      outputPath: outputPath2,
      urlKey: key,
      urlIndex: 1,
      lighthouseConfig: {
        ...LIGHTHOUSE_DEFAULT_CONFIG,
        saveAllJson: true,
        saveAssets: true
      },
      lighthouseOptions: LIGHTHOUSE_DEFAULT_OPTIONS
    });
    expect(statSync(`${outputPath2}/${key}/1.all.json`).size).toBeGreaterThan(1000);
    expect(existsSync(`${outputPath2}/${key}/1.trace.json`)).toBe(false);
  });


  test("lighthouse output report to png", async () => {
    const outputPath2 = `${outputPath}/${DEFAULT_LIGHTHOUSE_REPORT_DIR}`;
    const result = await runLighthouse(url, {
      outputPath: outputPath2,
      urlKey: key,
      urlIndex: 1,
      lighthouseConfig: {
        ...LIGHTHOUSE_DEFAULT_CONFIG,
        saveReport2Png:true
      },
      lighthouseOptions: LIGHTHOUSE_DEFAULT_OPTIONS
    });
    expect(existsSync(`${outputPath2}/${key}/1.html`)).toBe(false);
    expect(statSync(`${outputPath2}/${key}/1.png`).size).toBeGreaterThan(1000);

  })
  
})
