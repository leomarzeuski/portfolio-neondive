import { describe, it, expect } from 'vitest'
import { validateContact, buildMailto } from './mailto'

describe('mailto', () => {
  it('valida nome (2+), email e mensagem (10+)', () => {
    expect(validateContact('Ana', 'a@b.co', 'uma mensagem longa')).toBe(true)
    expect(validateContact('A', 'a@b.co', 'uma mensagem longa')).toBe(false)
    expect(validateContact('Ana', 'not-an-email', 'uma mensagem longa')).toBe(false)
    expect(validateContact('Ana', 'a@b.co', 'curta')).toBe(false)
  })
  it('monta mailto para o Leo com subject e body encodados', () => {
    const url = buildMailto('Ana Dev', 'ana@dev.io', 'Olá! Vamos conversar?')
    expect(url.startsWith('mailto:leomarzeuskii@gmail.com?')).toBe(true)
    expect(url).toContain(encodeURIComponent('[NEON DIVE] Ana Dev'))
    expect(url).toContain(encodeURIComponent('Olá! Vamos conversar?'))
    expect(url).toContain(encodeURIComponent('ana@dev.io'))
  })
})
