const { NUMBER, PLUS, MULTIPLY } = require('./tokenTypes')
const tokensNames = [NUMBER, PLUS, MULTIPLY]

let RegExpObject = /([0-9]+)|(\+)|(\*)/g

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
  return tokens
}

module.exports = tokenizer
