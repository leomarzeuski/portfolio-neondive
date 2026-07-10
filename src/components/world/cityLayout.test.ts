import { describe, it, expect } from 'vitest'
import { buildCityLayout, sampleCamRail, cameraClearance, CAMERA_CLEARANCE, BANDS } from './cityLayout'

describe('city layout', () => {
  it('é determinístico por seed', () => {
    const a = buildCityLayout(1337)
    const b = buildCityLayout(1337)
    expect(a.bands.map((x) => x.buildings.length)).toEqual(b.bands.map((x) => x.buildings.length))
    expect(a.bands[0].buildings[0]).toEqual(b.bands[0].buildings[0])
    expect(a.neon.length).toBe(b.neon.length)
  })

  it('gera as 4 faixas com quase todos os prédios (carve raramente descarta)', () => {
    const layout = buildCityLayout(1337)
    expect(layout.bands.map((b) => b.key)).toEqual(['low', 'mid', 'high', 'tower'])
    layout.bands.forEach((b, i) => {
      // o carve pode descartar alguns; exige que reste a grande maioria
      expect(b.buildings.length).toBeGreaterThan(BANDS[i].count * 0.9)
    })
  })

  it('NENHUM prédio invade o tubo da câmera — o mergulho não atravessa prédios', () => {
    const rail = sampleCamRail()
    const layout = buildCityLayout(1337)
    let worst = Infinity
    for (const band of layout.bands) {
      for (const b of band.buildings) {
        const c = cameraClearance(b.x, b.z, b.h, b.fw / 2, b.fd / 2, rail)
        if (c < worst) worst = c
      }
    }
    expect(worst).toBeGreaterThanOrEqual(CAMERA_CLEARANCE)
  })
})
