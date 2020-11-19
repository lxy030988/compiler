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
        //变量
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

/**
 * 语法解析函数，接受所有的token
 * 此程序只对AST的赋值做了处理，没有处理构建运算表达式
 * @param {*} tokens 所有的token
 */
function parser(tokens) {
  //记录当前解析的token的位置
  var current = 0;

  //声明一个AST的基本架构，根节点为‘program’，表示是一个程序
  var ast = {
    type: "Program",
    body: [],
    sourceType: "script", //表示是一个脚本
  };
  //循环所有的token，按照对应的语法开始构建AST
  while (current < tokens.length) {
    ast.body.push(walk());
  }
  /**
   * 通过遍历tokens，来构建对应的一颗AST树，需要有对应的语法规范
   */
  function walk() {
    //从当前token开始解析
    var token = tokens[current];
    //var

    //需要根据语法来处理不同的token
    if (token.type === "Number") {
      // 如果是，current 自增。
      current++;
      // 然后我们会返回一个新的 AST 结点
      return {
        type: "Literal",
        value: Number(token.value),
        row: token.value,
      };
    }

    // 检查是不是变量类型 let a=1
    if (token.type === "Identifier") {
      // 如果是，current 自增。
      current++;
      // 然后我们会返回一个新的 AST 结点
      return {
        type: "Identifier",
        name: token.value,
      };
    }

    // 检查是不是运算符类型
    if (token.type === "Punctuator") {
      // 如果是，current 自增。
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

    // 检查是不是关键字
    if (token.type === "Keyword") {
      var value = token.value;
      // 检查是不是定义语句 let \var等等
      if (value === "var" || value === "let" || value === "const") {
        // var
        current++;

        // 获取后边要定义的变量，var a;//获取a
        var variable = walk(); //返回变量字符
        // 判断是否是赋值符号
        var equal = walk(); //获取变量后面的下一个字符可能是var a=1;可能是var a;
        var rightVar;

        //var a =
        //赋值的情况，获取表达式的内容
        if (equal.operator === "=") {
          // 获取所赋予的值
          rightVar = walk();
        } else {
          // 不是赋值符号，说明只是定义变量
          rightVar = null;
          current--;
        }
        // 定义声明
        var declaration = {
          type: "VariableDeclarator",
          id: variable, // 定义的变量
          init: rightVar, // 赋予的值
        };
        // 定义要返回的节点
        return {
          type: "VariableDeclaration",
          declarations: [declaration],
          kind: value,
        };
      }
    }
  }

  //返回最后构建成功的AST
  return ast;
}

/**
 * 遍历器，可以访问所有节点，接受要访问的AST和访问器
 * 访问器visitor内部可以有对应某一个节点的处理方法
 */
function traverser(ast, visitor) {
  // 遍历树中每个节点，调用 traverseNode
  function traverseArray(array, parent) {
    if (typeof array.forEach === "function")
      array.forEach(function (child) {
        traverseNode(child, parent);
      });
  }

  // 处理 ast 节点的函数, 使用 visitor 定义的转换函数进行转换
  function traverseNode(node, parent) {
    // 首先看看 visitor 中有没有对应 type 的处理函数。
    var method = visitor[node.type];
    // 如果有，参入参数
    if (method) {
      method(node, parent);
    }

    // 下面对每一个不同类型的结点分开处理。
    switch (node.type) {
      // 从顶层的 Program 开始
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
      case "Literal":
        break;

      // 同样，如果不能识别当前的结点，那么就抛出一个错误。
      default:
        throw new TypeError(node.type);
    }
  }
  // 最后我们对 AST 调用 traverseNode，开始遍历。注意 AST 并没有父结点。
  traverseNode(ast, null);
}

/**
 * 定义转换函数，
 * @param {*} ast
 */
function transformer(ast) {
  // 创建新的 ast 抽象树
  var newAst = {
    type: "Program",
    body: [],
    sourceType: "script",
  };

  // 在父结点上定义一个属性 context（上下文），之后，就可以把结点放入他们父结点的 context 中。
  ast._context = newAst.body;

  // 我们把 AST 和 visitor 函数传入遍历器
  // 遍历的过程中，访问遍历器具体的逻辑，直接生成新的AST
  traverser(ast, {
    // 把 VariableDeclaration kind 属性进行转换
    VariableDeclaration: function (node, parent) {
      var variableDeclaration = {
        type: "VariableDeclaration",
        declarations: node.declarations,
        kind: "var",
      };
      // 把新的 VariableDeclaration 放入到 context 中。
      parent._context.push(variableDeclaration);
    },
  });

  // 最后返回创建好的新 AST。
  return newAst;
}

/**
 * 生成代码的构成，基于AST
 * @param {*} node
 */
function generator(node) {
  // 对于不同类型的结点分开处理
  switch (node.type) {
    // 如果是 Program 结点，那么我们会遍历它的 body 属性中的每一个结点，然后做一次拼接。
    case "Program":
      return node.body.map(generator).join("\n");

    // VariableDeclaration 结点  var a类似的语句，也有可能声明多个变量
    case "VariableDeclaration":
      return node.kind + " " + node.declarations.map(generator).join("\n");
    //var  a = 1
    // VariableDeclarator 节点 有赋值表达式的情况
    case "VariableDeclarator":
      return generator(node.id) + " = " + generator(node.init);

    // 处理变量
    case "Identifier":
      return node.name;

    // 处理数值
    case "Literal":
      return node.value;

    default:
      throw new TypeError(node.type);
  }
}

function compiler(input) {
  var tokens = tokenizer(input);
  var ast = parser(tokens);
  var afterAST = transformer(ast);
  var output = generator(afterAST);
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
