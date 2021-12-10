const { Compiler } = require('svg-mixer')

const getSpriteSymbol = require('./get-sprite-symbol')

module.exports = async (nodes = [], compilerOptions = {}) => {
  const compiler = new Compiler(compilerOptions)

  for (const node of nodes) {
    const id = node.url.slice(1)
    const spriteSymbol = getSpriteSymbol(id, node.internal.content)

    compiler.addSymbol(spriteSymbol)
  }

  const { content } = await compiler.compile()

  return content
}
