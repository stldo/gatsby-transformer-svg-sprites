const { unlink } = require('fs').promises
const { resolve } = require('path')

module.exports = async filename => {
  await unlink(resolve('public', filename)).catch(error => {
    if (error.code !== 'ENOENT') {
      throw error
    }
  })
}
