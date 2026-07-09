import { describe, it, expect } from 'vitest'
import { SECTIONS, SECTION_RANGES, sectionAt, createCamRail, BILLBOARDS, STATIONS_Z, CORES_Z } from './curve'
import { PROJECTS, TIMELINE, SKILLS } from './content'

describe('curve', () => {
  it('ranges cobrem [0,1] sem buracos, na ordem de SECTIONS', () => {
    let cursor = 0
    for (const id of SECTIONS) {
      expect(SECTION_RANGES[id].start).toBeCloseTo(cursor, 5)
      cursor = SECTION_RANGES[id].end
    }
    expect(cursor).toBeCloseTo(1, 5)
  })
  it('sectionAt resolve fronteiras e clampa', () => {
    expect(sectionAt(0)).toBe('hero')
    expect(sectionAt(0.15)).toBe('projects')
    expect(sectionAt(0.5)).toBe('journey')
    expect(sectionAt(0.999)).toBe('contact')
    expect(sectionAt(-1)).toBe('hero')
    expect(sectionAt(2)).toBe('contact')
  })
  it('o trilho desce: começa acima das nuvens, termina no subsolo', () => {
    const rail = createCamRail()
    expect(rail.getPointAt(0).y).toBeGreaterThan(240)
    expect(rail.getPointAt(1).y).toBeLessThan(0)
  })
  it('geografia bate com o conteúdo (1 outdoor/projeto, 1 estação/parada, 1 núcleo/grupo)', () => {
    expect(BILLBOARDS).toHaveLength(PROJECTS.length)
    expect(STATIONS_Z).toHaveLength(TIMELINE.length)
    expect(CORES_Z).toHaveLength(SKILLS.length)
  })
})
