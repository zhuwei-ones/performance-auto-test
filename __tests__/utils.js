import json2md from "json2md";
import { getLighthouseReportLinks, getSitespeedReportLinks } from "../src/utils"

// test("Test getLighthouseReportLinks", async () => {


//    const result =  getLighthouseReportLinks({
//         outputPath:"/Users/ONES-Projects/MyDev/auto-performace-test/performance-test-report/2023_2_13_19_37_12/lighthoust-result"
//     })


//    const content =  json2md(result)

//    console.log("content",content);

//     console.log("result",JSON.stringify(result,null,{space:2}));
// })


test("Test getSitespeedReportLinks", async () => {


    const result =  getSitespeedReportLinks({
        outputPath:"/Users/ONES-Projects/MyDev/auto-performace-test/performance-test-report/2023_2_13_20_38_53",
        sitespeedOutputPath:"/Users/ONES-Projects/MyDev/auto-performace-test/performance-test-report/2023_2_13_20_38_53/sitespeed-result"
     })
 
 
    const content =  json2md(result)
 
    console.log("content",content);
 
     console.log("result",JSON.stringify(result,null,{space:2}));
 })