const { compiler } = require("./index");

const str = `

const a = (b,d) => {
  let c=1
  return b+c+d
}

`;

console.log(compiler(str));
