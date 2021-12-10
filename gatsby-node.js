const crypto = require('crypto')
const { writeFile } = require('fs/promises')
const micromatch = require('micromatch')
const path = require('path')
const { optimize: svgoOptimize } = require('svgo')

const createSvg = require('./lib/create-svg')
const getId = require('./lib/get-id')
const getSpriteSymbol = require('./lib/get-sprite-symbol')
const unlinkSvg = require('./lib/unlink-svg')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const NODE_TYPE = 'SvgSprites'
const SVGO_OPTIONS = {
  plugins: [{
    name: 'preset-default',
    params: {
      overrides: {
        cleanupIDs: false
      }
    }
  }]
}

exports.createPages = async (
  { cache, getNodesByType },
  { skip: _, plugins: __, optimize = IS_PRODUCTION, ...svgMixer }
) => {
  const nodes = getNodesByType(NODE_TYPE)
  const content = await createSvg(nodes, svgMixer)
  const hash = crypto.createHash('md5').update(content).digest('hex')
  const filename = `sprites.${hash}.svg`

  const previousFilename = await cache.get('filename')

  await cache.set('filename', filename)

  await writeFile(
    path.resolve('public', filename),
    !optimize ? content : svgoOptimize(content, SVGO_OPTIONS).data
  )

  if (previousFilename && previousFilename !== filename) {
    await unlinkSvg(previousFilename)
  }
}

exports.createResolvers = async ({ cache, createResolvers, pathPrefix }) => {
  createResolvers({
    [NODE_TYPE]: {
      url: {
        async resolve ({ url }, _, { nodeModel, path }) {
          /* Connect to NODE_TYPE, so the url property is updated
          every time a new sprite file is saved */
          nodeModel.createPageDependency({ path, connection: NODE_TYPE })
          return `${pathPrefix}/${await cache.get('filename')}${url}`
        }
      }
    }
  })
}

exports.onCreateNode = async (helpers, {
  optimize = IS_PRODUCTION,
  skip = ''
}) => {
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
  const id = await getId(node, cache, optimize)
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
  const filename = await cache.get('filename')
  await cache.set('filename', null)

  if (filename) {
    await unlinkSvg(filename)
  }
}
