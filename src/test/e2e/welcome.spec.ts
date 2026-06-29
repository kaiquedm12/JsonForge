import { test, expect } from '@playwright/test'

test.describe('Welcome Screen', () => {
  test('should display welcome screen on load', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=JsonForge')).toBeVisible()
  })

  test('should have a paste textarea', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('textarea[placeholder*="JSON"]')).toBeVisible()
  })

  test('should load example JSON', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Load Example')
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 10000 })
  })
})
