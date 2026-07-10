'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text, Stars, Clouds, Cloud } from '@react-three/drei'
import { NEON_FONT } from '@/lib/content'
import { WORLD } from '@/lib/curve'
import { mulberry32 } from '@/lib/rng'
import { makeFacadeTexture } from '@/components/materials/facadeTexture'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor } from '@/lib/quality'
import { useIsMobile } from '@/lib/hooks'

const CYAN_HDR: [number, number, number] = [0.4, 3.2, 4.0]
const MAGENTA_HDR: [number, number, number] = [4.0, 0.5, 2.8]

function NeonSign() {
  const matA = useRef<THREE.MeshBasicMaterial>(null)
  const matB = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    // flicker de tubo de neon — barato, só opacity
    const t = clock.elapsedTime
    const f = 0.88 + 0.12 * Math.sin(t * 13.7) * Math.sin(t * 3.1)
    if (matA.current) matA.current.opacity = f
    if (matB.current) matB.current.opacity = Math.min(1, f + 0.06)
  })

  return (
    <group position={[0, 0, 15]}>
      <Text font={NEON_FONT} fontSize={10} letterSpacing={0.12} anchorX="center" anchorY="middle" position={[0, WORLD.towerTopY + 8, 0]}>
        LEONARDO
        <meshBasicMaterial ref={matA} toneMapped={false} color={CYAN_HDR} transparent />
      </Text>
      <Text font={NEON_FONT} fontSize={10} letterSpacing={0.12} anchorX="center" anchorY="middle" position={[0, WORLD.towerTopY - 4, 0]}>
        MARZEUSKI
        <meshBasicMaterial ref={matB} toneMapped={false} color={MAGENTA_HDR} transparent />
      </Text>
    </group>
  )
}

export default function CloudLayer() {
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const p = profileFor(tier, isMobile)
  const towerTexture = useMemo(
    () => makeFacadeTexture({ cols: 8, rows: 40, baseLit: 0.3, topLit: 0.16, colors: ['#9fd8ff', '#cfe0ff', '#eaf3ff', '#ffc98f'] }, mulberry32(99)),
    [],
  )

  return (
    <group>
      <Stars radius={400} depth={60} count={p.starCount} factor={5} saturation={0.4} fade speed={0.4} />

      {/* lua fria */}
      <mesh position={[-150, 265, -190]}>
        <circleGeometry args={[26, 48]} />
        <meshBasicMaterial color="#dfe7ff" fog={false} />
      </mesh>

      {/* megatorre do hero */}
      <mesh position={[0, 125, 0]}>
        <boxGeometry args={[28, 250, 28]} />
        <meshBasicMaterial map={towerTexture} />
      </mesh>
      {/* antena + luz HDR piscante estática */}
      <mesh position={[0, 258, 0]}>
        <cylinderGeometry args={[0.3, 0.6, 16, 6]} />
        <meshBasicMaterial color="#1a1f33" />
      </mesh>
      <mesh position={[0, 267, 0]}>
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshBasicMaterial toneMapped={false} color={[3.5, 0.4, 0.5]} />
      </mesh>

      <NeonSign />

      {p.cloudSegments > 0 && (
        <Clouds material={THREE.MeshBasicMaterial} limit={p.cloudSegments * 2}>
          <Cloud segments={p.cloudSegments} bounds={[220, 14, 220]} volume={80} color="#141a30" opacity={0.55} position={[0, WORLD.cloudY, 30]} speed={0.08} />
          <Cloud segments={Math.floor(p.cloudSegments / 2)} bounds={[160, 10, 160]} volume={60} color="#1c1430" opacity={0.4} position={[60, WORLD.cloudY - 14, -60]} speed={0.05} />
        </Clouds>
      )}
    </group>
  )
}
