'use client'

import { useApp } from '@/lib/store'

export const PALETTE = {
  normal: { bg: '#050510', fog: '#0a0a1c' },
  synthwave: { bg: '#12030f', fog: '#2a0a24' },
} as const

export default function WorldEnv() {
  const synthwave = useApp((s) => s.synthwave)
  const p = synthwave ? PALETTE.synthwave : PALETTE.normal
  return (
    <>
      <color attach="background" args={[p.bg]} />
      <fog attach="fog" args={[p.fog, 60, 340]} />
    </>
  )
}
