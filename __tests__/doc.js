import { removeSync, statSync } from "fs-extra";
import { METRICS_CONFIG } from "../src/const";
import {
  createPerformanceReport,
  getAbsolutePath,
  getReportConclusion,
  getToolCompareTableData,
} from "../src/utils";

const outputPathParent = getAbsolutePath("test-output");

afterAll(() => {
  removeSync(outputPathParent);
});

describe("Test MD DOC", () => {
  test("Test util", async () => {
    expect(
      getReportConclusion({
        performanceResultList: {
          lighthouse: {
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
          },
        },
        metricsConfig: {
          good: {
            lcp: METRICS_CONFIG.GOOD.LCP,
            cls: METRICS_CONFIG.GOOD.CLS,
            fid: METRICS_CONFIG.GOOD.FID,
          },
          bad: {
            lcp: METRICS_CONFIG.BAD.LCP,
            cls: METRICS_CONFIG.BAD.CLS,
            fid: METRICS_CONFIG.BAD.FID,
          },
        },
      })
    ).toEqual([
      { h2: "测试结论" },
      {
        table: {
          headers: ["Page", "lighthouse"],
          rows: [["http://baidu.com", { redText: "不通过" }]],
        },
      },
    ]);

    expect(
      getToolCompareTableData({
        performanceResultList: {
          lighthouse: {
            baidu_com__: {
              metircs: {
                CLS: 0,
                FCP: 980,
                LCP: 1315,
                FID: 0,
                TBT: 3,
                TTFB: 722,
                TTI: 0,
              },
              url: "http://baidu.com",
            },
          },
        },
        metricsConfig: {
          good: {
            lcp: METRICS_CONFIG.GOOD.LCP,
            cls: METRICS_CONFIG.GOOD.CLS,
            fid: METRICS_CONFIG.GOOD.FID,
          },
          bad: {
            lcp: METRICS_CONFIG.BAD.LCP,
            cls: METRICS_CONFIG.BAD.CLS,
            fid: METRICS_CONFIG.BAD.FID,
          },
        },
      })
    ).toEqual({
      table: {
        headers: [
          "Page",
          "Tool",
          "LCP",
          "CLS",
          "FID",
          "FCP",
          "SI",
          "TTI",
          "TBT",
        ],
        rows: [
          [
            "http://baidu.com",
            "lighthouse",
            {
              textList: [
                {
                  input: "AVG: 1.315 s",
                  type: "middle",
                },
              ],
            },
            {
              textList: [
                {
                  input: "AVG: 0 s",
                  type: "good",
                },
              ],
            },
            {
              textList: [
                {
                  input: "AVG: 0.000 s",
                  type: "good",
                },
              ],
            },
            {
              textList: [
                {
                  input: "AVG: 0.980 s",
                  type: "",
                },
              ],
            },
            "-",
            {
              textList: [
                {
                  input: "AVG: 0.000 s",
                  type: "",
                },
              ],
            },
            {
              textList: [
                {
                  input: "AVG: 0.003 s",
                  type: "",
                },
              ],
            },
          ],
        ],
      },
    });
  });

  test("Test Main Doc", async () => {
    const reportPath = createPerformanceReport(
      [
        {
          type: "lighthouse",
          result: {
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
          },
        },
      ],
      {
        outputPath: outputPathParent,
        testTime: new Date(),
        testTools: ["lighthouse"],
        setting: {
          userAgent: "xxxx",
        },
        iterations: 3,
        lighthouseOptions: {
          outputPath: "output/lighthouse",
        },
        metricsConfig: {
          good: {
            lcp: METRICS_CONFIG.GOOD.LCP,
            cls: METRICS_CONFIG.GOOD.CLS,
            fid: METRICS_CONFIG.GOOD.FID,
          },
          bad: {
            lcp: METRICS_CONFIG.BAD.LCP,
            cls: METRICS_CONFIG.BAD.CLS,
            fid: METRICS_CONFIG.BAD.FID,
          },
        },
      }
    );

    expect(reportPath).toEqual(`${outputPathParent}/report.html`);

    expect(statSync(`${outputPathParent}/report.html`).size).toBeGreaterThan(
      1000
    );
  });
});
