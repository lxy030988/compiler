const { compiler } = require("./index");

const str = `

const a = (b) => {
  let c=1
  return b+c
}

`;

console.log(compiler(str));
