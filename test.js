const { compiler } = require("./index");

const str = `
    let a=12
    const b=21
`;

console.log(compiler(str));
