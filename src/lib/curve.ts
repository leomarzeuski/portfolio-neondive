import { CatmullRomCurve3, Vector3 } from 'three'

export const SECTIONS = ['hero', 'projects', 'journey', 'skills', 'contact'] as const
export type SectionId = (typeof SECTIONS)[number]

export const SECTION_RANGES: Record<SectionId, { start: number; end: number }> = {
  hero: { start: 0.0, end: 0.15 },
  projects: { start: 0.15, end: 0.45 },
  journey: { start: 0.45, end: 0.65 },
  skills: { start: 0.65, end: 0.85 },
  contact: { start: 0.85, end: 1.0 },
}

export function sectionAt(t: number): SectionId {
  const c = Math.min(1, Math.max(0, t))
  for (const id of SECTIONS) {
    if (c < SECTION_RANGES[id].end) return id
  }
  return 'contact'
}

// Alturas/posições canônicas do mundo — compartilhadas entre trilhos e layers
export const WORLD = {
  towerTopY: 240,
  cloudY: 200,
  transitY: 24,
  groundY: 0,
  undergroundY: -32,
  terminalZ: -560,
} as const

// Trilho da câmera: mergulho nuvens → torres (slalom) → trânsito → subsolo → terminal
const CAM_POINTS: [number, number, number][] = [
  [0, 300, 260],
  [0, 250, 150],
  [0, 206, 88],
  [30, 152, 30],
  [-34, 122, -16],
  [36, 100, -56],
  [-32, 82, -96],
  [26, 66, -128],
  [0, 34, -160],
  [0, 26, -250],
  [8, 6, -318],
  [0, -26, -345],
  [0, -30, -430],
  [0, -32, -505],
  [0, -32, -552],
]

// Trilho do look-at — independente da posição (é o que lê como cinematográfico)
const LOOK_POINTS: [number, number, number][] = [
  [0, 242, 0],
  [0, 238, 0],
  [0, 180, -40],
  [-28, 128, -20],
  [30, 112, -48],
  [-30, 96, -76],
  [32, 84, -104],
  [-26, 72, -128],
  [0, 26, -200],
  [0, 22, -300],
  [0, -10, -340],
  [0, -30, -430],
  [0, -32, -520],
  [0, -32, -560],
  [0, -30, -566],
]

export function createCamRail(): CatmullRomCurve3 {
  return new CatmullRomCurve3(CAM_POINTS.map((p) => new Vector3(...p)), false, 'centripetal', 0.5)
}

export function createLookRail(): CatmullRomCurve3 {
  return new CatmullRomCurve3(LOOK_POINTS.map((p) => new Vector3(...p)), false, 'centripetal', 0.5)
}

// 6 outdoors de projetos — mesma ordem de PROJECTS (content.ts)
export const BILLBOARDS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [-28, 128, -20], rotY: 0.55 },
  { pos: [30, 112, -48], rotY: -0.55 },
  { pos: [-30, 96, -76], rotY: 0.55 },
  { pos: [32, 84, -104], rotY: -0.55 },
  { pos: [-26, 72, -128], rotY: 0.5 },
  { pos: [24, 60, -150], rotY: -0.5 },
]

// 6 estações da timeline ao longo da linha do trem (y = WORLD.transitY)
export const STATIONS_Z = [-175, -200, -225, -250, -275, -300]

// 5 núcleos de skills no corredor do subsolo (y = WORLD.undergroundY)
export const CORES_Z = [-370, -395, -420, -445, -470]
