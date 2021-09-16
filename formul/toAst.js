const AstNode = require('./AstNode')

const { NUMBER, PLUS, MULTIPLY } = require('./tokenTypes')
const { Program, Numeric, Additive, Multiple } = require('./nodeTypes')

//2 + 3*4
// add => multiple | multiple+add
// multiple => NUMBER | NUMBER*multiple

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
  let child1 = multipleFn(tokenReader)
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

function multipleFn(tokenReader) {
  let child1 = numberFn(tokenReader) //先匹配出来一个NUMBER 但是这个乘法规则并没有结束
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
