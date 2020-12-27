Number.prototype._called = {}
const { Page } = require('./helpers')

describe('Blogs', () => {
  let page
  beforeEach(async () => {
    page = await Page.build()
    await page.goto('localhost:3000')
  })
  afterEach(async () => {
    await page.close()
  })

  describe('When logged in', () => {
    beforeEach(async () => {
      await page.login()
      await page.click('a[href="/blogs/new"]')
    })

    it('can see blog create form', async () => {
      const titleInputLabel = await page.getContentsBySelector('.title label')
      const contentInputLabel = await page.getContentsBySelector(
        '.content label'
      )

      expect(titleInputLabel).toEqual('Blog Title')
      expect(contentInputLabel).toEqual('Content')
    })

    describe('and using valid form inputs', () => {
      beforeEach(async () => {
        await page.type('.title input', 'Test title')
        await page.type('.content input', 'Test content')
        await page.click('button[type="submit"]')
      })

      it('submitting takes user to review screen', async () => {
        const text = await page.getContentsBySelector('h5')
        expect(text).toEqual('Please confirm your entries')
      })

      it('submitting adds blog to index page', async () => {
        await page.click('button.green')
        await page.waitForSelector('.card')
        // new user is created, can pull first card
        const title = await page.getContentsBySelector('.card-title')
        const content = await page.getContentsBySelector('p')

        expect(title).toEqual('Test title')
        expect(content).toEqual('Test content')
      })
    })

    describe('and using invalid form inputs', () => {
      beforeEach(async () => {
        await page.click('button[type="submit"]')
      })
      it('the forms shows error messages', async () => {
        const inputs = ['.title .red-text', '.content .red-text']
        for (let i = 0; i < 2; i++) {
          const error = await page.getContentsBySelector(inputs[i])
          expect(error).toEqual('You must provide a value')
        }
      })
    })
  })

  describe('When not logged in', () => {
    it('cannot create blog posts', async () => {
      const result = await page.post('/api/blogs', {
        title: 'Title',
        content: 'Content'
      })

      expect(result).toEqual({ error: 'You must log in!' })
    })

    it('cannot get a list of posts', async () => {
      const result = await page.get('/api/blogs')
      expect(result).toEqual({ error: 'You must log in!' })
    })
  })
})
