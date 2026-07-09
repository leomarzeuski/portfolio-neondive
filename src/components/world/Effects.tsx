'use client'

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Glitch, Noise, Vignette } from '@react-three/postprocessing'
import { GlitchMode } from 'postprocessing'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor } from '@/lib/quality'
import { useIsMobile } from '@/lib/hooks'

export default function Effects() {
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const p = profileFor(tier, isMobile)
  const synthwave = useApp((s) => s.synthwave)
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    return useApp.subscribe((s, prev) => {
      if (s.activeSection !== prev.activeSection) {
        setGlitching(true)
        const id = setTimeout(() => setGlitching(false), 420)
        return () => clearTimeout(id)
      }
    })
  }, [])

  if (!p.bloom) return null

  const effects = [
    <Bloom key="bloom" mipmapBlur luminanceThreshold={1} intensity={synthwave ? 1.2 : 0.85} resolutionScale={0.5} />,
    ...(p.chromatic ? [<ChromaticAberration key="ca" offset={new THREE.Vector2(0.0009, 0.0013)} />] : []),
    ...(p.dof ? [<DepthOfField key="dof" focusDistance={0.02} focalLength={0.06} bokehScale={2.5} />] : []),
    ...(p.glitch
      ? [
          <Glitch
            key="glitch"
            active={glitching}
            mode={GlitchMode.SPORADIC}
            duration={new THREE.Vector2(0.1, 0.3)}
            strength={new THREE.Vector2(0.2, 0.5)}
            ratio={0.6}
          />,
        ]
      : []),
    <Vignette key="vig" darkness={0.62} />,
    <Noise key="noise" premultiply opacity={0.07} />,
  ]

  return <EffectComposer multisampling={0}>{effects}</EffectComposer>
}
