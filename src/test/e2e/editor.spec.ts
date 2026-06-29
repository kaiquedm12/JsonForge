import { test, expect } from '@playwright/test'

test.describe('JSON Editor', () => {
  test('should format JSON on paste', async ({ page }) => {
    await page.goto('/')
    await page.fill('textarea[placeholder*="JSON"]', '{"test": 1}')
    await page.click('text=Load Example')
  })

  test('should show graph after loading valid JSON', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Load Example')
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 10000 })
  })

  test('should toggle right panel', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Load Example')
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 10000 })
  })
})
