const AWS = require('aws-sdk')
const { v1: uuid } = require('uuid')

const keys = require('../config/keys')
const { requireLogin } = require('../middlewares')

const { accessKeyId, secretAccessKey } = keys
const s3 = new AWS.S3({
  credentials: { accessKeyId, secretAccessKey },
  region: 'eu-central-1'
})

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`
    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'blog-buck3t',
        ContentType: 'jpeg',
        Key: key
      },
      (err, url) => res.send({ key, url })
    )
  })
}
