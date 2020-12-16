import * as recast from "recast";
import { evalForOutput } from "./complete";

function completeFromTest(
  srcPath: string,
  targetFunc: string,
  testPath: string
) {
  let found = evalForOutput(srcPath, targetFunc, testPath);
  if (found === null) {
    // eslint-disable-next-line no-console
    console.log("No completion found that passes this test.");
  } else {
    // eslint-disable-next-line no-console
    console.log("Found!");
    // eslint-disable-next-line no-console
    console.log(recast.print(found).code);
  }
}

completeFromTest(
  "examples/roman_numerals.js",
  "toNumber",
  "examples/roman_numerals.test.js"
);
