'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MeshReflectorMaterial } from '@react-three/drei'
import { mulberry32 } from '@/lib/rng'
import { makeFacadeTexture } from '@/components/materials/facadeTexture'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor } from '@/lib/quality'
import { useIsMobile } from '@/lib/hooks'

const VARIANTS = 4
const COUNT_PER_VARIANT = 700

function buildMatrices(seed: number): THREE.Matrix4[] {
  const rand = mulberry32(seed)
  const out: THREE.Matrix4[] = []
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const eu = new THREE.Euler()
  const v = new THREE.Vector3()
  const s = new THREE.Vector3()
  for (let i = 0; i < COUNT_PER_VARIANT; i++) {
    const side = rand() < 0.5 ? -1 : 1
    const x = side * (26 + rand() * 190)
    const z = -20 - rand() * 600
    const h = 14 + rand() * rand() * 170
    eu.set(0, rand() < 0.12 ? Math.PI / 4 : 0, 0)
    q.setFromEuler(eu)
    v.set(x, h / 2, z)
    s.set(8 + rand() * 14, h, 8 + rand() * 14)
    out.push(m.clone().compose(v, q, s))
  }
  return out
}

function BuildingVariant({ seed }: { seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const texture = useMemo(() => makeFacadeTexture({ cols: 6, rows: 14, litRatio: 0.32 }, mulberry32(seed * 31)), [seed])
  const matrices = useMemo(() => buildMatrices(seed), [seed])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m))
    mesh.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT_PER_VARIANT]} frustumCulled={false}>
      <boxGeometry />
      <meshBasicMaterial map={texture} />
    </instancedMesh>
  )
}

export default function City() {
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const profile = profileFor(tier, isMobile)

  return (
    <group>
      {Array.from({ length: VARIANTS }, (_, i) => (
        <BuildingVariant key={i} seed={i + 1} />
      ))}
      {/* asfalto molhado — O reflexo Blade Runner */}
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
