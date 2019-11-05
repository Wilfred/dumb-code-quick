const roman = require("./roman_numerals");
const expect = require("expect");

test("Roman: I Number: 1", () => {
  expect(roman.toNumber("I")).toBe(1);
});

test("Roman: II Number: 2", () => {
  expect(roman.toNumber("II")).toBe(2);
});
