const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')

const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl)
client.hget = util.promisify(client.hget)

const exec = mongoose.Query.prototype.exec

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true
  this.hashKey = JSON.stringify(options.key || '') // ensure it is string|number
  return this // enable chaining
}

// no arrow function
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) return exec.apply(this, arguments)

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  )

  // Any value for key in redis?
  const cacheValue = await client.hget(this.hashKey, key)

  // yes >> return it
  if (cacheValue) {
    const doc = JSON.parse(cacheValue)

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d)) // hydrate models
      : new this.model(doc)
  }

  // no >> exec query and store result in redis
  const result = await exec.apply(this, arguments)
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10)
  return result
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey))
  }
}
