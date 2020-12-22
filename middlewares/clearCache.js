const { clearHash } = require('../services/cache')

module.exports = async (req, _, next) => {
  // let route handler run first
  await next()
  // then clearn hash
  clearHash(req.user.id)
}
