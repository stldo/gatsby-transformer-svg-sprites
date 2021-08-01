const crypto = require('crypto')
const { unlink, writeFile } = require('fs').promises
const incstr = require('incstr')
const micromatch = require('micromatch')
const path = require('path')
const { Compiler, Image, SpriteSymbol } = require('svg-mixer')
const { extendDefaultPlugins, optimize } = require('svgo')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const NODE_TYPE = 'SvgSprites'
const SVGO_OPTIONS = {
  plugins: extendDefaultPlugins([{
    name: 'cleanupIDs',
    active: false
  }])
}

const localCache = { spriteSymbols: new Map() }

async function createSvg (nodes = [], compilerOptions = {}) {
  const compiler = new Compiler(compilerOptions)

  for (const node of nodes) {
    const id = node.url.slice(1)
    const spriteSymbol = getSpriteSymbol(id, node.internal.content)
    compiler.addSymbol(spriteSymbol)
  }

  const { content } = await compiler.compile()

  return content
}

async function getId (node, cache, minify = IS_PRODUCTION) {
  const { contentDigest } = node.internal

  if (!minify) {
    return `${node.name}--${contentDigest.slice(0, 5)}`
  }

  const cacheKey = `CACHE___${node.relativePath}`
  const cachedId = await cache.get(cacheKey)

  if (cachedId) {
    return cachedId
  }

  const lastId = await cache.get('lastId')

  if (!localCache.nextId) {
    localCache.nextId = incstr.idGenerator({
      alphabet: 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ0123456789',
      lastId
    })
  }

  const id = localCache.nextId()

  await cache.set(cacheKey, id)
  await cache.set('lastId', id)

  return id
}

function getSpriteSymbol (id, content) {
  let spriteSymbol = localCache.spriteSymbols.get(id)

  if (!spriteSymbol) {
    spriteSymbol = new SpriteSymbol(id, new Image('', content))
    localCache.spriteSymbols.set(id, spriteSymbol)
  }

  return spriteSymbol
}

async function unlinkSvg (filename) {
  if (filename) {
    await unlink(path.resolve('public', filename)).catch(error => {
      if (error.code !== 'ENOENT') throw error
    })
  }
}

exports.createPages = async (
  { cache, getNodesByType },
  { skip: _, plugins: __, minify = IS_PRODUCTION, ...svgMixer }
) => {
  const content = await createSvg(getNodesByType(NODE_TYPE), svgMixer)
  const hash = crypto.createHash('md5').update(content).digest('hex')
  const filename = `sprites.${hash}.svg`

  await writeFile(
    path.resolve('public', filename),
    !minify ? content : optimize(content, SVGO_OPTIONS).data
  )

  await cache.set('filename', filename)

  if (filename !== localCache.filename) {
    await unlinkSvg(localCache.filename)
    localCache.filename = filename
  }
}

exports.createResolvers = ({ createResolvers, pathPrefix }) => {
  createResolvers({
    [NODE_TYPE]: {
      url: {
        resolve({ url }, _, { nodeModel, path }) {
          /* Connect to NODE_TYPE, so the url property is updated
          every time a new sprite file is saved */
          nodeModel.createPageDependency({ path, connection: NODE_TYPE })
          return `${pathPrefix}/${localCache.filename}${url}`
        }
      }
    }
  })
}

exports.onCreateNode = async (helpers, { minify, skip = '' }) => {
  const { node } = helpers

  if (
    node.internal.mediaType !== 'image/svg+xml' ||
    (skip && micromatch.isMatch(node.relativePath, skip))
  ) {
    return
  }

  const {
    actions: {
      createNode,
      createParentChildLink
    },
    cache,
    createNodeId,
    loadNodeContent
  } = helpers

  const content = await loadNodeContent(node)
  const id = await getId(node, cache, minify)
  const spriteSymbol = getSpriteSymbol(id, content)

  const child = {
    id: createNodeId(`${node.id} >>> SVG_SPRITES`),
    internal: {
      content,
      contentDigest: node.internal.contentDigest,
      type: NODE_TYPE
    },
    children: [],
    parent: node.id,
    url: `#${id}`,
    viewBox: spriteSymbol.viewBox.join(' '),
    width: spriteSymbol.width,
    height: spriteSymbol.height
  }

  await createNode(child)
  createParentChildLink({ child, parent: node })
}

exports.onPreBootstrap = async ({ cache }) => {
  await unlinkSvg(await cache.get('filename'))
  await cache.set('filename', null)
}
