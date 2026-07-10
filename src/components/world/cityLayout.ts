import { createCamRail } from '@/lib/curve'
import { mulberry32 } from '@/lib/rng'
import type { BandKey } from '@/components/materials/facadeTexture'

// Geometria pura da cidade (sem three de render nem canvas) — testável.
// Aqui mora a regra que impede a câmera de atravessar prédios: cada prédio é
// empurrado para fora até liberar o "tubo" ao redor do trilho da câmera.

export interface Bldg {
  x: number
  z: number
  h: number
  fw: number
  fd: number
  rotY: number
  tint: [number, number, number]
}

export type NeonColor = 'cyan' | 'magenta' | 'amber' | 'red'
export interface Box {
  pos: [number, number, number]
  scale: [number, number, number]
  rotY: number
}
export interface NeonBox extends Box {
  color: NeonColor
}

export interface BandGeom {
  key: BandKey
  count: number
  hMin: number
  hMax: number
  footMin: number
  footMax: number
}

export const BANDS: BandGeom[] = [
  { key: 'low', count: 820, hMin: 14, hMax: 46, footMin: 10, footMax: 22 },
  { key: 'mid', count: 720, hMin: 40, hMax: 94, footMin: 9, footMax: 18 },
  { key: 'high', count: 560, hMin: 82, hMax: 150, footMin: 8, footMax: 15 },
  { key: 'tower', count: 300, hMin: 138, hMax: 210, footMin: 7, footMax: 13 },
]

export interface CityLayout {
  bands: { key: BandKey; buildings: Bldg[] }[]
  tops: Box[]
  antennas: Box[]
  neon: NeonBox[]
}

export interface RailPt {
  x: number
  y: number
  z: number
}

// Amostra o trilho da câmera por comprimento de arco (o "tubo" a ser liberado).
export function sampleCamRail(n = 320): RailPt[] {
  return createCamRail()
    .getSpacedPoints(n)
    .map((p) => ({ x: p.x, y: p.y, z: p.z }))
}

// Folga mínima (horizontal) entre a câmera e QUALQUER prédio. Acima disso a câmera
// nunca entra num prédio durante o mergulho.
export const CAMERA_CLEARANCE = 16

// Menor distância horizontal do trilho até a caixa (footprint) do prédio,
// considerando só os pontos onde a câmera está dentro da faixa de altura do prédio
// (se a câmera está acima do telhado, não há como atravessar).
export function cameraClearance(
  x: number,
  z: number,
  h: number,
  hw: number,
  hd: number,
  rail: RailPt[],
): number {
  let min = Infinity
  for (let i = 0; i < rail.length; i++) {
    const p = rail[i]
    if (p.y > h + 6 || p.y < -6) continue
    const dx = Math.max(Math.abs(p.x - x) - hw, 0)
    const dz = Math.max(Math.abs(p.z - z) - hd, 0)
    const d = Math.sqrt(dx * dx + dz * dz)
    if (d < min) min = d
  }
  return min
}

const NEON: NeonColor[] = ['cyan', 'magenta', 'amber']

// Constrói a cidade inteira de forma determinística (um seed). A câmera-tubo é
// carveada por prédio; features derivadas (neon, setbacks, antenas) herdam a
// posição final do prédio.
export function buildCityLayout(seed: number): CityLayout {
  const rand = mulberry32(seed)
  const rail = sampleCamRail()
  const bands: { key: BandKey; buildings: Bldg[] }[] = []
  const tops: Box[] = []
  const antennas: Box[] = []
  const neon: NeonBox[] = []
  const pickNeon = (): NeonColor => NEON[Math.floor(rand() * NEON.length)]

  for (const band of BANDS) {
    const buildings: Bldg[] = []
    const tall = band.key === 'high' || band.key === 'tower'

    for (let i = 0; i < band.count; i++) {
      const side = rand() < 0.5 ? -1 : 1
      let x = side * (24 + rand() * 196)
      const z = -18 - rand() * 604
      const h = band.hMin + (band.hMax - band.hMin) * rand() * (0.6 + 0.4 * rand())
      const fw = band.footMin + rand() * (band.footMax - band.footMin)
      const fd = band.footMin + rand() * (band.footMax - band.footMin)
      const rotY = rand() < 0.12 ? (rand() - 0.5) * 0.5 : 0

      // carve do tubo da câmera: empurra o prédio para fora até liberar o trilho
      let guard = 0
      while (cameraClearance(x, z, h, fw / 2, fd / 2, rail) < CAMERA_CLEARANCE && guard < 40) {
        x += side * 6
        guard++
      }
      if (cameraClearance(x, z, h, fw / 2, fd / 2, rail) < CAMERA_CLEARANCE) continue

      const t = 0.86 + rand() * 0.22
      const tint: [number, number, number] = [
        t * (0.92 + rand() * 0.1),
        t * (0.94 + rand() * 0.06),
        t * (1.0 + rand() * 0.12),
      ]
      buildings.push({ x, z, h, fw, fd, rotY, tint })

      const top = h
      const halfW = fw / 2

      // parapeito de neon (~28%)
      if (rand() < 0.28) {
        neon.push({ pos: [x, top + 0.4, z], scale: [fw * 1.02 + 0.5, 0.7, fd * 1.02 + 0.5], rotY, color: pickNeon() })
      }
      // strip vertical numa face (~15%)
      if (rand() < 0.15) {
        const stripH = h * (0.5 + rand() * 0.4)
        const faceSign = rand() < 0.5 ? -1 : 1
        neon.push({ pos: [x + faceSign * (halfW + 0.06), top - stripH / 2, z], scale: [0.3, stripH, 0.5], rotY, color: pickNeon() })
      }
      // letreiro no telhado (faixas altas, ~6%)
      if (tall && rand() < 0.06) {
        neon.push({ pos: [x, top + 3 + rand() * 4, z], scale: [3 + rand() * 5, 1.5 + rand() * 2.5, 0.4], rotY, color: pickNeon() })
      }
      // antena escura + ponta vermelha HDR (faixas altas, ~22%)
      if (tall && rand() < 0.22) {
        const antH = 6 + rand() * 18
        antennas.push({ pos: [x, top + antH / 2, z], scale: [0.5, antH, 0.5], rotY })
        neon.push({ pos: [x, top + antH, z], scale: [0.9, 0.9, 0.9], rotY, color: 'red' })
      }
      // setback: 2ª caixa menor no topo (~25%)
      if (rand() < 0.25) {
        const th = h * (0.12 + rand() * 0.18)
        tops.push({ pos: [x, top + th / 2, z], scale: [fw * (0.5 + rand() * 0.2), th, fd * (0.5 + rand() * 0.2)], rotY })
      }
    }

    bands.push({ key: band.key, buildings })
  }

  return { bands, tops, antennas, neon }
}
