const nodeTypes = require('./nodeTypes')

function codeGenerator(node) {
  switch (node.type) {
    case nodeTypes.Program:
      return node.body.map(codeGenerator).join('\n')
    case nodeTypes.ExpressionStatement:
      return codeGenerator(node.expression)
    case nodeTypes.CallExpression:
      return (
        codeGenerator(node.callee) +
        `(${node.args.map(codeGenerator).join(',')})`
      )
    case nodeTypes.MemberExpression:
      return `${codeGenerator(node.object)}.${codeGenerator(node.property)}`
    case nodeTypes.ObjectExpression:
      return `{${node.proterties.map(codeGenerator).join(',')}}`
    case nodeTypes.ObjectProperty:
      return `${node.key.name}:'${node.value.value}'`
    case nodeTypes.Identifier:
      return node.name
    case nodeTypes.StringLiteral:
      return `'${node.value}'`
    case nodeTypes.NullLiteral:
      return 'null'
    default:
      break
  }
}

module.exports = { codeGenerator }
