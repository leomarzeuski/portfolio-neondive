'use client'

import { useEffect, useRef } from 'react'
import type { ShaderMaterial } from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { NEON_FONT } from '@/lib/content'
import { WORLD } from '@/lib/curve'
import { createHologramMaterial } from '@/components/materials/hologram'

const Y = WORLD.undergroundY
const KEY_COLORS: [number, number, number][] = [
  [0.4, 2.8, 3.4],
  [3.6, 0.5, 2.6],
  [0.5, 3.2, 1.2],
  [3.2, 2.2, 0.4],
]

export default function TerminalLayer() {
  const screen = useRef<ShaderMaterial | null>(null)
  const screenMat = (screen.current ??= createHologramMaterial('#22d3ee'))
  const time = useRef(0)

  useEffect(() => {
    const current = screen.current
    return () => current?.dispose()
  }, [])

  useFrame((_, delta) => {
    time.current += delta
    if (screen.current) screen.current.uniforms.uTime.value = time.current
  })

  return (
    <group position={[0, Y, WORLD.terminalZ]}>
      {/* corpo da cabine */}
      <mesh position={[0, 2.4, -1]}>
        <boxGeometry args={[7, 8.4, 2]} />
        <meshBasicMaterial color="#0c1022" />
      </mesh>
      {/* tela holográfica */}
      <mesh position={[0, 3.4, 0.15]}>
        <planeGeometry args={[5.4, 3.6]} />
        <primitive object={screenMat} attach="material" />
      </mesh>
      <Text font={NEON_FONT} fontSize={0.72} anchorX="center" position={[0, 6.2, 0.2]}>
        OPEN CHANNEL
        <meshBasicMaterial toneMapped={false} color={[0.4, 3.0, 3.6]} />
      </Text>
      {/* teclas decorativas */}
      {KEY_COLORS.map((c, i) => (
        <mesh key={i} position={[-2.2 + i * 1.5, 0.7, 0.4]} rotation-x={-0.6}>
          <boxGeometry args={[1, 0.3, 0.7]} />
          <meshBasicMaterial toneMapped={false} color={c} />
        </mesh>
      ))}
      {/* poça de luz na frente */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.35, 3]}>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial toneMapped={false} color={[0.15, 0.7, 0.9]} transparent opacity={0.25} />
      </mesh>
    </group>
  )
}
