class AstNode {
  constructor(type, value) {
    this.type = type
    this.value = value
  }

  appendChild(childNode) {
    if (!this.children) {
      this.children = []
    }
    this.children.push(childNode)
  }
}

module.exports = AstNode
