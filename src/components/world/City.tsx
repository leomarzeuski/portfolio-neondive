'use client'

import { useLayoutEffect, useMemo, useRef, type ReactElement } from 'react'
import * as THREE from 'three'
import { MeshReflectorMaterial } from '@react-three/drei'
import { mulberry32 } from '@/lib/rng'
import { makeFacadeTexture, FACADE_SPECS } from '@/components/materials/facadeTexture'
import { buildCityLayout, BANDS, type NeonColor } from './cityLayout'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor } from '@/lib/quality'
import { useIsMobile } from '@/lib/hooks'

// Seeds de textura por faixa
const BAND_SEED: Record<string, number> = { low: 11, mid: 23, high: 37, tower: 53 }

// Neon HDR (>1) — o Bloom (luminanceThreshold=1) só acende estas cores.
const NEON_HDR: Record<NeonColor, THREE.Color> = {
  cyan: new THREE.Color(0.35, 2.6, 3.3),
  magenta: new THREE.Color(3.3, 0.5, 2.5),
  amber: new THREE.Color(3.1, 1.7, 0.4),
  red: new THREE.Color(3.2, 0.28, 0.32),
}

// InstancedMesh de caixas: escreve matrizes (e cores opcionais por instância) uma vez.
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

export default function City() {
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const profile = profileFor(tier, isMobile)

  const textures = useMemo(() => {
    const out = {} as Record<string, THREE.CanvasTexture>
    for (const b of BANDS) out[b.key] = makeFacadeTexture(FACADE_SPECS[b.key], mulberry32(BAND_SEED[b.key]))
    return out
  }, [])

  // Converte o layout puro (com o tubo da câmera já carveado) em matrizes/cores.
  const data = useMemo(() => {
    const layout = buildCityLayout(1337)
    const q = new THREE.Quaternion()
    const eu = new THREE.Euler()
    const v = new THREE.Vector3()
    const s = new THREE.Vector3()
    const mk = (pos: [number, number, number], scale: [number, number, number], rotY: number) => {
      eu.set(0, rotY, 0)
      q.setFromEuler(eu)
      v.set(pos[0], pos[1], pos[2])
      s.set(scale[0], scale[1], scale[2])
      return new THREE.Matrix4().compose(v, q, s)
    }
    const bands = layout.bands.map((b) => ({
      key: b.key,
      matrices: b.buildings.map((bl) => mk([bl.x, bl.h / 2, bl.z], [bl.fw, bl.h, bl.fd], bl.rotY)),
      tints: b.buildings.map((bl) => new THREE.Color(bl.tint[0], bl.tint[1], bl.tint[2])),
    }))
    const tops = layout.tops.map((bx) => mk(bx.pos, bx.scale, bx.rotY))
    const antennas = layout.antennas.map((bx) => mk(bx.pos, bx.scale, bx.rotY))
    const neonM = layout.neon.map((bx) => mk(bx.pos, bx.scale, bx.rotY))
    const neonC = layout.neon.map((bx) => NEON_HDR[bx.color])
    return { bands, tops, antennas, neon: { matrices: neonM, colors: neonC } }
  }, [])

  return (
    <group>
      {data.bands.map((band) => (
        <InstancedBoxes
          key={band.key}
          count={band.matrices.length}
          matrices={band.matrices}
          colors={band.tints}
          material={<meshBasicMaterial map={textures[band.key]} />}
        />
      ))}

      {/* setbacks — reaproveitam uma fachada neutra */}
      <InstancedBoxes count={data.tops.length} matrices={data.tops} material={<meshBasicMaterial map={textures.high} />} />

      {/* mastros de antena escuros (silhueta) */}
      <InstancedBoxes count={data.antennas.length} matrices={data.antennas} material={<meshBasicMaterial color="#0b0b16" />} />

      {/* NEON HDR — parapeitos, strips, letreiros e pontas de antena. toneMapped=false
          + cor por instância (>1) = as linhas de luz do skyline que o Bloom acende. */}
      <InstancedBoxes
        count={data.neon.matrices.length}
        matrices={data.neon.matrices}
        colors={data.neon.colors}
        material={<meshBasicMaterial toneMapped={false} />}
      />

      {/* asfalto molhado — O reflexo Blade Runner (agora reflete o neon) */}
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
