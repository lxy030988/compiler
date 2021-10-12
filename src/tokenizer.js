const {
  LeftPunctuator,
  JSXIdentifier,
  AttributeKey,
  AttributeStringValue,
  RightPunctuator,
  JSXText,
  BackSlashPunctuator,
  EquatorPunctuator
} = require('./tokenTypes')
const LEFTERS = /[a-z0-9]/

let currentToken = { type: '', value: '' }
let tokens = []

/**
 * 确定一个新token了
 * @param {*} token
 */
function emit(token) {
  currentToken = { type: '', value: '' }
  tokens.push(token)
}

/**
 * start表示开始状态
 * 它是一个函数，接收一个字符，返回下一个状态函数
 * @param {String} char
 */
function start(char) {
  if (char === '<') {
    emit({ type: LeftPunctuator, value: char })
    return foundLeftPunctuator //找到了 <
  }
  throw new Error('first char must be <')
}

function foundLeftPunctuator(char) {
  //char=div
  if (LEFTERS.test(char)) {
    //如果char是一个小写字母
    currentToken.type = JSXIdentifier
    currentToken.value += char
    return jSXIdentifierFn //继续收集标识符
  } else if (char === '/') {
    emit({ type: BackSlashPunctuator, value: char })
    return foundLeftPunctuator
  }
}

function jSXIdentifierFn(char) {
  if (LEFTERS.test(char)) {
    //如果char是一个小写字母或者数字
    currentToken.value += char
    return jSXIdentifierFn
  } else if (char === ' ') {
    //遇到空格 标识符结束
    emit(currentToken)
    return attribute
  } else if (char === '>') {
    //说明次标签没有属性 直接结束
    emit(currentToken)
    emit({ type: RightPunctuator, value: char })
    return foundRightPunctuator
  }
}

function attribute(char) {
  if (LEFTERS.test(char)) {
    currentToken.type = AttributeKey //属性的key
    currentToken.value += char //属性key的名字
    return attributeKeyFn
  }
  throw new TypeError('TypeError AttributeKey')
}

function attributeKeyFn(char) {
  if (LEFTERS.test(char)) {
    currentToken.value += char
    return attributeKeyFn
  } else if (char === '=') {
    //属性key的名字 结束
    emit(currentToken)
    emit({ type: EquatorPunctuator, value: char })
    return attributeValue
  }
}
function attributeValue(char) {
  //char="
  if (char === '"') {
    currentToken.type = AttributeStringValue
    return attributeStringValueFn //开始读字符串属性的值
  }
  throw new TypeError('TypeError AttributeStringValue')
}
function attributeStringValueFn(char) {
  if (LEFTERS.test(char)) {
    currentToken.value += char
    return attributeStringValueFn
  } else if (char === '"') {
    //属性的值 结束
    emit(currentToken)
    return tryLevelAttribute
  }
}
function tryLevelAttribute(char) {
  if (char === ' ') {
    return attribute
  } else if (char === '>') {
    //开始标签结束
    emit({ type: RightPunctuator, value: char })
    return foundRightPunctuator
  }
  throw new TypeError('TypeError tryLevelAttribute')
}

function foundRightPunctuator(char) {
  if (char === '<') {
    emit({ type: LeftPunctuator, value: char })
    return foundLeftPunctuator //找到了 <
  } else {
    currentToken.type = JSXText
    currentToken.value += char
    return jSXTextFn
  }
}

function jSXTextFn(char) {
  if (LEFTERS.test(char)) {
    currentToken.value += char
    return jSXTextFn
  } else if (char === '<') {
    //lxy
    emit(currentToken)
    emit({ type: LeftPunctuator, value: char })
    return foundLeftPunctuator
  }
}

function tokenizer(input) {
  // let tokens = []
  let state = start //刚开始的时候是start状态
  for (let char of input) {
    state = state(char)
  }
  return tokens
}

module.exports = {
  tokenizer
}

// let source = '<div id="aa"><span>lxy</span>222</div>'

// console.log(tokenizer(source))

/**
 * [
    { type: 'LeftPunctuator', value: '<' },
    { type: 'JSXIdentifier', value: 'div' },
    { type: 'JSXIdentifier', value: 'id' },
    { type: 'EquatorPunctuator', value: '=' },
    { type: 'String', value: '"aa"' },
    { type: 'RightPunctuator', value: '>' },
    { type: 'LeftPunctuator', value: '<' },
    { type: 'JSXIdentifier', value: 'span' },
    { type: 'RightPunctuator', value: '>' },
    { type: 'JSXText', value: 'lxy' },
    { type: 'LeftPunctuator', value: '<' },
    { type: 'BackSlashPunctuator', value: '/' },
    { type: 'JSXIdentifier', value: 'span' },
    { type: 'RightPunctuator', value: '>' },
    { type: 'JSXText', value: '222' },
    { type: 'LeftPunctuator', value: '<' },
    { type: 'BackSlashPunctuator', value: '/' },
    { type: 'JSXIdentifier', value: 'div' },
    { type: 'RightPunctuator', value: '>' }
  ]
 */
