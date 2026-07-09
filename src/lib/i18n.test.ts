import { describe, it, expect } from 'vitest'
import { I18N, t } from './i18n'

describe('i18n', () => {
  it('en e pt têm exatamente as mesmas chaves', () => {
    expect(Object.keys(I18N.en).sort()).toEqual(Object.keys(I18N.pt).sort())
  })
  it('nenhuma string vazia', () => {
    expect(Object.values(I18N.en).every(Boolean)).toBe(true)
    expect(Object.values(I18N.pt).every(Boolean)).toBe(true)
  })
  it('t resolve, cai para en, e devolve a key como último recurso', () => {
    expect(t('pt', 'hero.hi')).toBe('Olá, eu sou')
    expect(t('en', 'hero.hi')).toBe("Hi, I'm")
    expect(t('pt', '__nope__')).toBe('__nope__')
  })
  it('meta bilíngue presente', () => {
    for (const l of ['en', 'pt'] as const) {
      expect(I18N[l]['meta.title']).toBeTruthy()
      expect(I18N[l]['meta.desc']).toBeTruthy()
    }
  })
})
