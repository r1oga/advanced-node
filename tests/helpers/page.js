const puppeteer = require('puppeteer')

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
}

module.exports = Page
