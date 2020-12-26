const puppeteer = require('puppeteer')
describe('Header', () => {
  let browser, pages, page

  beforeEach(async () => {
    browser = await puppeteer.launch({ headless: false })
    pages = await browser.pages()
    page = pages[0]
    await page.goto('localhost:3000')
  })

  afterAll(async () => {
    await browser.close()
  })

  it('has the correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML)
    expect(text).toEqual('Blogster')
  })

  it('starts oauth flow on login click', async () => {
    await page.click('a[href="/auth/google"]')

    const url = page.url()
    expect(url).toContain('oauth2')
  })

  it.only('shows logout button when signed in', async () => {
    const id = '5fe0cfeafad0c82c079c032c'

    const Buffer = require('safe-buffer').Buffer
    const sessionObject = { passport: { user: id } }
    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString(
      'base64'
    )

    const Keygrip = require('keygrip')
    const keys = require('../config/keys')
    const keygrip = new Keygrip([keys.cookieKey])
    const sig = keygrip.sign(`session=${sessionString}`)

    await page.setCookie({ name: 'session', value: sessionString })
    await page.setCookie({ name: 'session.sig', value: sig })

    // refresh page to simulate logging in
    await page.goto('localhost:3000')

    await page.waitFor('a[href="/auth/logout"]')
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)
    expect(text).toEqual('Logout')
  })
})
