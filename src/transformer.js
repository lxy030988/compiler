const { parser } = require('./parser')
const { traverse } = require('./traverse')
const nodeTypes = require('./nodeTypes')
// const t = require('babel-types')
class t {
  static nullLiteral() {
    return { type: nodeTypes.NullLiteral }
  }
  static stringLiteral(vaule) {
    return { type: nodeTypes.StringLiteral, vaule }
  }
  static identifier(name) {
    return { type: nodeTypes.Identifier, name }
  }
  static memberExpression(object, property) {
    return { type: nodeTypes.MemberExpression, object, property }
  }
  static objectProperty(key, value) {
    return { type: nodeTypes.ObjectProperty, key, value }
  }
  static objectExpression(proterties) {
    return { type: nodeTypes.ObjectExpression, proterties }
  }
  static callExpression(callee, args) {
    return { type: nodeTypes.CallExpression, callee, args }
  }

  static isJSXElement(node) {
    return node.type === nodeTypes.JSXElement
  }
  static isJSXText(node) {
    return node.type === nodeTypes.JSXText
  }
}

function transformer(ast) {
  traverse(ast, {
    JSXElement(nodePath, parent) {
      function transform(node) {
        if (!node) {
          return t.nullLiteral() //null
        }
        if (t.isJSXElement(node)) {
          let memberExpression = t.memberExpression(
            t.identifier('React'),
            t.identifier('createElement')
          )
          let elementType = t.stringLiteral(node.openingElement.name.name)
          let objectExpression = node.openingElement.attributes.length
            ? t.objectExpression(
                node.openingElement.attributes.map((item) =>
                  t.objectProperty(
                    t.identifier(item.name.name),
                    t.stringLiteral(item.value.name)
                  )
                )
              )
            : t.nullLiteral()
          let args = [
            elementType,
            objectExpression,
            ...node.children.map((item) => transform(item))
          ]
          return t.callExpression(memberExpression, args)
        } else if (t.isJSXText(node)) {
          return t.stringLiteral(node.value)
        }
      }
      let newNode = transform(nodePath.node)
      nodePath.replaceWith(newNode)
    }
  })
}

module.exports = { transformer }

let source = '<div id="aa" name="bb"><span>lxy</span>222</div>'
let ast = parser(source)
transformer(ast)
console.log(JSON.stringify(ast, null, 2))
