import { describe, it, expect } from 'vitest'
import { mulberry32 } from './rng'

describe('rng', () => {
  it('é determinístico por seed e uniforme em [0,1)', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = Array.from({ length: 100 }, () => a())
    const seqB = Array.from({ length: 100 }, () => b())
    expect(seqA).toEqual(seqB)
    expect(seqA.every((v) => v >= 0 && v < 1)).toBe(true)
    expect(new Set(seqA).size).toBeGreaterThan(90)
  })
})
