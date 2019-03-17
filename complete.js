let fs = require("fs");
let vm2 = require("vm2");
let recast = require("recast");
let b = recast.types.builders;
let n = recast.types.namedTypes;

function findFunc(ast, funcName) {
  for (let i = 0; i < ast.program.body.length; i++) {
    let node = ast.program.body[i];
    if (n.FunctionDeclaration.check(node)) {
      if (node.id.name === funcName) {
        return node;
      }
    }
  }
}

function appendReturn(block, name) {
  let id = b.identifier(name);
  let stmts = block.body;
  stmts = stmts.concat([b.returnStatement(id)]);

  return b.blockStatement(stmts);
}

function parseAndEval(code, funcName, desiredOutput) {
  // Parse the code using an interface similar to require("esprima").parse.
  let ast = recast.parse(code);

  let f = findFunc(ast, funcName);

  let found = null;
  let body = f.body;
  f.params.forEach(param => {
    let name = param.name;
    f.body = appendReturn(body, name);

    let addedCall = "\n\nexports.result = " + funcName + "(1);";
    let modifiedCode = recast.print(ast).code;
    let finalCode = modifiedCode + addedCall;

    const vm = new vm2.NodeVM({
      requireNative: ["module"],
      require: {
        external: true
      }
    });
    let result = vm.run(finalCode).result;

    if (result === desiredOutput) {
      found = ast;
      // TODO: early termination.
    }
  });

  return found;
}

let code = fs.readFileSync("roman_numerals.js", "utf8");
let found = parseAndEval(code, "toNumber", 1);
if (found === null) {
  // eslint-disable-next-line no-console
  console.log("No completion found that passes this test.");
} else {
  // eslint-disable-next-line no-console
  console.log("Found!");
  // eslint-disable-next-line no-console
  console.log(recast.print(found).code);
}
