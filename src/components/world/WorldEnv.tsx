'use client'

import { useApp } from '@/lib/store'

export const PALETTE = {
  // névoa um pouco mais clara que o fundo → silhueta dos prédios em contraluz
  normal: { bg: '#050510', fog: '#0d0d24' },
  synthwave: { bg: '#12030f', fog: '#2c0d2a' },
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
