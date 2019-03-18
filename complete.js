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

function sandboxEval(code) {
  const vm = new vm2.NodeVM({
    sandbox: {
      test: function() {
        console.log("inside test();");
      }
    },
    requireNative: ["module"],
    require: {
      external: true
    }
  });
  return vm.run(code).result;
}

function parseAndEval(code, srcPath, funcName, desiredOutput) {
  // Parse the code using an interface similar to require("esprima").parse.
  let ast = recast.parse(code);

  let f = findFunc(ast, funcName);

  let found = null;
  let body = f.body;
  f.params.forEach(param => {
    let name = param.name;
    f.body = appendReturn(body, name);
    let modifiedCode = recast.print(ast).code;

    fs.writeFileSync(srcPath, modifiedCode);

    let addedCall = "\n\nexports.result = " + funcName + "(1);";
    let finalCode = modifiedCode + addedCall;
    let result = sandboxEval(finalCode);

    if (result === desiredOutput) {
      found = ast;
      // TODO: early termination.
    }
  });

  return found;
}

function completeFromTest(srcPath, targetFunc, testPath) {
  let code = fs.readFileSync(srcPath, "utf8");
  fs.readFileSync(testPath, "utf8"); // TODO

  let found = parseAndEval(code, srcPath, targetFunc, 1);
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

completeFromTest("roman_numerals.js", "toNumber", "roman_numerals.test.js");
