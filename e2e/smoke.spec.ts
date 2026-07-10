import { test, expect, type Page, type Locator } from '@playwright/test'

// espera o scroll parar de se mover sozinho (snap-to-label do ScrollTrigger da
// CameraRig, que assenta na label mais próxima após qualquer scroll — inclusive um
// scrollIntoView — e é independente de wheel/Lenis) antes de medir um efeito
// colateral de wheel/gesto, senão esse assentamento de fundo se confunde com o que
// está sendo medido.
async function waitForScrollToSettle(page: Page, maxMs = 12_000, requiredStableMs = 4_000) {
  let last = -1
  let stableSince = Date.now()
  const deadline = Date.now() + maxMs
  while (Date.now() < deadline) {
    const y = await page.evaluate(() => window.scrollY)
    if (y !== last) { stableSince = Date.now(); last = y }
    else if (Date.now() - stableSince >= requiredStableMs) return
    await page.waitForTimeout(200)
  }
}

// rola via wheel (fluxo normal do Lenis) até o locator estar plenamente na viewport,
// evitando o scrollIntoView automático do Playwright em .click()/.focus() — que
// dispara o mesmo snap-to-label acima e contaminaria a medição do teste.
async function wheelUntilInView(page: Page, locator: Locator) {
  for (let i = 0; i < 15; i++) {
    const box = await locator.boundingBox()
    if (box && box.y >= 0 && box.y + box.height <= 800) return
    await page.mouse.wheel(0, 400)
    await page.waitForTimeout(150)
  }
}

test.describe('boot', () => {
  test('boot aparece e some sozinho', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('boot')).toBeVisible()
    await expect(page.getByTestId('boot')).toBeHidden({ timeout: 15_000 })
    await expect(page.locator('#hero .name')).toBeVisible()
  })
  test('?noboot=1 pula direto', async ({ page }) => {
    await page.goto('/?noboot=1')
    await expect(page.getByTestId('boot')).toHaveCount(0)
  })
})

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
    await page.goto('/?noboot=1')
    await page.getByRole('button', { name: 'PT', exact: true }).click()
    await expect(page.locator('#hero')).toContainText('Olá, eu sou')
    await page.reload()
    await expect(page.locator('#hero')).toContainText('Olá, eu sou')
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await expect(page.locator('#hero')).toContainText("Hi, I'm")
  })
  test('settings define qualidade manual', async ({ page }) => {
    await page.goto('/?noboot=1')
    await page.getByRole('button', { name: /SETTINGS/i }).click()
    await page.getByLabel(/LOW|BAIXA/i).check()
    await expect(page.getByLabel(/LOW|BAIXA/i)).toBeChecked()
  })
  test('altímetro tem 5 marcadores-âncora', async ({ page }) => {
    await page.goto('/?noboot=1')
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

test.describe('contato', () => {
  test('form inválido mostra erro; válido monta mailto', async ({ page }) => {
    await page.goto('/?noboot=1')
    await page.locator('#contact').scrollIntoViewIfNeeded()
    await page.getByLabel(/NAME|NOME/).fill('A')
    await page.getByRole('button', { name: /TRANSMIT|TRANSMITIR/ }).click()
    await expect(page.locator('#contact .form-status')).toContainText('ERR')
    await page.getByLabel(/NAME|NOME/).fill('Ana Recruiter')
    await page.getByLabel(/E-MAIL/).fill('ana@empresa.com')
    await page.getByLabel(/MESSAGE|MENSAGEM/).fill('Adorei o portfólio, vamos conversar!')
    await page.getByRole('button', { name: /TRANSMIT|TRANSMITIR/ }).click()
    const link = page.locator('#contact a.open-mail')
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    expect(href).toContain('mailto:leomarzeuskii@gmail.com')
    expect(href).toContain(encodeURIComponent('Ana Recruiter'))
  })
})

test.describe('modal de projeto', () => {
  test('abre pelo card DOM, mostra conteúdo real e fecha com ESC', async ({ page }) => {
    await page.goto('/?noboot=1')
    await page.locator('#projects .card', { hasText: 'GlassGPT' }).getByRole('button').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('// BRIEFING')
    await expect(dialog).toContainText('autograd')
    await expect(dialog.getByRole('link', { name: /CODE/ })).toHaveAttribute('href', 'https://github.com/leomarzeuski/glassgpt')
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  })
  test('devolve o foco ao gatilho após fechar (teclado + ESC)', async ({ page }) => {
    await page.goto('/?noboot=1')
    const trigger = page.locator('#projects .card', { hasText: 'GlassGPT' }).getByRole('button')
    await trigger.focus()
    await trigger.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: /CLOSE|FECHAR/i })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
  test('wheel sobre o modal aberto não move o mergulho', async ({ page }) => {
    test.slow()
    await page.goto('/?noboot=1')
    await expect(page.locator('.world canvas')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('html')).toHaveAttribute('data-section', 'hero')
    const card = page.locator('#projects .card', { hasText: 'GlassGPT' }).getByRole('button')
    // rola manualmente via wheel (fluxo normal do Lenis) até o card entrar em
    // viewport, em vez de deixar o .click() do Playwright disparar seu próprio
    // scrollIntoView — que acionaria o snap-to-label da CameraRig (ver helpers
    // acima) bem no meio da janela de medição do teste.
    await wheelUntilInView(page, card)
    await waitForScrollToSettle(page)
    await card.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const before = await page.evaluate(() => window.scrollY)
    const sectionBefore = await page.locator('html').getAttribute('data-section')
    for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 600)
    const after = await page.evaluate(() => window.scrollY)
    expect(Math.abs(after - before)).toBeLessThan(20)
    await expect(page.locator('html')).toHaveAttribute('data-section', sectionBefore ?? '')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})

test.describe('konami synthwave', () => {
  test('sequência konami liga/desliga modo synthwave com toast', async ({ page }) => {
    await page.goto('/?noboot=1')
    await expect(page.locator('html')).toHaveAttribute('data-section', 'hero')
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    for (const key of seq) await page.keyboard.press(key)
    await expect(page.locator('body')).toHaveClass(/synthwave/)
    await expect(page.getByRole('status').filter({ hasText: /SYNTHWAVE/ })).toBeVisible()
    for (const key of seq) await page.keyboard.press(key)
    await expect(page.locator('body')).not.toHaveClass(/synthwave/)
  })
})

test.describe('som', () => {
  test('toggle de som alterna estado sem erros', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('/?noboot=1')
    const btn = page.getByRole('button', { name: /SOUND OFF|SOM OFF/ })
    await btn.click()
    await expect(page.getByRole('button', { name: /SOUND ON|SOM ON/ })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: /SOUND ON|SOM ON/ }).click()
    await expect(page.getByRole('button', { name: /SOUND OFF|SOM OFF/ })).toHaveAttribute('aria-pressed', 'false')
    expect(errors).toEqual([])
  })
})

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })
  test('sem boot, data-reduced, seções alcançáveis por scroll', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('boot')).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('data-reduced', 'true')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.locator('html')).toHaveAttribute('data-section', 'contact', { timeout: 10_000 })
    await expect(page.locator('#contact .socials a')).toHaveCount(4)
  })
})

test.describe('a11y', () => {
  test('skip-link é o primeiro elemento focável e leva ao conteúdo', async ({ page }) => {
    await page.goto('/?noboot=1')
    await page.keyboard.press('Tab')
    const skip = page.locator('.skip-link')
    await expect(skip).toBeFocused()
    await expect(skip).toHaveAttribute('href', '#projects')
  })
  test('canvas e fallback estático são aria-hidden (conteúdo real é o DOM)', async ({ page }) => {
    await page.goto('/?noboot=1')
    await expect(page.locator('.world')).toHaveAttribute('aria-hidden', 'true')
    await page.goto('/?tier=0')
    await expect(page.locator('.static-fallback')).toHaveAttribute('aria-hidden', 'true')
  })
  test('settings expõe aria-expanded correto ao abrir/fechar', async ({ page }) => {
    await page.goto('/?noboot=1')
    const btn = page.getByRole('button', { name: /SETTINGS/i })
    await expect(btn).toHaveAttribute('aria-expanded', 'false')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-expanded', 'true')
  })
})
