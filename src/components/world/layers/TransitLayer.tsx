'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { TIMELINE, NEON_FONT } from '@/lib/content'
import { STATIONS_Z, WORLD } from '@/lib/curve'
import { useApp } from '@/lib/store'

const YEAR_HDR: [number, number, number] = [3.6, 0.5, 2.6]
const RAIL_HDR: [number, number, number] = [0.3, 2.2, 2.8]
const Y = WORLD.transitY

function Train() {
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.position.z = -330 + ((clock.elapsedTime * 26) % 180)
  })

  return (
    <group ref={group} position={[-13, Y - 1, -330]}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0, i * -7.4]}>
          <mesh>
            <boxGeometry args={[3, 2.6, 7]} />
            <meshBasicMaterial color="#151a30" />
          </mesh>
          {/* faixa de janelas emissiva */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[3.05, 0.5, 6.4]} />
            <meshBasicMaterial toneMapped={false} color={[0.6, 2.4, 2.8]} />
          </mesh>
        </group>
      ))}
      {/* farol */}
      <mesh position={[0, -0.2, 4.2]}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshBasicMaterial toneMapped={false} color={[4, 3.4, 2.2]} />
      </mesh>
    </group>
  )
}

function Station({ index }: { index: number }) {
  const stop = TIMELINE[index]
  const lang = useApp((s) => s.lang)
  const side = index % 2 === 0 ? 1 : -1
  const z = STATIONS_Z[index]

  return (
    <group position={[side * 11, Y, z]} rotation-y={side * -0.35}>
      {/* plataforma */}
      <mesh position={[0, -2.2, 0]}>
        <boxGeometry args={[8, 0.6, 10]} />
        <meshBasicMaterial color="#0e1226" />
      </mesh>
      <mesh position={[0, 1.4, -4.4]}>
        <boxGeometry args={[0.5, 7.6, 0.5]} />
        <meshBasicMaterial color="#12162a" />
      </mesh>
      <Text font={NEON_FONT} fontSize={1.6} anchorX="center" position={[0, 4.6, -4.2]}>
        {stop.year[lang]}
        <meshBasicMaterial toneMapped={false} color={YEAR_HDR} />
      </Text>
      <Text font={NEON_FONT} fontSize={0.85} anchorX="center" maxWidth={11} position={[0, 3.1, -4.2]} color="#bfe9ff">
        {`${stop.role[lang]} · ${stop.company}`}
      </Text>
    </group>
  )
}

function Searchlights() {
  const a = useRef<THREE.Group>(null)
  const b = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (a.current) a.current.rotation.z = 0.5 + Math.sin(t * 0.23) * 0.35
    if (b.current) b.current.rotation.z = -0.5 + Math.sin(t * 0.31 + 2) * 0.35
  })

  const cone = (
    <mesh position={[0, 60, 0]} renderOrder={8}>
      <coneGeometry args={[16, 120, 24, 1, true]} />
      <meshBasicMaterial
        toneMapped={false}
        color={[0.5, 1.6, 2.0]}
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )

  return (
    <>
      <group ref={a} position={[-60, 0, -210]}>{cone}</group>
      <group ref={b} position={[55, 0, -270]}>{cone}</group>
    </>
  )
}

export default function TransitLayer() {
  return (
    <group>
      {/* trilho neon */}
      <mesh position={[-13, Y - 3, -240]}>
        <boxGeometry args={[1.2, 0.2, 180]} />
        <meshBasicMaterial toneMapped={false} color={RAIL_HDR} />
      </mesh>
      <Train />
      <Searchlights />
      {TIMELINE.map((_, i) => <Station key={i} index={i} />)}
    </group>
  )
}
