//2 + 3*4
//https://img.zhufengpeixun.com/formularast.png
//https://img.zhufengpeixun.com/binaryast.jpg

// add => multiple | multiple+add
// multiple => NUMBER | NUMBER*multiple

const parse = require('./parse')
let source = '2+3*4'
let ast = parse(source)
console.log(ast)
