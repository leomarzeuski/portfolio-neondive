'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { PROJECTS, NEON_FONT } from '@/lib/content'
import { BILLBOARDS } from '@/lib/curve'
import { createHologramMaterial } from '@/components/materials/hologram'
import { useApp } from '@/lib/store'

const HOLO_COLORS = ['#22d3ee', '#e879f9', '#22d3ee', '#a78bfa', '#e879f9', '#22d3ee']
const TITLE_HDR: [number, number, number] = [0.5, 3.0, 3.8]

function Billboard({ index }: { index: number }) {
  const project = PROJECTS[index]
  const spec = BILLBOARDS[index]
  const openProject = useApp((s) => s.openProject)
  const lang = useApp((s) => s.lang)
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.ShaderMaterial | null>(null)
  const mat = (material.current ??= createHologramMaterial(HOLO_COLORS[index % HOLO_COLORS.length]))

  useEffect(() => {
    const current = material.current
    return () => current?.dispose()
  }, [])

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime + index * 7.3
    if (group.current) {
      group.current.position.y = spec.pos[1] + Math.sin(clock.elapsedTime * 0.6 + index) * 0.8
    }
  })

  return (
    <group ref={group} position={spec.pos} rotation-y={spec.rotY}>
      {/* pilar de suporte descendo até o "telhado" */}
      <mesh position={[0, -18, -0.6]}>
        <boxGeometry args={[0.8, 24, 0.8]} />
        <meshBasicMaterial color="#12162a" />
      </mesh>

      <mesh
        onClick={(e) => { e.stopPropagation(); openProject(project.id) }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <planeGeometry args={[24, 14]} />
        <primitive object={mat} attach="material" />
      </mesh>

      <Text font={NEON_FONT} fontSize={2.4} anchorX="center" position={[0, 2.4, 0.25]}>
        {project.title.toUpperCase()}
        <meshBasicMaterial toneMapped={false} color={TITLE_HDR} />
      </Text>
      <Text font={NEON_FONT} fontSize={1} anchorX="center" position={[0, -0.6, 0.25]} color="#bfe9ff">
        {`${project.codename} · ${project.type[lang]}`}
      </Text>
      <Text font={NEON_FONT} fontSize={0.8} anchorX="center" position={[0, -4.9, 0.25]} color="#7c89b0" maxWidth={21}>
        {project.stack.join(' · ')}
      </Text>
    </group>
  )
}

export default function TowersLayer() {
  return (
    <group renderOrder={5}>
      {PROJECTS.map((p, i) => <Billboard key={p.id} index={i} />)}
    </group>
  )
}
