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

test.describe('mundo 3d', () => {
  test('canvas monta por padrão', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.world canvas')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('html')).toHaveAttribute('data-tier', /[123]/)
  })
  test('?tier=0 usa fallback estático com conteúdo íntegro', async ({ page }) => {
    await page.goto('/?tier=0')
    await expect(page.locator('.static-fallback')).toBeVisible()
    await expect(page.locator('.world canvas')).toHaveCount(0)
    await expect(page.locator('#projects .card')).toHaveCount(6)
    await expect(page.locator('html')).toHaveAttribute('data-tier', '0')
  })
})

test.describe('cidade', () => {
  test('mundo renderiza sem erros de console', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto('/')
    await expect(page.locator('.world canvas')).toBeVisible({ timeout: 15_000 })
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.3))
    await page.waitForTimeout(1500)
    expect(errors.filter((e) => e.includes('THREE') || e.includes('shader'))).toEqual([])
  })
})

test.describe('mergulho por scroll', () => {
  test('scroll até o fim percorre as seções e enche o altímetro', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.world canvas')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('html')).toHaveAttribute('data-section', 'hero')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55))
    await expect(page.locator('html')).toHaveAttribute('data-section', 'journey', { timeout: 10_000 })
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('html')).toHaveAttribute('data-section', 'contact', { timeout: 10_000 })
    await expect
      .poll(async () => Number(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dive'))), { timeout: 10_000 })
      .toBeGreaterThan(0.95)
  })
})
