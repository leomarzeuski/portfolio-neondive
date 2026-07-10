'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from '@/lib/rng'
import { useApp, effectiveTier } from '@/lib/store'

// Carros voadores — barras HDR curtas que cruzam o skyline em corredores (lanes).
// Uma única instancedMesh (1 draw call), zero luzes: a cor >1 + toneMapped=false é o
// que o Bloom (luminanceThreshold=1) acende, dando o rastro de trânsito Blade Runner.

interface Lane {
  y: number
  z: number
  count: number
  dir: number
}

// Corredores de tráfego em alturas/profundidades distintas. dir alterna o sentido
// (faróis quentes indo num lado, lanternas vermelhas voltando no outro).
const LANES: Lane[] = [
  { y: 40, z: -80, count: 10, dir: 1 },
  { y: 170, z: -60, count: 8, dir: -1 },
  { y: 96, z: -220, count: 10, dir: 1 },
  { y: 130, z: -300, count: 8, dir: -1 },
  { y: 58, z: -180, count: 10, dir: 1 },
  { y: 200, z: -140, count: 6, dir: -1 },
]

interface Car {
  x: number
  y: number
  z: number
  dir: number
  speed: number
  color: THREE.Color
}

// Escala fixa do carro: comprido no X (eixo de viagem), fino no resto → risco de luz.
const CAR_SCALE = new THREE.Vector3(2.6, 0.22, 0.5)

// Scratch reutilizado no useFrame — nunca alocar dentro do laço por frame.
const SCRATCH_M = new THREE.Matrix4()
const SCRATCH_POS = new THREE.Vector3()
const IDENTITY_QUAT = new THREE.Quaternion()

export default function Traffic() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const lowTier = useApp((s) => effectiveTier(s)) <= 1

  // Estado dos carros construído deterministicamente (mulberry32) — mesma cidade
  // em todo boot. Ordem dos rand() é fixa: y, z, speed, x, sorteio de cor.
  const cars = useMemo(() => {
    const rand = mulberry32(777)
    const list: Car[] = []
    for (const lane of LANES) {
      for (let i = 0; i < lane.count; i++) {
        const y = lane.y + (rand() - 0.5) * 8
        const z = lane.z + (rand() - 0.5) * 28
        const speed = 16 + rand() * 18
        const x = -190 + rand() * 380
        let color: THREE.Color
        if (rand() < 0.2) color = new THREE.Color(0.5, 2.4, 3.1) // ciano (raro)
        else if (lane.dir > 0) color = new THREE.Color(3.2, 2.4, 1.5) // farol quente
        else color = new THREE.Color(3.4, 0.4, 0.35) // lanterna vermelha
        list.push({ x, y, z, dir: lane.dir, speed, color })
      }
    }
    // tier baixo: metade dos carros (constrói só um a cada dois)
    return lowTier ? list.filter((_, i) => i % 2 === 0) : list
  }, [lowTier])

  const count = cars.length
  // As posições X animadas vivem num ref MUTÁVEL — o array `cars` (useMemo) é só config
  // imutável (react-hooks/immutability proíbe mutar valor devolvido por hook).
  const xs = useRef<Float32Array>(new Float32Array(0))

  // Cores estáticas + estado/matriz inicial: uma vez por (re)build de cars.
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    xs.current = Float32Array.from(cars, (c) => c.x)
    for (let i = 0; i < cars.length; i++) {
      mesh.setColorAt(i, cars[i].color)
      SCRATCH_POS.set(cars[i].x, cars[i].y, cars[i].z)
      SCRATCH_M.compose(SCRATCH_POS, IDENTITY_QUAT, CAR_SCALE)
      mesh.setMatrixAt(i, SCRATCH_M)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [cars])

  useFrame((_, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const px = xs.current
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i]
      let x = px[i] + car.dir * car.speed * delta
      if (x > 195) x = -195
      else if (x < -195) x = 195
      px[i] = x
      SCRATCH_POS.set(x, car.y, car.z)
      SCRATCH_M.compose(SCRATCH_POS, IDENTITY_QUAT, CAR_SCALE)
      mesh.setMatrixAt(i, SCRATCH_M)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
