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
    let b
`;
const tokenizerStr = tokenizer(str);
// console.log(tokenizerStr);
const parserStr = parser(tokenizerStr);
// console.log(parserStr);
const transformerStr = transformer(parserStr);
const generatorStr = generator(transformerStr);
console.log(generatorStr);
