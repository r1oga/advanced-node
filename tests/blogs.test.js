const { Page } = require('./helpers')

describe('Blogs', async () => {
  let page
  beforeEach(async () => {
    page = await Page.build()
    await page.goto('localhost:3000')
  })
  afterEach(async () => {
    await page.close()
  })

  describe('When logged in', async () => {
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

    // describe('and using valid form inputs', async () => {
    //   it('the forms shows an error message', async () => {})
    // })

    describe('and using invalid form inputs', async () => {
      beforeEach(async () => {
        await page.click('button[type="submit"]')

        const inputs = ['.title .red-text', '.content .red-text']
        for (let i = 0; i < inputs.length; i++) {
          const error = await page.getContentsBySelector(inputs[i])
          expect(error).toEqual('You must provide a value')
        }
      })
      it('the forms shows an error message', async () => {})
    })
  })
})
