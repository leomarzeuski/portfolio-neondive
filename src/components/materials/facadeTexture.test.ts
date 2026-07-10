import { describe, it, expect } from 'vitest'
import { windowGrid, gradedGrid } from './facadeTexture'
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

describe('facade gradedGrid', () => {
  it('é determinístico por seed', () => {
    expect(gradedGrid(8, 16, 0.5, 0.2, mulberry32(9))).toEqual(gradedGrid(8, 16, 0.5, 0.2, mulberry32(9)))
  })

  it('base acende mais que o topo (gradiente por linha)', () => {
    const cols = 10
    const rows = 40
    const g = gradedGrid(cols, rows, 0.6, 0.1, mulberry32(3))
    const half = rows / 2
    let topLit = 0
    let bottomLit = 0
    for (let r = 0; r < rows; r++) {
      let rowSum = 0
      for (let c = 0; c < cols; c++) rowSum += g[r * cols + c]
      // rows 0..half-1 são o topo; rows half..rows-1 são a base (embaixo)
      if (r < half) topLit += rowSum
      else bottomLit += rowSum
    }
    const topFrac = topLit / (half * cols)
    const bottomFrac = bottomLit / (half * cols)
    expect(bottomFrac).toBeGreaterThan(topFrac)
  })

  it('baseLit = topLit = 0 → tudo apagado', () => {
    expect([...gradedGrid(6, 10, 0, 0, mulberry32(2))].every((v) => v === 0)).toBe(true)
  })
})
