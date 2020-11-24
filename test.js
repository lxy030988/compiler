const { compiler } = require("./index");

const str = `

let a = 1

`;

console.log(compiler(str));

const a = (b) => {
  return b;
};
