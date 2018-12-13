let vm = require("vm");
let recast = require("recast");
let b = recast.types.builders;
let n = recast.types.namedTypes;

// Let's turn this function declaration into a variable declaration.
let code = "function add(a, b) {}";

// Parse the code using an interface similar to require("esprima").parse.
let ast = recast.parse(code);

// Grab a reference to the function declaration we just parsed.
let f = ast.program.body[0];

// Make sure it's a FunctionDeclaration (optional).
n.FunctionDeclaration.assert(f);

function appendReturn(block, id) {
  let stmts = block.body;
  stmts = stmts.concat([b.returnStatement(id)]);

  return b.blockStatement(stmts);
}

let body = f.body;
f.params.forEach(param => {
  let name = param.name;
  f.body = appendReturn(body, b.identifier(name));

  let finalCode = recast.print(ast).code + "\nadd(1, 2);";

  // eslint-disable-next-line no-console
  console.log(finalCode);

  let result = vm.runInNewContext(finalCode);

  // eslint-disable-next-line no-console
  console.log(result);
});
