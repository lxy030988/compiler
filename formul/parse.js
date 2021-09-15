const tokenizer = require('./tokenizer')
const toAst = require('./toAst')

/**
 *
 * @param {String} script
 */
function parse(script) {
  let tokenReader = tokenizer(script)
  let ast = toAst(tokenReader)
  return ast
}

module.exports = parse
