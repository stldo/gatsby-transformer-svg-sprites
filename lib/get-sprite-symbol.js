const { Image, SpriteSymbol } = require('svg-mixer')

module.exports = (id, content) => {
  return new SpriteSymbol(id, new Image('', content))
}
