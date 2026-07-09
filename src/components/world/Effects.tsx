'use client'

import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise, Vignette } from '@react-three/postprocessing'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor } from '@/lib/quality'
import { useIsMobile } from '@/lib/hooks'

export default function Effects() {
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const p = profileFor(tier, isMobile)

  if (!p.bloom) return null

  const effects = [
    <Bloom key="bloom" mipmapBlur luminanceThreshold={1} intensity={0.85} resolutionScale={0.5} />,
    ...(p.chromatic ? [<ChromaticAberration key="ca" offset={new THREE.Vector2(0.0009, 0.0013)} />] : []),
    ...(p.dof ? [<DepthOfField key="dof" focusDistance={0.02} focalLength={0.06} bokehScale={2.5} />] : []),
    <Vignette key="vig" darkness={0.62} />,
    <Noise key="noise" premultiply opacity={0.07} />,
  ]

  return <EffectComposer multisampling={0}>{effects}</EffectComposer>
}
