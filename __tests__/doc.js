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

describe("Test Report doc", () => {
  test("Test util getReportConclusion", async () => {
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
        compareMetricsType:"avg"
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

  });

  test("Test util getReportConclusion p75", async () => {

    expect(
      getReportConclusion({
        performanceResultList: {
          lighthouse: {
            baidu_com__: {
              metircs: {
                CLS: 100,
                CLS_75: 0.1,
                FCP: 980,
                FID: 0,
                FID_75: 100,
                LCP: 1315,
                LCP_75: 900,
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
        compareMetricsType:"p75"
      })
    ).toEqual([
      { h2: "测试结论" },
      {
        table: {
          headers: ["Page", "lighthouse"],
          rows: [["http://baidu.com", { greenText: "通过" }]],
        },
      },
    ]);

  });

  test("Test util getToolCompareTableData", async () => {

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

  })

  test("Test MD DOC", async () => {

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
        reportType: "md",
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
        compareMetricsType:"avg"
      }
    );

    expect(reportPath).toEqual(`${outputPathParent}/report.md`);

    expect(statSync(`${outputPathParent}/report.md`).size).toBeGreaterThan(
      1000
    );

  })

  test("Test Default Doc", async () => {
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
        compareMetricsType:"avg"
      }
    );

    expect(reportPath).toEqual(`${outputPathParent}/report.html`);

    expect(statSync(`${outputPathParent}/report.html`).size).toBeGreaterThan(
      1000
    );
  });

});
