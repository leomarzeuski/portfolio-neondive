'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from '@/lib/rng'
import { useApp, effectiveTier } from '@/lib/store'

// Vida aérea da cidade: drones que pairam/piscam + tráfego vertical (streaks).
// São 2 InstancedMesh = 2 draw calls. Sem luz nenhuma — só cor HDR (>1) que o
// Bloom (luminanceThreshold=1) acende. Barras opacas, sem blending.

// Scratch de módulo — reaproveitado a cada frame (zero alocação no loop).
const _m = new THREE.Matrix4()
const _p = new THREE.Vector3()
const _s = new THREE.Vector3()
const _q = new THREE.Quaternion() // sempre identidade: nada gira

// Paleta HDR (>1). O Bloom só enxerga cor acima de 1.
const BEACON_COLORS = [
  new THREE.Color(3.4, 0.4, 0.4), // vermelho — beacon de obstáculo
  new THREE.Color(3.0, 3.0, 3.2), // branco — luz de navegação
  new THREE.Color(0.5, 2.4, 3.1), // ciano
]
const STREAK_WARM = new THREE.Color(3.2, 2.4, 1.5) // âmbar quente
const STREAK_CYAN = new THREE.Color(0.5, 2.4, 3.1) // ciano

const DRONE_COUNT = 40 // drones que pairam e piscam
const CAR_COUNT = 24 // veículos verticais subindo/descendo
const SEED = 4002

export default function Drones() {
  const tier = useApp((s) => effectiveTier(s))
  // tiers baixos (0/1): metade da vida aérea
  const droneN = tier <= 1 ? DRONE_COUNT / 2 : DRONE_COUNT
  const carN = tier <= 1 ? CAR_COUNT / 2 : CAR_COUNT

  const beaconRef = useRef<THREE.InstancedMesh>(null)
  const carRef = useRef<THREE.InstancedMesh>(null)
  const carY = useRef<Float32Array>(new Float32Array(0)) // estado MUTÁVEL do y atual de cada carro

  // Config estática e determinística (mulberry32) — lida SOMENTE p/ leitura no useFrame.
  const cfg = useMemo(() => {
    const rand = mulberry32(SEED)

    // --- drones (beacons) ---
    const bBase = new Float32Array(droneN * 3)
    const bBlinkPhase = new Float32Array(droneN)
    const bBlinkRate = new Float32Array(droneN)
    const bBobAmp = new Float32Array(droneN)
    const bBobSpeed = new Float32Array(droneN)
    const bBobPhase = new Float32Array(droneN)
    const bLatAmp = new Float32Array(droneN)
    const bLatSpeed = new Float32Array(droneN)
    const bLatPhase = new Float32Array(droneN)
    const bColors: THREE.Color[] = []
    for (let i = 0; i < droneN; i++) {
      bBase[i * 3] = -150 + rand() * 300 // x ∈ [-150,150]
      bBase[i * 3 + 1] = 30 + rand() * 200 // y ∈ [30,230]
      bBase[i * 3 + 2] = -20 - rand() * 500 // z ∈ [-20,-520]
      bBlinkPhase[i] = rand() * Math.PI * 2
      bBlinkRate[i] = 1.6 + rand() * 2.4 // ritmos de pisca variados
      bBobAmp[i] = 1.5 + rand() * 3.5 // bob vertical suave
      bBobSpeed[i] = 0.3 + rand() * 0.6
      bBobPhase[i] = rand() * Math.PI * 2
      bLatAmp[i] = 3 + rand() * 7 // vaivém lateral lento
      bLatSpeed[i] = 0.15 + rand() * 0.35
      bLatPhase[i] = rand() * Math.PI * 2
      bColors.push(BEACON_COLORS[Math.floor(rand() * BEACON_COLORS.length)])
    }

    // --- veículos verticais (streaks) ---
    const cX = new Float32Array(carN)
    const cZ = new Float32Array(carN)
    const cStartY = new Float32Array(carN)
    const cVel = new Float32Array(carN) // sinal = direção (sobe/desce)
    const cColors: THREE.Color[] = []
    for (let i = 0; i < carN; i++) {
      const side = rand() < 0.5 ? -1 : 1
      cX[i] = side * (60 + rand() * 90) // |x| 60–150 — longe do tubo central da câmera
      cZ[i] = -40 - rand() * 460 // z variado
      cStartY[i] = -10 + rand() * 260
      const speed = 12 + rand() * 14 // 12..26
      cVel[i] = rand() < 0.5 ? -speed : speed
      cColors.push(rand() < 0.5 ? STREAK_WARM : STREAK_CYAN)
    }

    return {
      bBase,
      bBlinkPhase,
      bBlinkRate,
      bBobAmp,
      bBobSpeed,
      bBobPhase,
      bLatAmp,
      bLatSpeed,
      bLatPhase,
      bColors,
      cX,
      cZ,
      cStartY,
      cVel,
      cColors,
    }
  }, [droneN, carN])

  // Cor por instância (uma vez) + reset do estado mutável do y.
  useLayoutEffect(() => {
    const bm = beaconRef.current
    if (bm) {
      cfg.bColors.forEach((c, i) => bm.setColorAt(i, c))
      if (bm.instanceColor) bm.instanceColor.needsUpdate = true
    }
    const cm = carRef.current
    if (cm) {
      cfg.cColors.forEach((c, i) => cm.setColorAt(i, c))
      if (cm.instanceColor) cm.instanceColor.needsUpdate = true
    }
    // cópia própria — nunca muta o array memoizado
    carY.current = new Float32Array(cfg.cStartY)
  }, [cfg])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // --- drones: deriva lenta (bob + lateral) + pisca (pulso de escala 0.5×..1.3×) ---
    const bm = beaconRef.current
    if (bm) {
      for (let i = 0; i < droneN; i++) {
        const x = cfg.bBase[i * 3] + Math.sin(t * cfg.bLatSpeed[i] + cfg.bLatPhase[i]) * cfg.bLatAmp[i]
        const y = cfg.bBase[i * 3 + 1] + Math.sin(t * cfg.bBobSpeed[i] + cfg.bBobPhase[i]) * cfg.bBobAmp[i]
        const z = cfg.bBase[i * 3 + 2]
        const pulse = 0.9 + 0.4 * Math.sin(t * cfg.bBlinkRate[i] + cfg.bBlinkPhase[i]) // 0.5..1.3
        const sc = 0.6 * pulse
        _p.set(x, y, z)
        _s.set(sc, sc, sc)
        _m.compose(_p, _q, _s)
        bm.setMatrixAt(i, _m)
      }
      bm.instanceMatrix.needsUpdate = true
    }

    // --- veículos verticais: sobem/descem e dão a volta (wrap na faixa [-10, 250)) ---
    const cm = carRef.current
    const ys = carY.current
    // ys é sincronizado no useLayoutEffect (roda antes do próximo frame); só anima quando casar
    if (cm && ys.length === carN) {
      _s.set(0.4, 2.4, 0.4)
      for (let i = 0; i < carN; i++) {
        // wrap robusto (aguenta delta grande) para [-10, 250)
        const y = ((((ys[i] + cfg.cVel[i] * delta + 10) % 260) + 260) % 260) - 10
        ys[i] = y
        _p.set(cfg.cX[i], y, cfg.cZ[i])
        _m.compose(_p, _q, _s)
        cm.setMatrixAt(i, _m)
      }
      cm.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      {/* drones que piscam — caixinhas HDR */}
      <instancedMesh ref={beaconRef} args={[undefined, undefined, droneN]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* tráfego vertical — barras finas e altas subindo/descendo nas laterais */}
      <instancedMesh ref={carRef} args={[undefined, undefined, carN]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
