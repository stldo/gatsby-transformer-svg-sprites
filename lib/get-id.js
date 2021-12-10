const incstr = require('incstr')

let nextId

module.exports = async (node, cache, optimize) => {
  if (!optimize) {
    const { contentDigest } = node.internal
    return `${node.name}--${contentDigest.slice(0, 5)}`
  }

  const cacheKey = `CACHE___${node.relativePath}`
  const cachedId = await cache.get(cacheKey)

  if (cachedId) {
    return cachedId
  }

  const lastId = await cache.get('lastId')

  if (!nextId) {
    nextId = incstr.idGenerator({
      alphabet: 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ0123456789',
      lastId
    })
  }

  const id = nextId()

  await cache.set('lastId', id)
  await cache.set(cacheKey, id)

  return id
}
