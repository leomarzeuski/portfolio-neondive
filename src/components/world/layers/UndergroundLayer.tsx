'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { SKILLS, NEON_FONT } from '@/lib/content'
import { CORES_Z, WORLD } from '@/lib/curve'
import { mulberry32 } from '@/lib/rng'
import { makeFacadeTexture } from '@/components/materials/facadeTexture'
import { useApp } from '@/lib/store'

const Y = WORLD.undergroundY
const CORE_COLORS: [number, number, number][] = [
  [3.6, 0.5, 2.6], // AI — magenta
  [0.4, 2.8, 3.4], // FE — ciano
  [3.2, 2.2, 0.4], // MB — âmbar
  [0.5, 3.2, 1.2], // BE — verde
  [2.2, 0.8, 3.6], // CQ — violeta
]
const RACK_COUNT = 60

function Racks() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const texture = useMemo(
    () => makeFacadeTexture({ cols: 4, rows: 10, baseLit: 0.62, topLit: 0.5, colors: ['#7fe6ff', '#5eead4', '#a9f1ff', '#c9a9ff'] }, mulberry32(4242)),
    [],
  )

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const rand = mulberry32(51)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const v = new THREE.Vector3()
    const s = new THREE.Vector3()
    for (let i = 0; i < RACK_COUNT; i++) {
      const side = i % 2 === 0 ? 1 : -1
      v.set(side * 10.5, Y + 1.4, -352 - (i / RACK_COUNT) * 220 - rand() * 3)
      q.setFromEuler(new THREE.Euler(0, side * Math.PI * 0.5, 0))
      s.set(2.6, 5.2, 1.2)
      mesh.setMatrixAt(i, m.compose(v, q, s))
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, RACK_COUNT]} frustumCulled={false}>
      <boxGeometry />
      <meshBasicMaterial map={texture} />
    </instancedMesh>
  )
}

function Core({ index }: { index: number }) {
  const group = SKILLS[index]
  const lang = useApp((s) => s.lang)
  const mesh = useRef<THREE.Mesh>(null)
  const color = CORE_COLORS[index % CORE_COLORS.length]

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2 + index * 1.7) * 0.12
    mesh.current.scale.setScalar(pulse)
    mesh.current.rotation.y = clock.elapsedTime * 0.4
  })

  return (
    <group position={[index % 2 === 0 ? -4.5 : 4.5, Y + 2.6, CORES_Z[index]]}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshBasicMaterial toneMapped={false} color={color} wireframe />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.3, 0.06, 8, 40]} />
        <meshBasicMaterial toneMapped={false} color={color} transparent opacity={0.7} />
      </mesh>
      <Text font={NEON_FONT} fontSize={1} anchorX="center" position={[0, 3.4, 0]}>
        {`${group.code} · ${group.cat[lang].toUpperCase()}`}
        <meshBasicMaterial toneMapped={false} color={color} />
      </Text>
      <Text font={NEON_FONT} fontSize={0.5} anchorX="center" maxWidth={9} position={[0, -2.6, 0]} color="#7c89b0">
        {group.items.join(' · ')}
      </Text>
    </group>
  )
}

export default function UndergroundLayer() {
  return (
    <group>
      {/* corredor: piso, teto, paredes */}
      <mesh rotation-x={-Math.PI / 2} position={[0, Y - 1.4, -465]}>
        <planeGeometry args={[26, 240]} />
        <meshBasicMaterial color="#05060f" />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, Y + 9, -465]}>
        <planeGeometry args={[26, 240]} />
        <meshBasicMaterial color="#04050c" />
      </mesh>
      {[-13, 13].map((x) => (
        <mesh key={x} rotation-y={x > 0 ? -Math.PI / 2 : Math.PI / 2} position={[x, Y + 4, -465]}>
          <planeGeometry args={[240, 11]} />
          <meshBasicMaterial color="#070912" />
        </mesh>
      ))}
      {/* strips de luz no teto */}
      {[-380, -420, -460, -500, -540].map((z) => (
        <mesh key={z} position={[0, Y + 8.8, z]}>
          <boxGeometry args={[8, 0.1, 0.5]} />
          <meshBasicMaterial toneMapped={false} color={[0.5, 2.4, 3]} />
        </mesh>
      ))}
      <Racks />
      {SKILLS.map((_, i) => <Core key={i} index={i} />)}
    </group>
  )
}
