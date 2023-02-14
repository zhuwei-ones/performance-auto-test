import PerformanceTest from "../src";

jest.setTimeout(1000000) 

test("Test Main Entry", async () => {
  const result = await PerformanceTest({
    urls: [
      // "https://dev.myones.net/web-ones-com/feature_performance_optimize_20230118",
      // "https://previewglobal.myones.net",
      "http://ones.com",
      // "http://127.0.0.1:8080",
    ],
    iterations: 5
  });
  console.log("result", result);

  return 

});
