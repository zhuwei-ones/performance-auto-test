import { runSitespeed } from "../src/lib/sitespeed";
import { getOutputPath } from "../src/utils";

jest.setTimeout(1000000) 

test("Test Sitespeed Entry", async () => {
  const result = await  runSitespeed({
    urls: [
      "https://dev.myones.net/web-ones-com/feature_performance_optimize_20230118"
    ],
    iterations: 2,
    outputPath:getOutputPath()
  });

  console.log("result", result);
});
