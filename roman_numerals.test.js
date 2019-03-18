const roman = require("./roman_numerals");
const expect = require("expect");

test("Roman: I Number: 1", () => {
  expect(roman.toNumber("I")).toBe(1);
});
