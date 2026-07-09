import { describe, it, expect } from 'vitest'
import { tierFrom, profileFor, type Tier } from './quality'

describe('quality', () => {
  it('gpu tier 0 → tier 0', () => {
    expect(tierFrom(0, 8, false)).toBe(0)
  })
  it('desktop forte → 3; mobile é capado em 2', () => {
    expect(tierFrom(3, 16, false)).toBe(3)
    expect(tierFrom(3, 8, true)).toBe(2)
  })
  it('pouca memória derruba para 1', () => {
    expect(tierFrom(3, 2, false)).toBe(1)
  })
  it('gpu desconhecida → 1 (conservador)', () => {
    expect(tierFrom(undefined, undefined, false)).toBe(1)
  })
  it('perfil é monotônico em partículas e reflexo', () => {
    const tiers: Tier[] = [0, 1, 2, 3]
    const rain = tiers.map(t => profileFor(t, false).rainCount)
    const refl = tiers.map(t => profileFor(t, false).reflectorRes)
    expect([...rain].sort((a, b) => a - b)).toEqual(rain)
    expect([...refl].sort((a, b) => a - b)).toEqual(refl)
  })
  it('tier 0 desliga tudo', () => {
    const p = profileFor(0, false)
    expect(p.rainCount).toBe(0)
    expect(p.bloom).toBe(false)
  })
  it('mobile capa DPR', () => {
    expect(profileFor(2, true).dprMax).toBeLessThanOrEqual(1.5)
  })
})
