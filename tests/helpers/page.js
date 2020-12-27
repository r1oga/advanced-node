const puppeteer = require('puppeteer')
const { sessionFactory, userFactory } = require('../factories')

class Page {
  static async build() {
    const browser = await puppeteer.launch({ headless: false })
    const page = (await browser.pages())[0]

    const customPage = new Page(page)

    return new Proxy(customPage, {
      get: function (_, property) {
        return customPage[property] || browser[property] || page[property]
      }
    })
  }

  constructor(page) {
    this.page = page
  }

  async login() {
    const user = await userFactory()
    const { session, sig } = sessionFactory(user)
    await this.page.setCookie({ name: 'session', value: session })
    await this.page.setCookie({ name: 'session.sig', value: sig })

    // refresh page to simulate logging in and redirect to /blogs
    await this.page.goto('localhost:3000/blogs')
    await this.page.waitForSelector('a[href="/auth/logout"]')
  }

  async getContentsBySelector(selector) {
    return this.page.$eval(selector, el => el.innerHTML)
  }

  get(path) {
    return this.page.evaluate(
      _path =>
        fetch(_path, {
          method: 'GET',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json()),
      path
    )
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) =>
        fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(_data)
        }).then(res => res.json()),
      path,
      data
    )
  }

  exec(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => this[method](path, data))
    )
  }
}

module.exports = Page
