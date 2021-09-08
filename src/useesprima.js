let esprima = require('esprima')
let estraverse = require('estraverse-fb')
let source = '<div id="aa"><span>lxy</span>222</div>'
let ast = esprima.parseModule(source, { jsx: true, tokens: true })
// console.log(ast)

let ident = 0
function tab() {
  return ' '.repeat(ident)
}

//visitor访问者 访问器
estraverse.traverse(ast, {
  enter(node) {
    console.log(tab(), node.type, 'enter')
    ident += 2
  },
  leave(node) {
    ident -= 2
    console.log(tab(), node.type, 'leave')
  }
})

/**
 * esprima => 1.分词 得到一个token数组
 * 2.token数组转成抽象语法树
{
  type: 'Program',
  body: [
    ExpressionStatement {
      type: 'ExpressionStatement',
      expression: [JSXElement]
    }
  ],
  sourceType: 'module',
  tokens: [
    { type: 'Punctuator', value: '<' },
    { type: 'JSXIdentifier', value: 'div' },
    { type: 'JSXIdentifier', value: 'id' },
    { type: 'Punctuator', value: '=' },
    { type: 'String', value: '"aa"' },
    { type: 'Punctuator', value: '>' },
    { type: 'Punctuator', value: '<' },
    { type: 'JSXIdentifier', value: 'span' },
    { type: 'Punctuator', value: '>' },
    { type: 'JSXText', value: 'lxy' },
    { type: 'Punctuator', value: '<' },
    { type: 'Punctuator', value: '/' },
    { type: 'JSXIdentifier', value: 'span' },
    { type: 'Punctuator', value: '>' },
    { type: 'JSXText', value: '222' },
    { type: 'Punctuator', value: '<' },
    { type: 'Punctuator', value: '/' },
    { type: 'JSXIdentifier', value: 'div' },
    { type: 'Punctuator', value: '>' }
  ]
}
 */
