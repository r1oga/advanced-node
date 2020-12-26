const puppeteer = require('puppeteer')
const { sessionFactory, userFactory } = require('./factories')

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
    const user = await userFactory()
    const { session, sig } = sessionFactory(user)
    await page.setCookie({ name: 'session', value: session })
    await page.setCookie({ name: 'session.sig', value: sig })

    // refresh page to simulate logging in
    await page.goto('localhost:3000')

    await page.waitFor('a[href="/auth/logout"]')
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)
    expect(text).toEqual('Logout')
  })
})
