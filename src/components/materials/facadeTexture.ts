import { CanvasTexture, SRGBColorSpace } from 'three'

export type BandKey = 'low' | 'mid' | 'high' | 'tower'

export interface FacadeSpec {
  cols: number
  rows: number
  baseLit: number // lit probability near the BASE floor (higher)
  topLit: number // lit probability near the TOP floor (lower)
  colors: string[] // window colors as hex strings; index 0 = dominant temperature
}

// Per-band texture specs. Keys are EXACTLY 'low' | 'mid' | 'high' | 'tower'.
// Dominant temperature per band, more rows/floors for taller bands, higher litRatio near base.
export const FACADE_SPECS: Record<BandKey, FacadeSpec> = {
  low: { cols: 6, rows: 12, baseLit: 0.5, topLit: 0.3, colors: ['#ffd27f', '#ffb347', '#fff1c2', '#8fe8ff'] }, // amber-warm dominant
  mid: { cols: 8, rows: 20, baseLit: 0.42, topLit: 0.24, colors: ['#7fe6ff', '#a9f1ff', '#d8fbff', '#ffd27f'] }, // cyan-cool dominant
  high: { cols: 10, rows: 30, baseLit: 0.34, topLit: 0.18, colors: ['#eaf3ff', '#cfe0ff', '#9fd8ff', '#ffc98f'] }, // white-cool dominant
  tower: { cols: 12, rows: 38, baseLit: 0.3, topLit: 0.16, colors: ['#ff9fe6', '#f0abfc', '#c9a9ff', '#8fe8ff'] }, // magenta dominant
}

// KEEP this pure function EXACTLY as-is (an existing test imports it — do not change its signature).
export function windowGrid(cols: number, rows: number, litRatio: number, rand: () => number): Uint8Array {
  const out = new Uint8Array(cols * rows)
  for (let i = 0; i < out.length; i++) out[i] = rand() < litRatio ? 1 : 0
  return out
}

// Pure, deterministic, testable. row 0 = TOP floor (uses topLit), row (rows-1) = BASE floor (uses baseLit).
// The lit probability is linearly interpolated per row between topLit and baseLit.
// Returns a cols*rows Uint8Array of 0/1 flags (row-major).
export function gradedGrid(cols: number, rows: number, baseLit: number, topLit: number, rand: () => number): Uint8Array {
  const out = new Uint8Array(cols * rows)
  const denom = rows > 1 ? rows - 1 : 1
  for (let r = 0; r < rows; r++) {
    // t = 0 at the top floor, 1 at the base floor
    const t = r / denom
    const lit = topLit + (baseLit - topLit) * t
    for (let c = 0; c < cols; c++) {
      out[r * cols + c] = rand() < lit ? 1 : 0
    }
  }
  return out
}

// Builds the CanvasTexture from a spec. All randomness comes from `rand` (seeded mulberry32).
export function makeFacadeTexture(spec: FacadeSpec, rand: () => number): CanvasTexture {
  const { cols, rows, baseLit, topLit, colors } = spec
  const w = 256
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Near-black background with a faint dominant-temperature tint (~6%). Stays well under white.
  ctx.fillStyle = '#07070f'
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 0.06
  ctx.fillStyle = colors[0]
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 1

  const grid = gradedGrid(cols, rows, baseLit, topLit, rand)
  const cw = w / cols
  const fh = h / rows
  const winW = cw * 0.58 // center ~58% of the cell (mullions on each side)
  const winH = fh * 0.6 // top ~60% of the slot; bottom ~40% is a dark slab/laje

  const pickColor = (): string => {
    // Dominant temperature (colors[0]) most of the time; otherwise an accent hue.
    if (rand() < 0.72 || colors.length < 2) return colors[0]
    return colors[1 + Math.floor(rand() * (colors.length - 1))]
  }

  for (let r = 0; r < rows; r++) {
    // row 0 (TOP floor) at the top of the canvas; row rows-1 (BASE floor) at the bottom.
    const winY = r * fh
    // Occasional fully-lit floor reads as a lobby/occupied floor.
    const fullFloor = rand() < 0.05
    for (let c = 0; c < cols; c++) {
      const lit = grid[r * cols + c] === 1
      if (!fullFloor && !lit) continue
      ctx.fillStyle = pickColor()
      // Keep alphas <= ~0.9 so the sRGB texel never reaches white (bloom uses luminanceThreshold=1).
      ctx.globalAlpha = fullFloor ? 0.82 : 0.42 + rand() * 0.48
      ctx.fillRect(c * cw + cw * 0.21, winY, winW, winH)
    }
  }

  ctx.globalAlpha = 1
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}
