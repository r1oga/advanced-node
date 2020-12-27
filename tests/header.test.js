const { Page } = require('./helpers')

describe('Header', () => {
  let page

  beforeEach(async () => {
    page = await Page.build()
    await page.goto('localhost:3000')
  })

  afterEach(async () => {
    await page.close()
  })

  it('has the correct text', async () => {
    const text = await page.getContentsBySelector('a.brand-logo')
    expect(text).toEqual('Blogster')
  })

  it('starts oauth flow on login click', async () => {
    await page.click('a[href="/auth/google"]')

    const url = page.url()
    expect(url).toContain('oauth2')
  })

  it('shows logout button when signed in', async () => {
    await page.login()
    const text = await page.getContentsBySelector('a[href="/auth/logout"]')
    expect(text).toEqual('Logout')
  })
})
