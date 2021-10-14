const {
  NUMBER,
  PLUS,
  MULTIPLY,
  MINUS,
  DIVIDE,
  LEFT_PARA,
  RIGHT_PARA
} = require('./tokenTypes')
const tokensNames = [
  NUMBER,
  PLUS,
  MULTIPLY,
  MINUS,
  DIVIDE,
  LEFT_PARA,
  RIGHT_PARA
]

let RegExpObject = /(-?[0-9]+)|(\+)|(\*)|(\-)|(\/)|(\()|(\))/g

function* gtokenizer(script) {
  let result
  while (true) {
    result = RegExpObject.exec(script)
    //result 0 匹配的字符 1 ([0-9]+) 2 (\+) 3 (\*)
    if (!result) {
      break
    }
    let index = result.findIndex((item, index) => index > 0 && !!item)
    let token = { type: tokensNames[index - 1], value: result[0] }
    yield token
  }
}

function tokenizer(script) {
  let tokens = []
  for (let token of gtokenizer(script)) {
    tokens.push(token)
  }
  return new TokenReader(tokens)
}

class TokenReader {
  constructor(tokens) {
    this.tokens = tokens
    this.pos = 0 //索引
  }

  //读取一个token
  read() {
    if (this.pos < this.tokens.length) {
      return this.tokens[this.pos++] //取完token pos+1 相当于消耗了这个token
    }
    return null
  }

  peek() {
    if (this.pos < this.tokens.length) {
      return this.tokens[this.pos]
    }
    return null
  }

  //倒退
  unread() {
    if (this.pos > 0) {
      this.pos--
    }
  }
}

module.exports = tokenizer
