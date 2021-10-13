const { tokenizer } = require('./tokenizer')
const tokenTypes = require('./tokenTypes')
const nodeTypes = require('./nodeTypes')

function parser(sourceCode) {
  let tokens = tokenizer(sourceCode)
  // console.log('tokens', tokens)
  let cur = 0
  function walk(parent) {
    let token = tokens[cur]
    let nextToken = tokens[cur + 1]

    if (
      token.type === tokenTypes.LeftPunctuator &&
      nextToken.type === tokenTypes.JSXIdentifier
    ) {
      //JSXElement
      //当前 <  下一个 标识符(div)  说明是一个jsx元素
      let node = {
        type: nodeTypes.JSXElement,
        openingElement: null,
        closingElement: null,
        children: []
      }
      //第一步 给开始元素赋值
      token = tokens[++cur]
      node.openingElement = {
        type: nodeTypes.JSXOpeningElement,
        name: {
          type: nodeTypes.JSXIdentifier,
          name: token.value
        },
        attributes: []
      }
      token = tokens[++cur]
      while (token.type === tokenTypes.AttributeKey) {
        node.openingElement.attributes.push(walk())
        token = tokens[cur]
      }

      //<div id="aa" name="bb"><span>lxy</span>222</div>  cur指向<div id="aa" name="bb">
      token = tokens[++cur]
      nextToken = tokens[cur + 1]
      //循环元素的子节点
      while (
        token.type != tokenTypes.LeftPunctuator || //文本
        (token.type === tokenTypes.LeftPunctuator &&
          nextToken.type != tokenTypes.BackSlashPunctuator) //元素
      ) {
        node.children.push(walk())
        token = tokens[cur]
        nextToken = tokens[cur + 1]
      }
      node.closingElement = walk(node)
      return node
    } else if (token.type === tokenTypes.AttributeKey) {
      //JSXAttribute
      cur++ //跳过 =
      let nextToken = tokens[++cur]
      let node = {
        type: nodeTypes.JSXAttribute,
        name: {
          type: nodeTypes.JSXIdentifier,
          name: token.value
        },
        value: {
          type: nodeTypes.Literal,
          name: nextToken.value
        }
      }
      cur++
      return node
    } else if (token.type === tokenTypes.JSXText) {
      cur++
      return {
        type: nodeTypes.JSXText,
        value: token.value
      }
    } else if (
      parent &&
      token.type === tokenTypes.LeftPunctuator &&
      nextToken.type === tokenTypes.BackSlashPunctuator
    ) {
      cur++ //跳过 <
      cur++ //跳过 /
      token = tokens[cur]
      cur++ // 跳过 span
      cur++ // 跳过 >
      if (parent.openingElement.name.name !== token.value) {
        throw new TypeError('开始标签和结束标签不匹配')
      }
      return {
        type: nodeTypes.JSXClosingElement,
        name: {
          type: nodeTypes.JSXIdentifier,
          name: token.value
        }
      }
    }
    throw new TypeError('不合法 token')
  }
  let ast = {
    type: nodeTypes.Program,
    body: [
      {
        type: nodeTypes.ExpressionStatement,
        expression: walk()
      }
    ]
  }
  return ast
}

module.exports = { parser }

// let source = '<div id="aa" name="bb"><span>lxy</span>222</div>'
// console.log(JSON.stringify(parser(source), null, 2))
