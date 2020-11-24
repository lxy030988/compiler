//词素生成器 返回所有的token
function tokenizer(input) {
  //当前遍历到的位置
  let current = 0;
  //保存所有token
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    //处理标点符号的情况   正则匹配单个字符，不会回溯
    const PUNCTUATOR = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im;
    if (PUNCTUATOR.test(char)) {
      let punctuators = char;

      //判断 => 箭头函数的情况
      if (char === "=" && input[current + 1] === ">") {
        punctuators += input[current + 1];
        current++;
      }

      current++;

      tokens.push({
        type: "Punctuator",
        value: punctuators,
      });

      continue;
    }

    //处理空格的情况
    const WHITE_SPACE = /\s/;
    if (WHITE_SPACE.test(char)) {
      current++;
      continue;
    }

    //处理数字的情况
    let NUMBER = /[0-9]/;
    if (NUMBER.test(char)) {
      let number = "";
      // 循环遍历接下来的字符，直到下一个字符不是数字为止
      while (NUMBER.test(char)) {
        number += char;
        char = input[++current];
      }

      tokens.push({
        type: "Number",
        value: number,
      });

      continue;
    }

    // 处理字符的情况
    const LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = "";

      // 用一个循环遍历所有的字母，把它们存入 value 中。
      while (LETTERS.test(char)) {
        value += char; //'let'
        char = input[++current];
      }

      // 判断当前字符串是否是关键字
      const KEYWORD = /function|var|return|let|const|if|for/i;
      if (KEYWORD.test(value)) {
        //关键字
        tokens.push({
          type: "Keyword",
          value: value,
        });
      } else {
        //变量名
        tokens.push({
          type: "Identifier",
          value: value,
        });
      }

      continue;
    }

    throw new Error("不能够被识别的字符");
  }

  return tokens;
}

//语法解析 接受所有的token 生成AST
function parser(tokens) {
  //记录当前解析的token的位置
  let current = 0;

  //创建一个抽象语法树，根节点为‘program’，表示是一个程序
  let ast = {
    type: "Program",
    body: [],
    sourceType: "script", //表示是一个脚本
  };

  //循环所有的token，按照对应的语法开始构建AST
  while (current < tokens.length) {
    ast.body.push(walk());
  }

  //递归遍历tokens，生成AST
  function walk() {
    //当前需要解析的token
    const token = tokens[current];
    if (!token) return {};
    // 数字
    if (token.type === "Number") {
      current++;
      //返回一个新的 AST 结点
      return {
        type: "NumberLiteral",
        value: Number(token.value),
        row: token.value,
      };
    }

    // 变量
    if (token.type === "Identifier") {
      current++;
      //返回一个新的 AST 结点
      return {
        type: "Identifier",
        name: token.value,
      };
    }

    // 标点符号
    if (token.type === "Punctuator") {
      current++;
      // 判断运算符类型，根据类型返回新的 AST 节点
      if (/[\+\-\*/]/im.test(token.value)) {
        //运算字符
        return {
          type: "BinaryExpression",
          operator: token.value,
        };
      }
      if (/\=/.test(token.value)) {
        //赋值字符
        return {
          type: "AssignmentExpression",
          operator: token.value,
        };
      }
    }

    // 关键字
    if (token.type === "Keyword") {
      const value = token.value;
      // 检查是不是 let var const等等
      if (value === "var" || value === "let" || value === "const") {
        current++;

        // 获取关键字后面的变量名，let a = 1; //获取a
        const variable = walk(); //返回变量字符
        // 判断是否是赋值符号
        const equal = walk(); //获取变量后面的下一个字符可能是let a=1;可能是let a;

        let rightValue; // = 右边的值
        //赋值的情况，获取表达式的内容  let a = 1
        if (equal.operator === "=") {
          // 获取所赋予的值
          rightValue = walk();
        } else {
          // 不是赋值符号，说明只是定义变量 let a
          rightValue = {
            type: "Null",
            value: null,
          };
          current--;
        }

        // 定义声明
        const declaration = {
          type: "VariableDeclarator",
          id: variable, // 定义的变量
          init: rightValue, // 赋予的值
        };

        // 定义要返回的节点
        return {
          type: "VariableDeclaration",
          declarations: [declaration],
          kind: value,
        };
      }
    }

    throw new TypeError(token.type);
  }

  return ast;
}

/**
 * 遍历器，可以访问所有节点，接受要访问的AST和访问器
 * 访问器visitor内部可以有对应某一个节点的处理方法
 */
function traverser(ast, visitor) {
  // 遍历树中每个节点，调用 traverseNode
  function traverseArray(array, parent) {
    if (typeof array.forEach === "function") {
      array.forEach((child) => {
        traverseNode(child, parent);
      });
    }
  }

  // 处理 ast 节点的函数, 使用 visitor 定义的转换函数进行转换
  function traverseNode(node, parent) {
    // 首先看看 visitor 中有没有对应 type 的处理函数。
    const method = visitor[node.type];

    if (method) {
      method(node, parent);
    }

    // 下面对每一个不同类型的结点分开处理
    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "VariableDeclaration":
        traverseArray(node.declarations, node);
        break;

      case "VariableDeclarator":
        traverseArray(node.init, node);
        break;

      case "AssignmentExpression":
        traverseArray(node.right, node);
        break;

      // 如果是变量和数值，直接退出
      case "Identifier":
      case "NumberLiteral":
        break;

      default:
        throw new TypeError(node.type);
    }
  }
  // 最后我们对 AST 调用 traverseNode，开始遍历。注意 AST 并没有父结点。
  traverseNode(ast, null);
}

//转换函数  接受一个抽象语法树
function transformer(ast) {
  // 创建一个新的 ast 抽象语法树
  let newAst = {
    type: "Program",
    body: [],
    sourceType: "script",
  };

  // 在父结点上定义一个属性 context（上下文），之后，就可以把结点放入他们父结点的 context 中。
  // context是一个从旧的抽象语法树到新的抽象语法树的引用
  ast._context = newAst.body;

  // 我们把 AST 和 visitor 函数传入遍历器
  // 遍历的过程中，访问遍历器具体的逻辑，直接生成新的AST
  traverser(ast, {
    // 把 VariableDeclaration kind 属性进行转换
    VariableDeclaration(node, parent) {
      let variableDeclaration = {
        type: "VariableDeclaration",
        declarations: [],
        kind: "var",
      };
      node._context = variableDeclaration.declarations;
      // 把新的 VariableDeclaration 放入到 context 中。
      parent._context.push(variableDeclaration);
    },
    VariableDeclarator(node, parent) {
      let declaration = {
        type: "VariableDeclarator",
        id: node.id,
        // id: { ...node.id, name: "_" + node.id.name },
        init: node.init,
      };
      node._context = declaration;
      parent._context.push(declaration);
    },
  });

  // 最后返回创建好的新 AST
  return newAst;
}

//基于新的AST，生成代码
function generator(node) {
  // 对于不同类型的结点分开处理
  switch (node.type) {
    // 如果是 Program 结点，那么我们会遍历它的 body 属性中的每一个结点，然后做一次拼接。
    case "Program":
      return node.body.map(generator).join("\n");

    // VariableDeclaration 结点  var a类似的语句，也有可能声明多个变量
    case "VariableDeclaration":
      return node.kind + " " + node.declarations.map(generator).join("\n");

    // VariableDeclarator 节点   var a | var a=1
    case "VariableDeclarator":
      if (generator(node.init) == null) return generator(node.id);
      return generator(node.id) + " = " + generator(node.init);

    // 处理变量
    case "Identifier":
      return node.name;

    // 处理数值
    case "NumberLiteral":
      return node.value;

    case "Null":
      return null;

    default:
      throw new TypeError(node.type);
  }
}

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const afterAST = transformer(ast);
  const output = generator(afterAST);
  return output;
}

module.exports = {
  tokenizer,
  parser,
  traverser,
  transformer,
  generator,
  compiler,
};
