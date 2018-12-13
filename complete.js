let recast = require("recast");

// Let's turn this function declaration into a variable declaration.
let code = [
  "function add(a, b) {",
  "  return a +",
  "    // Weird formatting, huh?",
  "    b;",
  "}"
].join("\n");

// Parse the code using an interface similar to require("esprima").parse.
let ast = recast.parse(code);

// Grab a reference to the function declaration we just parsed.
let f = ast.program.body[0];

// Make sure it's a FunctionDeclaration (optional).
let n = recast.types.namedTypes;
n.FunctionDeclaration.assert(f);

let b = recast.types.builders;

function appendReturn(block, id) {
  let stmts = block.body;
  stmts = stmts.concat([b.returnStatement(id)]);

  return b.blockStatement(stmts);
}

let body = f.body;
f.params.forEach(param => {
  let name = param.name;
  f.body = appendReturn(body, b.identifier(name));

  // eslint-disable-next-line no-console
  console.log(recast.print(ast).code);
});
