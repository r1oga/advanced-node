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
}

module.exports = Page
