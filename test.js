var compiler = require("./index");
var str = `
    let a=12
    let b=1
`;

var newStr = compiler.tokenizer(str);
console.log(newStr);
