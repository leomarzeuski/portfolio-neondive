import { test, expect } from '@playwright/test'

test('home responde e renderiza', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('main')).toBeVisible()
})
