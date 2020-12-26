const Buffer = require('safe-buffer').Buffer
const Keygrip = require('keygrip')
const keys = require('../../config/keys')

module.exports = ({ _id }) => {
  const sessionObject = { passport: { user: _id.toString() } } // implementation of mongoose, need to turn _id into string
  const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64')
  const keygrip = new Keygrip([keys.cookieKey])
  const sig = keygrip.sign(`session=${session}`)

  return { session, sig }
}
