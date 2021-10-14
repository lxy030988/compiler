//2 + 3*4
//https://img.zhufengpeixun.com/formularast.png
//https://img.zhufengpeixun.com/binaryast.jpg

// add => multiple | multiple+add
// multiple => NUMBER | NUMBER*multiple

const parse = require('./parse')
const evaluate = require('./evaluate')
let source = '9-1-1+2+4*8/2/2*(1+2)'
let ast = parse(source)
console.log(JSON.stringify(ast, null, 2))
let res = evaluate(ast)
console.log(res)
