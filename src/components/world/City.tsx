'use client'

import { useLayoutEffect, useMemo, useRef, type ReactElement } from 'react'
import * as THREE from 'three'
import { MeshReflectorMaterial } from '@react-three/drei'
import { mulberry32 } from '@/lib/rng'
import { makeFacadeTexture, FACADE_SPECS, type BandKey } from '@/components/materials/facadeTexture'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor } from '@/lib/quality'
import { useIsMobile } from '@/lib/hooks'

// Cada faixa de altura recebe uma textura de fachada própria (grade e temperatura
// de cor distintas) — assim um arranha-céu de 200u não estica a mesma grade de um
// prédio de 20u, e a leitura de "andares" se mantém em qualquer altura.
interface BandGeom {
  key: BandKey
  count: number
  hMin: number
  hMax: number
  footMin: number
  footMax: number
  seed: number
}

const BANDS: BandGeom[] = [
  { key: 'low', count: 900, hMin: 14, hMax: 46, footMin: 10, footMax: 22, seed: 11 },
  { key: 'mid', count: 780, hMin: 40, hMax: 94, footMin: 9, footMax: 18, seed: 23 },
  { key: 'high', count: 620, hMin: 82, hMax: 150, footMin: 8, footMax: 15, seed: 37 },
  { key: 'tower', count: 340, hMin: 138, hMax: 210, footMin: 7, footMax: 13, seed: 53 },
]

// Neon HDR (>1) — o Bloom (luminanceThreshold=1) só acende estas cores. São o
// desenho de luz do skyline: parapeitos, strips verticais, letreiros e pontas de antena.
const NEON_CYAN = new THREE.Color(0.35, 2.6, 3.3)
const NEON_MAGENTA = new THREE.Color(3.3, 0.5, 2.5)
const NEON_AMBER = new THREE.Color(3.1, 1.7, 0.4)
const NEON_RED = new THREE.Color(3.2, 0.28, 0.32)
const NEON_TRIMS = [NEON_CYAN, NEON_MAGENTA, NEON_AMBER]

interface BandInstances {
  key: BandKey
  matrices: THREE.Matrix4[]
  tints: THREE.Color[]
}

interface CityData {
  bands: BandInstances[]
  tops: THREE.Matrix4[]
  antennas: THREE.Matrix4[]
  neon: { matrices: THREE.Matrix4[]; colors: THREE.Color[] }
}

// Constrói a cidade inteira de forma determinística a partir de um único seed.
// Todos os elementos derivados (neon, tops, antenas) saem do mesmo laço dos prédios
// e vão para meshes instanciados compartilhados → cidade toda em ~8 draw calls.
function buildCity(seed: number): CityData {
  const rand = mulberry32(seed)
  const q = new THREE.Quaternion()
  const eu = new THREE.Euler()
  const v = new THREE.Vector3()
  const s = new THREE.Vector3()

  const bands: BandInstances[] = []
  const tops: THREE.Matrix4[] = []
  const antennas: THREE.Matrix4[] = []
  const neonM: THREE.Matrix4[] = []
  const neonC: THREE.Color[] = []
  const pickNeon = () => NEON_TRIMS[Math.floor(rand() * NEON_TRIMS.length)]

  for (const band of BANDS) {
    const matrices: THREE.Matrix4[] = []
    const tints: THREE.Color[] = []
    const tall = band.key === 'high' || band.key === 'tower'

    for (let i = 0; i < band.count; i++) {
      const side = rand() < 0.5 ? -1 : 1
      const x = side * (24 + rand() * 196)
      const z = -18 - rand() * 604
      const h = band.hMin + (band.hMax - band.hMin) * rand() * (0.6 + 0.4 * rand())
      const fw = band.footMin + rand() * (band.footMax - band.footMin)
      const fd = band.footMin + rand() * (band.footMax - band.footMin)
      const rotY = rand() < 0.12 ? (rand() - 0.5) * 0.5 : 0
      eu.set(0, rotY, 0)
      q.setFromEuler(eu)
      v.set(x, h / 2, z)
      s.set(fw, h, fd)
      matrices.push(new THREE.Matrix4().compose(v, q, s))

      // matiz sutil por instância (azul/roxo frio) — quebra o preto chapado sem estourar bloom
      const t = 0.86 + rand() * 0.22
      tints.push(new THREE.Color(t * (0.92 + rand() * 0.1), t * (0.94 + rand() * 0.06), t * (1.0 + rand() * 0.12)))

      const top = h
      const halfW = fw / 2

      // parapeito de neon no topo (~28%)
      if (rand() < 0.28) {
        v.set(x, top + 0.4, z)
        s.set(fw * 1.02 + 0.5, 0.7, fd * 1.02 + 0.5)
        neonM.push(new THREE.Matrix4().compose(v, q, s))
        neonC.push(pickNeon())
      }
      // strip vertical numa face (~15%)
      if (rand() < 0.15) {
        const stripH = h * (0.5 + rand() * 0.4)
        v.set(x + (rand() < 0.5 ? -1 : 1) * (halfW + 0.06), top - stripH / 2, z)
        s.set(0.3, stripH, 0.5)
        neonM.push(new THREE.Matrix4().compose(v, q, s))
        neonC.push(pickNeon())
      }
      // letreiro/painel no telhado (só faixas altas, ~6%)
      if (tall && rand() < 0.06) {
        v.set(x, top + 3 + rand() * 4, z)
        s.set(3 + rand() * 5, 1.5 + rand() * 2.5, 0.4)
        neonM.push(new THREE.Matrix4().compose(v, q, s))
        neonC.push(pickNeon())
      }
      // antena escura com ponta vermelha HDR (só faixas altas, ~22%)
      if (tall && rand() < 0.22) {
        const antH = 6 + rand() * 18
        v.set(x, top + antH / 2, z)
        s.set(0.5, antH, 0.5)
        antennas.push(new THREE.Matrix4().compose(v, q, s))
        v.set(x, top + antH, z)
        s.set(0.9, 0.9, 0.9)
        neonM.push(new THREE.Matrix4().compose(v, q, s))
        neonC.push(NEON_RED)
      }
      // setback: 2ª caixa menor no topo — silhueta escalonada (~25%)
      if (rand() < 0.25) {
        const th = h * (0.12 + rand() * 0.18)
        v.set(x, top + th / 2, z)
        s.set(fw * (0.5 + rand() * 0.2), th, fd * (0.5 + rand() * 0.2))
        tops.push(new THREE.Matrix4().compose(v, q, s))
      }
    }

    bands.push({ key: band.key, matrices, tints })
  }

  return { bands, tops, antennas, neon: { matrices: neonM, colors: neonC } }
}

// InstancedMesh de caixas: escreve matrizes (e cores opcionais por instância) uma vez.
// frustumCulled=false porque o bounding da instância-0 não cobre a cidade inteira.
function InstancedBoxes({
  count,
  matrices,
  colors,
  material,
}: {
  count: number
  matrices: THREE.Matrix4[]
  colors?: THREE.Color[]
  material: ReactElement
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m))
    mesh.instanceMatrix.needsUpdate = true
    if (colors) {
      colors.forEach((c, i) => mesh.setColorAt(i, c))
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }
  }, [matrices, colors])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry />
      {material}
    </instancedMesh>
  )
}

export default function City() {
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const profile = profileFor(tier, isMobile)

  const textures = useMemo(() => {
    const out = {} as Record<BandKey, THREE.CanvasTexture>
    for (const b of BANDS) out[b.key] = makeFacadeTexture(FACADE_SPECS[b.key], mulberry32(b.seed))
    return out
  }, [])

  const city = useMemo(() => buildCity(1337), [])

  return (
    <group>
      {city.bands.map((band) => (
        <InstancedBoxes
          key={band.key}
          count={band.matrices.length}
          matrices={band.matrices}
          colors={band.tints}
          material={<meshBasicMaterial map={textures[band.key]} />}
        />
      ))}

      {/* setbacks — reaproveitam uma fachada neutra */}
      <InstancedBoxes
        count={city.tops.length}
        matrices={city.tops}
        material={<meshBasicMaterial map={textures.high} />}
      />

      {/* mastros de antena escuros (silhueta) */}
      <InstancedBoxes
        count={city.antennas.length}
        matrices={city.antennas}
        material={<meshBasicMaterial color="#0b0b16" />}
      />

      {/* NEON HDR — parapeitos, strips, letreiros e pontas de antena. toneMapped=false
          + cor por instância (>1) = as linhas de luz do skyline que o Bloom acende. */}
      <InstancedBoxes
        count={city.neon.matrices.length}
        matrices={city.neon.matrices}
        colors={city.neon.colors}
        material={<meshBasicMaterial toneMapped={false} />}
      />

      {/* asfalto molhado — O reflexo Blade Runner (agora reflete o neon) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -300]}>
        <planeGeometry args={[520, 760]} />
        <MeshReflectorMaterial
          resolution={Math.max(profile.reflectorRes, 256)}
          blur={tier >= 2 ? [300, 80] : [0, 0]}
          mixBlur={0.9}
          mixStrength={2.2}
          mirror={0.55}
          roughness={0.6}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0a0a12"
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}
