const { compiler } = require("./index");

const str = `

const a = (b) => {
  let c=1
}

`;

console.log(compiler(str));
