import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest'
import { preview } from 'vite'
import type { PreviewServer } from 'vite'
import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'
import { expect } from '@playwright/test'
import path from 'path'

let nextPort = 1337

// test is reused for each ui library 
async function test1 ({ page }) {
  await page.goto('/')
  await expect(page).toHaveTitle('W3UI Sign Up / Sign In Example App')

  const input = page.getByRole('textbox', { name: 'Email address:' })
  await input.fill('test@example.org')
  await input.press('Enter')
  await expect(page.getByText('Verify your email address!')).toBeVisible()
}

describe('chromium', async () => {
  let browser: Browser

  beforeAll(async () => {
    browser = await chromium.launch({headless: true})
    return () => browser.close()
  })

  const createServerAndPage = (pathToExample: string, port: number) => {
    const beforeAll = async () => {
      const root = path.resolve(pathToExample)
      const server = await preview({ root, preview: { port } })
      return () => {
        return new Promise<void>((resolve, reject) => {
          server.httpServer.close(error => error ? reject(error) : resolve())
        })
      }
    }
    return beforeAll
  }

  describe('vue', async () => {
    const port = nextPort++
    beforeAll(createServerAndPage('../../vue/sign-up-in', port))
    beforeEach(async (ctx) => {
      ctx.page = await browser.newPage({ baseURL: `http://localhost:${port}`})
    })
    test('sign up', test1, 10_000)
  })

  describe('react', async () => {
    const port = nextPort++
    beforeAll(createServerAndPage('../../react/sign-up-in', port))
    beforeEach(async (ctx) => {
      ctx.page = await browser.newPage({ baseURL: `http://localhost:${port}`})
    })
    test('sign up', test1, 10_000)
  })

  describe('solid', async () => {
    const port = nextPort++
    beforeAll(createServerAndPage('../../solid/sign-up-in', port))
    beforeEach(async (ctx) => {
      ctx.page = await browser.newPage({ baseURL: `http://localhost:${port}`})
    })
    test('sign up', test1, 10_000)
  })
})
