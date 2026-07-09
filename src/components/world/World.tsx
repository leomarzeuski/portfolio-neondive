'use client'

import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useDetectGPU } from '@react-three/drei'
import { useApp, effectiveTier } from '@/lib/store'
import { profileFor, tierFrom } from '@/lib/quality'
import { useIsMobile, usePrefersReducedMotion } from '@/lib/hooks'
import WorldEnv from './WorldEnv'
import CameraRig from './CameraRig'
import City from './City'
import CloudLayer from './layers/CloudLayer'
import Rain from './Rain'
import TowersLayer from './layers/TowersLayer'
import TransitLayer from './layers/TransitLayer'
import UndergroundLayer from './layers/UndergroundLayer'
import TerminalLayer from './layers/TerminalLayer'
import Effects from './Effects'

function TierProbe({ isMobile }: { isMobile: boolean }) {
  const gpu = useDetectGPU()
  const setTier = useApp((s) => s.setTier)
  useEffect(() => {
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    setTier(tierFrom(gpu.tier, mem, isMobile || Boolean(gpu.isMobile)))
  }, [gpu.tier, gpu.isMobile, isMobile, setTier])
  return null
}

export default function World() {
  const tier = useApp((s) => effectiveTier(s))
  const isMobile = useIsMobile()
  const profile = profileFor(tier, isMobile)
  const reduced = usePrefersReducedMotion()

  return (
    <div className="world" aria-hidden>
      <Canvas
        dpr={[0.75, profile.dprMax]}
        camera={{ fov: 55, near: 0.5, far: 900, position: [0, 300, 260] }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <TierProbe isMobile={isMobile} />
          <WorldEnv />
          {/* LAYERS — Tasks 9–17 penduram aqui: CameraRig, City, Rain, Cloud/Towers/Transit/Underground/Terminal, Effects */}
          <CameraRig reduced={reduced} />
          <City />
          <CloudLayer />
          <Rain />
          <TowersLayer />
          <TransitLayer />
          <UndergroundLayer />
          <TerminalLayer />
          <Effects />
        </Suspense>
      </Canvas>
    </div>
  )
}
