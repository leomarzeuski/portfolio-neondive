'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from '@/lib/rng'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor } from '@/lib/quality'
import { useIsMobile } from '@/lib/hooks'

const HEIGHT = 120
const RADIUS = 70

const VERT = /* glsl */ `
uniform float uTime;
attribute float aOffset;
varying float vA;
void main() {
  vec3 p = position;
  float speed = 55.0 * (0.75 + aOffset * 0.5);
  p.y = mod(p.y - uTime * speed, ${HEIGHT}.0) - ${HEIGHT / 2}.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (2.2 + aOffset * 2.2) * (140.0 / max(1.0, -mv.z));
  vA = aOffset;
}
`

const FRAG = /* glsl */ `
uniform float uOpacity;
varying float vA;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float streak = smoothstep(0.5, 0.0, abs(uv.x) * 6.0) * smoothstep(0.55, 0.05, abs(uv.y));
  float a = streak * uOpacity * (0.3 + vA * 0.4);
  if (a < 0.01) discard;
  gl_FragColor = vec4(0.55, 0.78, 0.98, a);
}
`

export default function Rain() {
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const count = profileFor(tier, isMobile).rainCount
  const group = useRef<THREE.Group>(null)
  const material = useRef<THREE.ShaderMaterial>(null)

  const { positions, offsets } = useMemo(() => {
    const rand = mulberry32(2077)
    const positions = new Float32Array(count * 3)
    const offsets = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(rand()) * RADIUS
      const a = rand() * Math.PI * 2
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = rand() * HEIGHT
      positions[i * 3 + 2] = Math.sin(a) * r
      offsets[i] = rand()
    }
    return { positions, offsets }
  }, [count])

  useFrame(({ camera, clock }) => {
    if (!group.current || !material.current) return
    group.current.position.copy(camera.position)
    material.current.uniforms.uTime.value = clock.elapsedTime
    // chuva entra quando a câmera desce abaixo das torres
    const y = camera.position.y
    material.current.uniforms.uOpacity.value = THREE.MathUtils.clamp((140 - y) / 60, 0, 1)
  })

  if (count === 0) return null

  return (
    <group ref={group} renderOrder={10}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={{ uTime: { value: 0 }, uOpacity: { value: 0 } }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
