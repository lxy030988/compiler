const AstNode = require('./AstNode')

const {
  NUMBER,
  PLUS,
  MULTIPLY,
  MINUS,
  DIVIDE,
  LEFT_PARA,
  RIGHT_PARA
} = require('./tokenTypes')
const {
  Program,
  Numeric,
  Additive,
  Multiple,
  Minus,
  Divide
} = require('./nodeTypes')

/**
2 + 3*4
add => minus | minus + add
minus => multiple | multiple - minus
multiple => divide | divide * multiple
divide => primary | primary / divide
primary => NUMBER | (add)  基础规则
从右往左算
这种出现连续减 或者 连续除 会有问题

 */
/**
正确的结合性
add => minus + add | minus
minus =>  multiple - minus | multiple
multiple =>  divide * multiple | divide
divide =>  NUMBER / divide | NUMBER
从左往右算
左递归的问题
 */

function toAst(tokenReader) {
  let rootNode = new AstNode(Program)
  //先推到加法
  let child = additiveFn(tokenReader)
  if (child) {
    rootNode.appendChild(child)
  }
  return rootNode
}

function additiveFn(tokenReader) {
  let child1 = minusFn(tokenReader)
  let node = child1
  let token = tokenReader.peek() //看下一个符合是不是 +
  if (child1 != null && token != null) {
    if (token.type == PLUS) {
      token = tokenReader.read()
      let child2 = additiveFn(tokenReader)
      if (child2 != null) {
        node = new AstNode(Additive)
        node.appendChild(child1)
        node.appendChild(child2)
      }
    }
  }
  return node
}

function minusFn(tokenReader) {
  let child1 = multipleFn(tokenReader)
  let node = child1
  let token = tokenReader.peek() //看下一个符合是不是 -
  if (child1 != null && token != null) {
    if (token.type == MINUS) {
      token = tokenReader.read()
      let child2 = minusFn(tokenReader)
      if (child2 != null) {
        node = new AstNode(Minus)
        node.appendChild(child1)
        node.appendChild(child2)
      }
    }
  }
  return node
}

function multipleFn(tokenReader) {
  let child1 = divideFn(tokenReader)
  let node = child1
  let token = tokenReader.peek() //+
  if (child1 != null && token != null) {
    if (token.type == MULTIPLY) {
      // NUMBER * multiple
      token = tokenReader.read() //读取并且消耗 *
      let child2 = multipleFn(tokenReader)
      if (child2 != null) {
        node = new AstNode(Multiple)
        node.appendChild(child1)
        node.appendChild(child2)
      }
    }
  }
  return node
}

function divideFn(tokenReader) {
  let child1 = primaryFn(tokenReader)
  let node = child1
  let token = tokenReader.peek()
  if (child1 != null && token != null) {
    if (token.type == DIVIDE) {
      token = tokenReader.read()
      let child2 = divideFn(tokenReader)
      if (child2 != null) {
        node = new AstNode(Divide)
        node.appendChild(child1)
        node.appendChild(child2)
      }
    }
  }
  return node
}

function primaryFn(tokenReader) {
  let node = numberFn(tokenReader)
  if (!node) {
    let token = tokenReader.peek()
    if (token != null && token.type == LEFT_PARA) {
      token = tokenReader.read() //读取并且消耗 (
      node = additiveFn(tokenReader)
      token = tokenReader.read() //读取并且消耗 )
    }
  }
  return node
}

function numberFn(tokenReader) {
  let node = null
  let token = tokenReader.peek()
  if (token != null && token.type == NUMBER) {
    token = tokenReader.read() //读取并消耗这个token
    node = new AstNode(Numeric, token.value)
  }
  return node
}

module.exports = toAst
