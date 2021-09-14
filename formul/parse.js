const tokenizer = require('./tokenizer')

/**
 *
 * @param {String} script
 */
function parse(script) {
  let tokens = tokenizer(script)
  console.log('tokens', tokens)
}

module.exports = parse
