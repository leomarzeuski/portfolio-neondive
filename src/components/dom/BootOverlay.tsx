'use client'

import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useApp, effectiveTier } from '@/lib/store'
import { t } from '@/lib/i18n'
import { usePrefersReducedMotion } from '@/lib/hooks'
import styles from './BootOverlay.module.css'

const MIN_MS = 900
const MAX_MS = 2200
const RAMP_MS = 1400

export default function BootOverlay() {
  const lang = useApp((s) => s.lang)
  const booted = useApp((s) => s.booted)
  const setBooted = useApp((s) => s.setBooted)
  const tier = useApp((s) => effectiveTier(s))
  const reduced = usePrefersReducedMotion()
  const { progress } = useProgress()
  const [minElapsed, setMinElapsed] = useState(false)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('noboot') || reduced || tier === 0) {
      setBooted(true)
    }
  }, [reduced, tier, setBooted])

  // a cena não tem assets — useProgress nunca avança; a barra é dirigida por
  // um timer local (ease-out até 100% em RAMP_MS) e o progress fica de reforço
  useEffect(() => {
    if (booted) return
    const start = performance.now()
    let raf = requestAnimationFrame(function tick(now: number) {
      const t = Math.min(1, (now - start) / RAMP_MS)
      setPct((1 - Math.pow(1 - t, 3)) * 100)
      if (t < 1) raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [booted])

  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), MIN_MS)
    const max = setTimeout(() => setBooted(true), MAX_MS)
    return () => { clearTimeout(min); clearTimeout(max) }
  }, [setBooted])

  useEffect(() => {
    if ((pct >= 100 || progress >= 100) && minElapsed) setBooted(true)
  }, [pct, progress, minElapsed, setBooted])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setBooted(true) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setBooted])

  useEffect(() => {
    document.body.style.overflow = booted ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [booted])

  if (booted) return null

  return (
    <div className={styles.boot} data-testid="boot" onClick={() => setBooted(true)}>
      <p className={styles.logo}>NEON<span>DIVE</span></p>
      <p className={styles.uplink}>{t(lang, 'boot.uplink')}</p>
      <div className={styles.bar}><span style={{ width: `${Math.max(pct, progress)}%` }} /></div>
      <button type="button" onClick={() => setBooted(true)}>{t(lang, 'boot.skip')}</button>
    </div>
  )
}
