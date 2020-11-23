const { compiler } = require("./index");

const str = `
    let a=12
`;

console.log(compiler(str));
