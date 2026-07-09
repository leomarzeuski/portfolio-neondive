import { describe, it, expect, beforeEach } from 'vitest'
import { useApp, effectiveTier } from './store'

describe('store', () => {
  beforeEach(() => {
    localStorage.clear()
    useApp.setState({ lang: 'en', tier: 1, tierOverride: null, soundOn: false, booted: false, synthwave: false, activeSection: 'hero', openProjectId: null })
  })
  it('defaults: en, som off, boot pendente', () => {
    const s = useApp.getState()
    expect(s.lang).toBe('en')
    expect(s.soundOn).toBe(false)
    expect(s.booted).toBe(false)
  })
  it('setLang persiste no localStorage', () => {
    useApp.getState().setLang('pt')
    expect(useApp.getState().lang).toBe('pt')
    expect(localStorage.getItem('neondive')).toContain('"pt"')
  })
  it('tierOverride vence o tier detectado', () => {
    useApp.getState().setTier(3)
    expect(effectiveTier(useApp.getState())).toBe(3)
    useApp.getState().setTierOverride(1)
    expect(effectiveTier(useApp.getState())).toBe(1)
  })
  it('openProject / toggleSynthwave', () => {
    useApp.getState().openProject('glassgpt')
    expect(useApp.getState().openProjectId).toBe('glassgpt')
    useApp.getState().toggleSynthwave()
    expect(useApp.getState().synthwave).toBe(true)
  })
})
