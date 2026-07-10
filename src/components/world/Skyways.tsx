'use client'

import { useLayoutEffect, useMemo, useRef, type ReactElement } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from '@/lib/rng'
import { useApp, effectiveTier } from '@/lib/store'

// Skyways — passarelas elevadas cruzando o canyon + hologramas colossais ao fundo.
// Densidade, variedade e silhueta na CIDADE PROFUNDA. Zero luzes: só cor HDR (>1) com
// toneMapped=false alimenta o Bloom (luminanceThreshold=1). ~3 draw calls no total.

// Quantidades base (tier alto). Em tier <= 1 caem pra metade das pontes e zero hologramas.
const BRIDGE_COUNT = 14
const HOLO_COUNT = 3

// Neon HDR das strips — mesmas famílias de cor do skyline (ciano / magenta / âmbar).
const STRIP_HDR: THREE.Color[] = [
  new THREE.Color(0.4, 2.6, 3.3), // ciano
  new THREE.Color(3.3, 0.5, 2.5), // magenta
  new THREE.Color(3.1, 1.7, 0.4), // âmbar
]

// Hologramas — HDR modesto (1.2–2.0). São gigantes; brilho contido + opacidade baixa
// pra lerem como anúncios distantes flutuando, não como uma parede de luz.
const HOLO_HDR: THREE.Color[] = [
  new THREE.Color(0.5, 1.7, 2.0), // ciano
  new THREE.Color(2.0, 0.5, 1.6), // magenta
  new THREE.Color(1.4, 0.6, 2.0), // violeta
]

interface Bridge {
  deck: THREE.Matrix4
  strip: THREE.Matrix4
  color: THREE.Color
}

interface Holo {
  x: number
  y: number
  z: number
  w: number
  h: number
  baseRotY: number
  swaySpeed: number
  flickerSpeed: number
  phase: number
  color: THREE.Color
}

// Referência estável pra "sem hologramas" (tier baixo) — evita novo [] a cada render.
const NO_HOLOS: Holo[] = []

// Scratch de módulo reutilizado no useFrame dos hologramas — nunca alocar por frame.
const H_MAT = new THREE.Matrix4()
const H_POS = new THREE.Vector3()
const H_QUAT = new THREE.Quaternion()
const H_EULER = new THREE.Euler()
const H_SCALE = new THREE.Vector3()

// InstancedMesh de caixas: escreve matrizes (e cores opcionais por instância) uma vez.
// Pontes são estáticas — nunca animam, então tudo vive num useLayoutEffect.
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

export default function Skyways() {
  const tier = useApp((s) => effectiveTier(s))
  const lowTier = tier <= 1

  // Layout determinístico (mulberry32, seed 5003) — mesma cidade em todo boot.
  const data = useMemo(() => {
    const rand = mulberry32(5003)
    const q = new THREE.Quaternion()
    const eu = new THREE.Euler()
    const v = new THREE.Vector3()
    const s = new THREE.Vector3()
    const mk = (
      px: number,
      py: number,
      pz: number,
      sx: number,
      sy: number,
      sz: number,
      rotY: number,
    ) => {
      eu.set(0, rotY, 0)
      q.setFromEuler(eu)
      v.set(px, py, pz)
      s.set(sx, sy, sz)
      return new THREE.Matrix4().compose(v, q, s)
    }

    // 1) Pontes: caixas compridas e finas em X, só na cidade profunda
    //    (z -180..-540, y 58..150). Ali a câmera já mergulhou baixo (y <= ~34), então
    //    passarelas em y >= 58 cruzam com folga ACIMA do trilho — nunca no caminho.
    const bridges: Bridge[] = []
    for (let i = 0; i < BRIDGE_COUNT; i++) {
      const len = 60 + rand() * 100 // 60–160 ao longo do X (pode atravessar o canyon)
      const y = 58 + rand() * 92 // 58–150
      const z = -180 - rand() * 360 // -180 .. -540
      const x = (rand() - 0.5) * 30 // centrado perto de x=0
      const rotY = (rand() - 0.5) * 0.35 // leve guinada pra variar a silhueta
      const color = STRIP_HDR[Math.floor(rand() * STRIP_HDR.length)]
      const deck = mk(x, y, z, len, 2.5, 4, rotY) // tabuleiro escuro (silhueta)
      const strip = mk(x, y - 1.55, z, len, 0.6, 3.2, rotY) // strip neon na parte de baixo
      bridges.push({ deck, strip, color })
    }

    // 2) Hologramas gigantes: planos aditivos altos no céu (y 170–250) e bem afastados
    //    nas laterais (|x| 120–200) — longe do trilho (que fica |x| <= ~36). Anúncios colossais.
    const holos: Holo[] = []
    for (let i = 0; i < HOLO_COUNT; i++) {
      const side = rand() < 0.5 ? -1 : 1
      const x = side * (120 + rand() * 80) // |x| 120–200
      const y = 170 + rand() * 80 // 170–250
      const z = -80 - rand() * 360 // espalha na profundidade
      const w = 36 + rand() * 10 // ~40 de largura
      const h = 54 + rand() * 14 // ~60 de altura
      const baseRotY = -side * 0.5 // encara o canyon, levemente inclinado
      const swaySpeed = 0.08 + rand() * 0.14 // balanço/giro lento
      const flickerSpeed = 0.6 + rand() * 1.4 // pulso de escala (flicker)
      const phase = rand() * Math.PI * 2
      const color = HOLO_HDR[Math.floor(rand() * HOLO_HDR.length)]
      holos.push({ x, y, z, w, h, baseRotY, swaySpeed, flickerSpeed, phase, color })
    }

    return { bridges, holos }
  }, [])

  // Tier baixo: metade das pontes (subconjunto determinístico) e nenhum holograma.
  const bridges = useMemo(
    () => (lowTier ? data.bridges.filter((_, i) => i % 2 === 0) : data.bridges),
    [data.bridges, lowTier],
  )
  const holos = lowTier ? NO_HOLOS : data.holos

  const deckMats = useMemo(() => bridges.map((b) => b.deck), [bridges])
  const stripMats = useMemo(() => bridges.map((b) => b.strip), [bridges])
  const stripColors = useMemo(() => bridges.map((b) => b.color), [bridges])

  const holoRef = useRef<THREE.InstancedMesh>(null)

  // Cores estáticas + matriz inicial dos hologramas (uma vez por build/gate de tier).
  useLayoutEffect(() => {
    const mesh = holoRef.current
    if (!mesh) return
    for (let i = 0; i < holos.length; i++) {
      const holo = holos[i]
      mesh.setColorAt(i, holo.color)
      H_EULER.set(0, holo.baseRotY, 0)
      H_QUAT.setFromEuler(H_EULER)
      H_POS.set(holo.x, holo.y, holo.z)
      H_SCALE.set(holo.w, holo.h, 1)
      H_MAT.compose(H_POS, H_QUAT, H_SCALE)
      mesh.setMatrixAt(i, H_MAT)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [holos])

  // Hologramas animam: balanço lento (rotação) + pulso de escala (flicker) via clock.
  // Só mutamos a matriz da instância, com scratch de módulo — zero alocação, zero setState.
  useFrame((state) => {
    const mesh = holoRef.current
    if (!mesh || holos.length === 0) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < holos.length; i++) {
      const holo = holos[i]
      const rotY = holo.baseRotY + Math.sin(t * holo.swaySpeed + holo.phase) * 0.35
      const pulse = 0.94 + 0.06 * Math.sin(t * holo.flickerSpeed + holo.phase * 1.7)
      H_EULER.set(0, rotY, 0)
      H_QUAT.setFromEuler(H_EULER)
      H_POS.set(holo.x, holo.y, holo.z)
      H_SCALE.set(holo.w * pulse, holo.h * pulse, 1)
      H_MAT.compose(H_POS, H_QUAT, H_SCALE)
      mesh.setMatrixAt(i, H_MAT)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* tabuleiros escuros das pontes — opacos, sem blending (pura silhueta) */}
      <InstancedBoxes
        count={deckMats.length}
        matrices={deckMats}
        material={<meshBasicMaterial color="#0c0e1a" />}
      />

      {/* strips neon HDR na parte de baixo — opacas, cor por instância (>1) que o Bloom acende */}
      <InstancedBoxes
        count={stripMats.length}
        matrices={stripMats}
        colors={stripColors}
        material={<meshBasicMaterial toneMapped={false} />}
      />

      {/* hologramas gigantes — planos aditivos. renderOrder no mesh real (three ignora em Group) */}
      {holos.length > 0 && (
        <instancedMesh
          ref={holoRef}
          args={[undefined, undefined, holos.length]}
          frustumCulled={false}
          renderOrder={11}
        >
          <planeGeometry />
          <meshBasicMaterial
            toneMapped={false}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.34}
            side={THREE.DoubleSide}
          />
        </instancedMesh>
      )}
    </group>
  )
}
