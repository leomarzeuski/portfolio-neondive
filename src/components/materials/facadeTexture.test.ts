import { describe, it, expect } from 'vitest'
import { windowGrid } from './facadeTexture'
import { mulberry32 } from '@/lib/rng'

describe('facade windowGrid', () => {
  it('é determinístico por seed', () => {
    expect(windowGrid(8, 16, 0.4, mulberry32(7))).toEqual(windowGrid(8, 16, 0.4, mulberry32(7)))
  })
  it('respeita aproximadamente o litRatio', () => {
    const g = windowGrid(30, 60, 0.35, mulberry32(1))
    const lit = g.reduce((a, b) => a + b, 0) / g.length
    expect(lit).toBeGreaterThan(0.28)
    expect(lit).toBeLessThan(0.42)
  })
  it('litRatio 0 → tudo apagado', () => {
    expect([...windowGrid(4, 4, 0, mulberry32(1))].every((v) => v === 0)).toBe(true)
  })
})
