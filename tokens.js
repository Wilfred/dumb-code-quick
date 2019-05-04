var acorn = require("acorn");

var src = "function foo(x) { var y = x + 2; if (y) { return 3; } return y; }";
for (var token of acorn.tokenizer(src)) {
  // TODO: +/-, function call need name.
  console.log(token.type.label);
}
