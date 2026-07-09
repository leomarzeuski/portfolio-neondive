import { describe, it, expect, vi } from 'vitest'
import { KONAMI, createKonami } from './konami'

describe('konami', () => {
  it('sequência completa dispara uma vez e rearma', () => {
    const fn = vi.fn()
    const feed = createKonami(fn)
    for (const key of KONAMI) feed({ key })
    expect(fn).toHaveBeenCalledTimes(1)
    for (const key of KONAMI) feed({ key })
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('tecla errada reseta; B/A são case-insensitive', () => {
    const fn = vi.fn()
    const feed = createKonami(fn)
    feed({ key: 'ArrowUp' })
    feed({ key: 'x' })
    for (const key of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'B', 'A']) feed({ key })
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
