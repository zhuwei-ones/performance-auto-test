import { DEFAULT_REPORT_DIR } from "../src/const";
import { runLighthouse } from "../src/lib/lighthouse";
import { getOutputPath } from "../src/utils";

jest.setTimeout(1000000) 

test("Test Ligthhouse Entry", async () => {
  const result = await runLighthouse({
    urls: [
      "http://baidu.com",
      "https://dev.myones.net/web-ones-com/feature_performance_optimize_20230118"],
    iterations: 2,
    outputPath:getOutputPath()
  });

  console.log("result", result);
});
