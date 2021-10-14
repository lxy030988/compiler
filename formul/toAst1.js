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
 用扩展的巴科范式一类表示
*正则表达式 表示0或多个 
add => multiple ( + multiple)*
multiple=> NUMBER (* NUMBER)*
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
//2+3+4+5+6
function additiveFn(tokenReader) {
  let child1 = multipleFn(tokenReader) //2
  let node = child1
  if (child1 != null) {
    while (true) {
      let token = tokenReader.peek() //看下一个符合是不是 +
      if (token && (token.type == PLUS || token.type == MINUS)) {
        token = tokenReader.read() //消耗+
        let child2 = multipleFn(tokenReader) //3
        node = new AstNode(token.type == PLUS ? Additive : Minus)
        node.appendChild(child1)
        node.appendChild(child2)
        child1 = node
      } else {
        break
      }
    }
  }
  return node
}

function multipleFn(tokenReader) {
  let child1 = primaryFn(tokenReader)
  let node = child1
  if (child1 != null) {
    while (true) {
      let token = tokenReader.peek() //+
      if (token && (token.type == MULTIPLY || token.type == DIVIDE)) {
        // NUMBER * multiple
        token = tokenReader.read() //读取并且消耗 *
        let child2 = primaryFn(tokenReader)
        node = new AstNode(token.type == MULTIPLY ? Multiple : Divide)
        node.appendChild(child1)
        node.appendChild(child2)
        child1 = node
      } else {
        break
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
