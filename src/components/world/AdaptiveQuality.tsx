'use client'

import { AdaptiveDpr, AdaptiveEvents, usePerformanceMonitor } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor, type Tier } from '@/lib/quality'
import { useIsMobile } from '@/lib/hooks'

export function degradeTier() {
  const s = useApp.getState()
  if (s.tierOverride === null && s.tier > 1) s.setTier((s.tier - 1) as Tier)
}

export default function AdaptiveQuality() {
  const setDpr = useThree((st) => st.setDpr)
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const { dprMax } = profileFor(tier, isMobile)

  usePerformanceMonitor({
    onChange: ({ factor }) => {
      const raw = 0.75 + factor * (dprMax - 0.75)
      const quantized = Math.round(raw * 4) / 4
      setDpr(Math.min(dprMax, Math.max(0.75, quantized)))
    },
  })

  return (
    <>
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  )
}
