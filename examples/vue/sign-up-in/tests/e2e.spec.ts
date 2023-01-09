import { test, expect } from '@playwright/test'

test('get started link', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('W3UI Sign Up / In Example App')

  const input = page.getByRole('textbox', { name: 'Email address:' })
  await input.fill('test@example.org')
  await input.press('Enter')

  // Test that the form worked
  await expect(page.getByText('Verify your email address!')).toBeVisible()
})
