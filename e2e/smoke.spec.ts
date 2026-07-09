import { test, expect } from '@playwright/test'

test.describe('seções e conteúdo', () => {
  test('5 seções com conteúdo real em EN (default)', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#hero .name')).toContainText('LEONARDO')
    await expect(page.locator('#hero')).toContainText("Hi, I'm")
    await expect(page.locator('#projects .card')).toHaveCount(6)
    await expect(page.locator('#projects')).toContainText('GlassGPT')
    await expect(page.locator('#journey .timeline > li')).toHaveCount(6)
    await expect(page.locator('#journey')).toContainText('Meta')
    await expect(page.locator('#skills .skill-group')).toHaveCount(5)
    await expect(page.locator('#contact .socials a')).toHaveCount(4)
    await expect(page.locator('#contact')).toContainText('leomarzeuskii@gmail.com')
  })
})

test.describe('hud', () => {
  test('toggle PT/EN troca o conteúdo e persiste', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'PT', exact: true }).click()
    await expect(page.locator('#hero')).toContainText('Olá, eu sou')
    await page.reload()
    await expect(page.locator('#hero')).toContainText('Olá, eu sou')
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await expect(page.locator('#hero')).toContainText("Hi, I'm")
  })
  test('settings define qualidade manual', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /SETTINGS/i }).click()
    await page.getByLabel(/LOW|BAIXA/i).check()
    await expect(page.getByLabel(/LOW|BAIXA/i)).toBeChecked()
  })
  test('altímetro tem 5 marcadores-âncora', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="altimeter"] a')).toHaveCount(5)
  })
})
