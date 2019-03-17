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

function parseAndEval(code, funcName) {
  // Parse the code using an interface similar to require("esprima").parse.
  let ast = recast.parse(code);

  let f = findFunc(ast, funcName);

  function appendReturn(block, id) {
    let stmts = block.body;
    stmts = stmts.concat([b.returnStatement(id)]);

    return b.blockStatement(stmts);
  }

  let body = f.body;
  f.params.forEach(param => {
    let name = param.name;
    f.body = appendReturn(body, b.identifier(name));

    let addedCall = "\n\nexports.result = " + funcName + "(1, 2);";
    let finalCode = recast.print(ast).code + addedCall;

    // eslint-disable-next-line no-console
    console.log(finalCode);

    const vm = new vm2.NodeVM({
      requireNative: ["module"],
      require: {
        external: true
      }
    });
    let result = vm.run(finalCode);

    // eslint-disable-next-line no-console
    console.log(result.result);
  });
}

let code = fs.readFileSync("roman_numerals.js", "utf8");
parseAndEval(code, "toNumber");
