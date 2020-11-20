const {
  tokenizer,
  parser,
  traverser,
  transformer,
  generator,
  compiler,
} = require("./index");

const str = `
    let a=12
    let b=1
`;
const tokenizerStr = tokenizer(str);
// console.log(tokenizerStr);
const parserStr = parser(tokenizerStr);
console.log(parserStr);
