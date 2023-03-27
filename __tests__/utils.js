import {
  getAbsolutePath,
  getAllOptionsWithDefaultValue,
  getKeypathFromUrl,
  getLighthouseWebVitals,
  getOutputPath,
  getSitespeedCommand,
  getSitespeedWebVitals,
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

  test("Test getAllOptionsWithDefaultValue", async () => {
    const result = getAllOptionsWithDefaultValue({
      urls: ["https://www.baidu.com"],
      iterations: 3,
      outputPath: "output",
    });

    delete result.testTime;
    expect(result).toEqual({
      iterations: 3,
      outputPath: "output",
      urls: ["https://www.baidu.com"],
      lighthouse: true,
      lighthouseOptions: {
        iterations: 3,
        lighthouseConfig: {
          emulatedUserAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
          extends: "lighthouse:default",
          screenEmulation: {
            deviceScaleFactor: 1,
            disabled: false,
            height: 1080,
            mobile: false,
            width: 1920,
          },
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
          throttling: {
            cpuSlowdownMultiplier: 1,
            downloadThroughputKbps: 10240,
            requestLatencyMs: 0,
            rttMs: 0,
            throughputKbps: 10240,
            uploadThroughputKbps: 10240,
          },
        },
        outputPath: "output/lighthoust-result",
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
      metricsConfig: {
        bad: {
          cls: 100,
          fid: 100,
          lcp: 2500,
        },
        good: {
          cls: 100,
          fid: 100,
          lcp: 1200,
        },
      },
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
          requestheader:
            "cookie:'OauthUserID=605711609;OauthAccessToken=dev.myones.net60571160932529168000;OauthExpires=32529168000'",
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
    });
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
          c:false
        })
      )
    ).toEqual(removeUnusedChar("npx sitespeed.io http://baidu.com --a --b1"));
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
          FCP: "153.072",
          FID: "1127.574",
          LCP: "298.144",
          SI: "2820.096",
          TBT: "17.000",
          TTFB: "269.207",
          TTI: "1127.574",
        },
        url: "http://baidu.com",
      },
    });
  });
});
