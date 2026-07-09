import { CanvasTexture, SRGBColorSpace } from 'three'

export interface FacadeOptions {
  cols: number
  rows: number
  litRatio: number
}

export function windowGrid(cols: number, rows: number, litRatio: number, rand: () => number): Uint8Array {
  const out = new Uint8Array(cols * rows)
  for (let i = 0; i < out.length; i++) out[i] = rand() < litRatio ? 1 : 0
  return out
}

const WINDOW_COLORS = ['#67e8f9', '#fde68a', '#f0abfc', '#a5f3fc']

export function makeFacadeTexture(opts: FacadeOptions, rand: () => number): CanvasTexture {
  const { cols, rows, litRatio } = opts
  const w = 128
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#07070f'
  ctx.fillRect(0, 0, w, h)
  const grid = windowGrid(cols, rows, litRatio, rand)
  const cw = w / cols
  const ch = h / rows
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!grid[y * cols + x]) continue
      ctx.fillStyle = WINDOW_COLORS[Math.floor(rand() * WINDOW_COLORS.length)]
      ctx.globalAlpha = 0.5 + rand() * 0.5
      ctx.fillRect(x * cw + cw * 0.22, y * ch + ch * 0.28, cw * 0.56, ch * 0.44)
    }
  }
  ctx.globalAlpha = 1
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
