'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from '@/lib/rng'
import { useApp, effectiveTier } from '@/lib/store'

// Atmosfera: brasas/poeira HDR à deriva + bandas de névoa aditivas → profundidade
// "volumétrica" fake. Aditivo (transparent + depthWrite:false + AdditiveBlending) com
// cor >1 p/ o Bloom acender. Determinístico; a animação é função pura do clock (sem
// estado mutável — nada de mutar valor devolvido por hook).

// scratch de módulo — reusado entre os dois subsistemas (useFrame roda em série)
const M = new THREE.Matrix4()
const P = new THREE.Vector3()
const Q = new THREE.Quaternion()
const S = new THREE.Vector3()

const Y_RANGE = 260
const Y_BASE = -20

interface Ember {
  x: number
  y: number
  z: number
  phase: number
  tw: number
  drift: number
  size: number
  color: THREE.Color
}

function Embers({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const embers = useMemo<Ember[]>(() => {
    const rand = mulberry32(3001)
    const list: Ember[] = []
    for (let i = 0; i < count; i++) {
      list.push({
        x: -160 + rand() * 320,
        y: rand() * Y_RANGE,
        z: 40 - rand() * 600,
        phase: rand() * Math.PI * 2,
        tw: 1.2 + rand() * 2.4,
        drift: 3 + rand() * 7,
        size: 0.5 + rand() * 0.95,
        color: rand() < 0.35 ? new THREE.Color(0.6, 2.2, 2.8) : new THREE.Color(2.6, 1.6, 0.7),
      })
    }
    return list
  }, [count])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    for (let i = 0; i < embers.length; i++) mesh.setColorAt(i, embers[i].color)
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [embers])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const time = state.clock.elapsedTime
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i]
      const y = Y_BASE + ((e.y + time * e.drift) % Y_RANGE)
      const x = e.x + Math.sin(time * 0.15 + e.phase) * 6
      const sc = e.size * (0.55 + 0.45 * Math.sin(time * e.tw + e.phase))
      P.set(x, y, e.z)
      S.set(sc, sc, sc)
      M.compose(P, Q, S)
      mesh.setMatrixAt(i, M)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} renderOrder={12}>
      <boxGeometry />
      <meshBasicMaterial toneMapped={false} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  )
}

interface Band {
  x: number
  y: number
  z: number
  phase: number
  color: THREE.Color
}

function HazeBands({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const bands = useMemo<Band[]>(() => {
    const rand = mulberry32(9021)
    const list: Band[] = []
    for (let i = 0; i < count; i++) {
      list.push({
        x: -40 + rand() * 80,
        y: 20 + rand() * 180,
        z: -60 - rand() * 420,
        phase: rand() * Math.PI * 2,
        color: rand() < 0.5 ? new THREE.Color(0.5, 0.35, 0.9) : new THREE.Color(0.3, 0.6, 0.95),
      })
    }
    return list
  }, [count])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    for (let i = 0; i < bands.length; i++) mesh.setColorAt(i, bands[i].color)
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [bands])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const time = state.clock.elapsedTime
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i]
      P.set(b.x + Math.sin(time * 0.05 + b.phase) * 12, b.y, b.z)
      S.set(320, 180, 1)
      M.compose(P, Q, S)
      mesh.setMatrixAt(i, M)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} renderOrder={10}>
      <planeGeometry />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  )
}

export default function Atmosphere() {
  const tier = useApp((s) => effectiveTier(s))
  const emberCount = tier <= 1 ? 280 : 520
  const hazeCount = tier <= 1 ? 0 : 4
  return (
    <group>
      <Embers count={emberCount} />
      {hazeCount > 0 && <HazeBands count={hazeCount} />}
    </group>
  )
}
