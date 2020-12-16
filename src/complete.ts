import * as recast from "recast";
import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import * as vm2 from "vm2";

import { builders as b, namedTypes as n } from "ast-types";
import type { Program } from "esprima";

function findFunc(ast: n.File, funcName: string): n.FunctionDeclaration {
  for (let i = 0; i < ast.program.body.length; i++) {
    let node = ast.program.body[i];
    if (n.FunctionDeclaration.check(node)) {
      if (node.id.name === funcName) {
        return node;
      }
    }
  }
}

function appendReturn(block: n.BlockStatement, name: string): n.BlockStatement {
  let id = b.identifier(name);
  let stmts = block.body;
  stmts = stmts.concat([b.returnStatement(id)]);

  return b.blockStatement(stmts);
}

function appendReturnLiteral(
  block: n.BlockStatement,
  value: number
): n.BlockStatement {
  let id = b.literal(value);
  let stmts = block.body;
  stmts = stmts.concat([b.returnStatement(id)]);

  return b.blockStatement(stmts);
}

function withPatchedSrc<T>(newSrc: string, srcPath: string, cb: () => T): T {
  srcPath = path.resolve(srcPath);
  let oldSrc = fs.readFileSync(srcPath, "utf8");

  fs.writeFileSync(srcPath, newSrc);
  delete require.cache[srcPath];

  let result = cb();

  fs.writeFileSync(srcPath, oldSrc);
  delete require.cache[srcPath];

  return result;
}

function sourcePassesTest(
  srcCode: string,
  srcPath: string,
  testCode: string,
  testPath: string
) {
  return withPatchedSrc(srcCode, srcPath, () => {
    let failureCount = 0;
    const vm = new vm2.NodeVM({
      sandbox: {
        test: function (_description: string, expectFn: () => void) {
          try {
            expectFn();
          } catch (e) {
            failureCount += 1;
          }
        },
      },
      require: {
        external: true,
      },
    });
    vm.run(testCode, testPath);
    return failureCount === 0;
  });
}

function parse(code: string): Program {
  return recast.parse(code);
}

export function evalForOutput(
  srcPath: string,
  funcName: string,
  testPath: string
) {
  srcPath = path.resolve(srcPath);

  let src = fs.readFileSync(srcPath, "utf8");
  let srcAst = parse(src);
  let testSrc = fs.readFileSync(testPath, "utf8");

  let f = findFunc(srcAst, funcName);

  let found = null;
  let body = f.body;
  // TODO: see if it works before we change anything

  _.forEach([0, 1, -1, 2], (val) => {
    f.body = appendReturnLiteral(body, val);
    let modifiedCode = recast.print(srcAst).code;

    if (sourcePassesTest(modifiedCode, srcPath, testSrc, testPath)) {
      found = srcAst;
      return false;
    }
  });

  if (found) {
    return found;
  }

  _.forEach(f.params, (param) => {
    let name = param.name;
    f.body = appendReturn(body, name);
    let modifiedCode = recast.print(srcAst).code;

    if (sourcePassesTest(modifiedCode, srcPath, testSrc, testPath)) {
      found = srcAst;
      return false;
    }
  });

  return found;
}
