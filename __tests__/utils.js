import {
  getAbsolutePath,
  getAllOptionsWithDefaultValue,
  getArrPercentile,
  getKeypathFromUrl,
  getLighthouseWebVitals,
  getOutputPath,
  getSitespeedCommand,
  getSitespeedWebVitals,
  getValueRange,
  verifyOptions,
} from "../src/utils";

function removeUnusedChar(str) {
  return str.replace(/\ /g, "").replace(/[\r\n]/g, "");
}

describe("get options", () => {
  test("Test verify options", async () => {
    expect(verifyOptions({ urls: "http://baidu.com" })).toEqual({
      urls: ["http://baidu.com"],
    });
    expect(() => verifyOptions({})).toThrow('"urls" is required');
    expect(() => verifyOptions({ urls: [] })).toThrow(
      '"urls" does not contain 1 required'
    );
    expect(() => verifyOptions({ urls: "../example/index.html" })).toThrow(
      '"urls" must be a valid uri'
    );
    expect(() =>
      verifyOptions({ urls: "http://baidu.com", iterations: null })
    ).toThrow('"iterations" must be a number');
  });

  test("Test default path", async () => {
    expect(getOutputPath("output")).toContain(getAbsolutePath("output"));
  });

  test("Test getAllOptionsWithDefaultValue all", () => {
    const expectResult = {
      iterations: 3,
      outputPath: "output",
      urls: ["https://www.baidu.com"],
      reportType: "html",
      compareMetricsType: "avg",
      preview: false,
      lighthouse: true,
      lighthouseOptions: {
        iterations: 3,
        metricsConfig: { good: { lcp: 1200, cls: 100 }, bad: { lcp: 2500, cls: 100 } },
        lighthouseConfig: {
          extends: "lighthouse:default",
          settings: {
            emulatedUserAgent:
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
            formFactor: "desktop",
            maxWaitForFcp: 15000,
            maxWaitForLoad: 35000,
            onlyCategories: ["performance"],
            screenEmulation: {
              deviceScaleFactor: 1,
              disabled: false,
              height: 1080,
              mobile: false,
              width: 1920,
            },
            skipAudits: ["uses-http2"],
            throttling: {
              cpuSlowdownMultiplier: 1,
              downloadThroughputKbps: 10240,
              requestLatencyMs: 0,
              rttMs: 0,
              throughputKbps: 10240,
              uploadThroughputKbps: 10240,
            },
          },
          saveAssets: false,
          saveAllJson: false,
          saveReport2Png: false,
          pure: false,
        },
        lighthouseOptions: {
          onlyCategories: ["performance"],
          output: "html",
          // extraHeaders: {
          //   Cookie:
          //     "OauthUserID=605711609;OauthAccessToken=dev.myones.net60571160932529168000;OauthExpires=32529168000",
          // },
          chromeFlags: ["--headless"],
        },
        outputPath: "output/lighthouse-result",
        urls: [
          {
            index: 1,
            url: "https://www.baidu.com",
            urlKey: "www_baidu_com__",
          },
          {
            index: 2,
            url: "https://www.baidu.com",
            urlKey: "www_baidu_com__",
          },
          {
            index: 3,
            url: "https://www.baidu.com",
            urlKey: "www_baidu_com__",
          },
        ],
      },
      metricsConfig: { good: { lcp: 1200, cls: 100 }, bad: { lcp: 2500, cls: 100 } },
      setting: {
        cpuSlowdown: 1,
        downloadKbps: 10240,
        height: 1080,
        latency: 0,
        uploadKbps: 10240,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        width: 1920,
      },
      sitespeed: true,
      sitespeedOptions: {
        iterations: 3,
        outputPath: "output/sitespeed-result",
        sitespeedConfig: {
          browser: "chrome",
          "browsertime.connectivity.downstreamKbps": 10240,
          "browsertime.connectivity.latency": "'0'",
          "browsertime.connectivity.profile": "custom",
          "browsertime.connectivity.upstreamKbps": 10240,
          "browsertime.headless": true,
          "browsertime.iterations": 3,
          "browsertime.userAgent":
            "'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'",
          "browsertime.viewPort": "1920x1080",
          "chrome.CPUThrottlingRate": 1,
          "plugins.add": "analysisstorer",
          // requestheader:
          //   "cookie:'OauthUserID=605711609;OauthAccessToken=dev.myones.net60571160932529168000;OauthExpires=32529168000'",
          silent: true,
        },
        urls: [
          {
            index: 1,
            url: "https://www.baidu.com",
            urlKey: "www_baidu_com__",
          },
        ],
      },
      testTools: ["lighthouse", "sitespeed"],
      onAllDone: undefined,
      onBegin: undefined,
      onDone: undefined,
      onEnd: undefined,
      onError: undefined,
    };

    const result = getAllOptionsWithDefaultValue({
      urls: ["https://www.baidu.com"],
      iterations: 3,
      outputPath: "output",
      lighthouse: true,
      sitespeed: true,
    });

    // console.log("result",result);
    // console.log("expectResult",expectResult);

    delete result.testTime;
    expect(result).toEqual(expectResult);
  });

  test("Test getAllOptionsWithDefaultValue chromeArgs", () => {
    const result2 = getAllOptionsWithDefaultValue({
      urls: ["https://www.baidu.com"],
      iterations: 3,
      outputPath: "output",
      lighthouseConfig: {
        chromeFlags: ["--headless", "--no-sandbox"],
      },
      sitespeedConfig: {
        "browsertime.headless": true,
        "browsertime.chrome.args": "no-sandbox",
      },
      setting: {
        latency: 9999,
      },
    });

    expect(result2.lighthouseOptions.lighthouseOptions.chromeFlags).toEqual([
      "--headless",
      "--no-sandbox",
    ]);
    expect(
      result2.lighthouseOptions.lighthouseConfig.settings.throttling.rttMs
    ).toEqual(9999);
    expect(
      result2.lighthouseOptions.lighthouseConfig.settings.throttling
        .requestLatencyMs
    ).toEqual(9999);
    expect(
      result2.sitespeedOptions.sitespeedConfig["browsertime.chrome.args"]
    ).toEqual("no-sandbox");
    expect(
      result2.sitespeedOptions.sitespeedConfig["browsertime.headless"]
    ).toEqual(true);
    expect(
      result2.sitespeedOptions.sitespeedConfig[
        "browsertime.connectivity.latency"
      ]
    ).toEqual("'9999'");
    expect(result2.setting.latency).toEqual(9999);
  });

  test("Test getAllOptionsWithDefaultValue p75", () => {
    const result3 = getAllOptionsWithDefaultValue({
      urls: ["https://www.baidu.com"],
      iterations: 3,
      outputPath: "output",
      compareMetricsType: "p75",
    });
    expect(result3.compareMetricsType).toEqual("p75");
  });

  test("Test getAllOptionsWithDefaultValue KMS", () => {
    const result4 = getAllOptionsWithDefaultValue({
      urls: ["https://www.baidu.com"],
      iterations: 3,
      outputPath: "output",
      setting: {
        downloadKbps: 4 * 1024,
        uploadKbps: 4 * 1024,
      },
    });

    expect(
      result4.lighthouseOptions.lighthouseConfig.settings.throttling
        .downloadThroughputKbps
    ).toEqual(4 * 1024);
    expect(
      result4.lighthouseOptions.lighthouseConfig.settings.throttling
        .uploadThroughputKbps
    ).toEqual(4 * 1024);
  });

  test("Test getAllOptionsWithDefaultValue saveAssets", () => {
    const result4 = getAllOptionsWithDefaultValue({
      urls: ["https://www.baidu.com"],
      iterations: 3,
      outputPath: "output",
      lighthouseConfig: {
        saveAssets: true,
      },
    });

    expect(result4.lighthouseOptions.lighthouseConfig.saveAssets).toEqual(true);
  });

  test("Test getAllOptionsWithDefaultValue saveReport2Png", () => {
    const result4 = getAllOptionsWithDefaultValue({
      urls: ["https://www.baidu.com"],
      iterations: 3,
      outputPath: "output",
      lighthouseConfig: {
        saveReport2Png: true,
      },
    });

    expect(result4.lighthouseOptions.lighthouseConfig.saveReport2Png).toEqual(
      true
    );
  });

  test("Test getAllOptionsWithDefaultValue lighthouse config", () => {
    const result4 = getAllOptionsWithDefaultValue({
      urls: ["https://www.baidu.com"],
      iterations: 3,
      outputPath: "output",
      setting: {
        latency: 28, // 延迟
        downloadKbps: 100,
        uploadKbps: 100,
      },
      lighthouseConfig: {
        saveAssets: true,
        settings: {
          throttling: {
            rttMs: 300,
            throughputKbps: 700,
            requestLatencyMs: 300 * 3.75,
            downloadThroughputKbps: 700 * 0.9,
            uploadThroughputKbps: 700 * 0.9,
            cpuSlowdownMultiplier: 4,
          },
        },
      },
    });

    expect(
      result4.lighthouseOptions.lighthouseConfig.settings.throttling.rttMs
    ).toEqual(300);
    expect(
      result4.lighthouseOptions.lighthouseConfig.settings.throttling
        .throughputKbps
    ).toEqual(700);
    expect(
      result4.lighthouseOptions.lighthouseConfig.settings.throttling
        .requestLatencyMs
    ).toEqual(300 * 3.75);
    expect(
      result4.lighthouseOptions.lighthouseConfig.settings.throttling
        .downloadThroughputKbps
    ).toEqual(700 * 0.9);
    expect(
      result4.lighthouseOptions.lighthouseConfig.settings.throttling
        .uploadThroughputKbps
    ).toEqual(700 * 0.9);
    expect(
      result4.lighthouseOptions.lighthouseConfig.settings.throttling
        .cpuSlowdownMultiplier
    ).toEqual(4);
  });
});

describe("get value", () => {
  test("getKeypathFromUrl", () => {
    expect(getKeypathFromUrl("http://baidu.com")).toEqual("baidu_com__");
    expect(getKeypathFromUrl("http://localhost:3000")).toEqual(
      "localhost_3000__"
    );
    expect(getKeypathFromUrl("")).toEqual("");
  });

  test("getSitespeedCommand", () => {
    expect(removeUnusedChar(getSitespeedCommand("http://baidu.com"))).toEqual(
      removeUnusedChar("npx sitespeed.io http://baidu.com")
    );

    expect(
      removeUnusedChar(
        getSitespeedCommand("http://baidu.com", {
          a: true,
          b: 1,
          c: false,
          "browsertime.chrome.args": "no-sandbox",
        })
      )
    ).toEqual(
      removeUnusedChar(
        "npx sitespeed.io http://baidu.com --a --b1 --browsertime.chrome.args no-sandbox"
      )
    );
  });

  test("getSitespeedWebVitals", () => {
    expect(
      getSitespeedWebVitals({
        baidu_com__: {
          resultList: [
            {
              googleWebVitals: {
                cumulativeLayoutShift: {
                  median: 0,
                  mean: 0,
                  min: 0,
                  p90: 0,
                  max: 0,
                },
                ttfb: { median: 722, mean: 722, min: 722, p90: 722, max: 722 },
                largestContentfulPaint: {
                  median: 1315,
                  mean: 1315,
                  min: 1315,
                  p90: 1315,
                  max: 1315,
                },
                firstContentfulPaint: {
                  median: 980,
                  mean: 980,
                  min: 980,
                  p90: 980,
                  max: 980,
                },
                firstInputDelay: { median: 0, mean: 0, min: 0, p90: 0, max: 0 },
                totalBlockingTime: {
                  median: 3,
                  mean: 3,
                  min: 3,
                  p90: 3,
                  max: 3,
                },
              },
            },
          ],
          url: "http://baidu.com",
        },
      })
    ).toEqual({
      baidu_com__: {
        metircs: {
          CLS: 0,
          FCP: 980,
          FID: 0,
          LCP: 1315,
          TBT: 3,
          TTFB: 722,
          TTI: 0,
        },
        url: "http://baidu.com",
      },
    });
  });

  test("getLighthouseWebVitals", () => {
    expect(
      getLighthouseWebVitals({
        baidu_com__: {
          resultList: [
            {
              "first-contentful-paint": {
                id: "first-contentful-paint",
                title: "First Contentful Paint",
                description:
                  "First Contentful Paint marks the time at which the first text or image is painted. [Learn more](https://web.dev/first-contentful-paint/).",
                score: 1,
                scoreDisplayMode: "numeric",
                numericValue: 153.07199999999997,
                numericUnit: "millisecond",
                displayValue: "0.2 s",
              },
              "largest-contentful-paint": {
                id: "largest-contentful-paint",
                title: "Largest Contentful Paint",
                description:
                  "Largest Contentful Paint marks the time at which the largest text or image is painted. [Learn more](https://web.dev/lighthouse-largest-contentful-paint/)",
                score: 1,
                scoreDisplayMode: "numeric",
                numericValue: 298.14399999999995,
                numericUnit: "millisecond",
                displayValue: "0.3 s",
              },
              "speed-index": {
                id: "speed-index",
                title: "Speed Index",
                description:
                  "Speed Index shows how quickly the contents of a page are visibly populated. [Learn more](https://web.dev/speed-index/).",
                score: 0.32,
                scoreDisplayMode: "numeric",
                numericValue: 2820.096124878711,
                numericUnit: "millisecond",
                displayValue: "2.8 s",
              },
              "total-blocking-time": {
                id: "total-blocking-time",
                title: "Total Blocking Time",
                description:
                  "Sum of all time periods between FCP and Time to Interactive, when task length exceeded 50ms, expressed in milliseconds. [Learn more](https://web.dev/lighthouse-total-blocking-time/).",
                score: 1,
                scoreDisplayMode: "numeric",
                numericValue: 17.000000000000114,
                numericUnit: "millisecond",
                displayValue: "20 ms",
              },
              "cumulative-layout-shift": {
                id: "cumulative-layout-shift",
                title: "Cumulative Layout Shift",
                description:
                  "Cumulative Layout Shift measures the movement of visible elements within the viewport. [Learn more](https://web.dev/cls/).",
                score: 1,
                scoreDisplayMode: "numeric",
                numericValue: 0.00001321857358202522,
                numericUnit: "unitless",
                displayValue: "0",
                details: {
                  type: "debugdata",
                  items: [
                    {
                      cumulativeLayoutShiftMainFrame: 0.00001321857358202522,
                      totalCumulativeLayoutShift: 0.00001321857358202522,
                    },
                  ],
                },
              },
              interactive: {
                id: "interactive",
                title: "Time to Interactive",
                description:
                  "Time to interactive is the amount of time it takes for the page to become fully interactive. [Learn more](https://web.dev/interactive/).",
                score: 1,
                scoreDisplayMode: "numeric",
                numericValue: 1127.574,
                numericUnit: "millisecond",
                displayValue: "1.1 s",
              },
              "server-response-time": {
                id: "server-response-time",
                title: "Initial server response time was short",
                description:
                  "Keep the server response time for the main document short because all other requests depend on it. [Learn more](https://web.dev/time-to-first-byte/).",
                score: 1,
                scoreDisplayMode: "binary",
                numericValue: 269.207,
                numericUnit: "millisecond",
                displayValue: "Root document took 270 ms",
                details: {
                  type: "opportunity",
                  headings: [
                    {
                      key: "url",
                      valueType: "url",
                      label: "URL",
                    },
                    {
                      key: "responseTime",
                      valueType: "timespanMs",
                      label: "Time Spent",
                    },
                  ],
                  items: [
                    {
                      url: "https://www.baidu.com/",
                      responseTime: 269.207,
                    },
                  ],
                  overallSavingsMs: 169.207,
                },
              },
            },
          ],
          url: "http://baidu.com",
        },
      })
    ).toEqual({
      baidu_com__: {
        metircs: {
          CLS: "0.000",
          CLS_75: "0.000",
          CLS_90: "0.000",
          CLSList: [0],
          FCP: "153.072",
          FCP_75: "153.072",
          FCP_90: "153.072",
          FCPList: [153.072],
          FID: "1127.574",
          FID_75: "1127.574",
          FID_90: "1127.574",
          FIDList: [1127.574],
          LCP: "298.144",
          LCP_75: "298.144",
          LCP_90: "298.144",
          LCPList: [298.144],
          SI: "2820.096",
          SI_75: "2820.096",
          SI_90: "2820.096",
          SIList: [2820.096],
          TBT: "17.000",
          TBT_75: "17.000",
          TBT_90: "17.000",
          TTFB: "269.207",
          TTFB_75: "269.207",
          TTFB_90: "269.207",
          TBTList: [17],
          TTFBList: [269.207],
          TTI: "1127.574",
          TTI_75: "1127.574",
          TTI_90: "1127.574",
          TTIList: [1127.574],
        },
        url: "http://baidu.com",
      },
    });
  });

  test("getArrPercentile", () => {
    expect(getArrPercentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 75)).toBe(8);
    expect(getArrPercentile([10, 1, 2, 5, 6, 3, 4, 8, 9, 7], 90)).toBe(9);
  });

  test("getValueRange", () => {
    expect(getValueRange(0.5, 0.2, 0.9)).toEqual("middle");
    expect(getValueRange(0.1, 0.2, 0.9)).toEqual("good");
    expect(getValueRange(1, 0.2, 0.9)).toEqual("bad");
    expect(getValueRange(undefined, 0.2, 0.9)).toEqual("");
    expect(getValueRange(1, undefined, 0.9)).toEqual("");
  });
});
