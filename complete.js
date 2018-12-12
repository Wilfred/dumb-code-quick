var recast = require("recast");

// Let's turn this function declaration into a variable declaration.
var code = [
  "function add(a, b) {",
  "  return a +",
  "    // Weird formatting, huh?",
  "    b;",
  "}"
].join("\n");

// Parse the code using an interface similar to require("esprima").parse.
var ast = recast.parse(code);

// Grab a reference to the function declaration we just parsed.
var f = ast.program.body[0];

// Make sure it's a FunctionDeclaration (optional).
var n = recast.types.namedTypes;
n.FunctionDeclaration.assert(f);

// If you choose to use recast.builders to construct new AST nodes, all builder
// arguments will be dynamically type-checked against the Mozilla Parser API.
var b = recast.types.builders;

function appendReturn(block, id) {
  var stmts = block.body;
  stmts = stmts.concat([b.returnStatement(id)]);

  return b.blockStatement(stmts);
}

f.body = appendReturn(f.body, b.identifier("foo"));

console.log(recast.print(ast).code);
