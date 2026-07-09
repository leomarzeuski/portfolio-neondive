'use client'

import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useApp, effectiveTier } from '@/lib/store'
import { t } from '@/lib/i18n'
import { usePrefersReducedMotion } from '@/lib/hooks'
import styles from './BootOverlay.module.css'

const MIN_MS = 900
const MAX_MS = 4000

export default function BootOverlay() {
  const lang = useApp((s) => s.lang)
  const booted = useApp((s) => s.booted)
  const setBooted = useApp((s) => s.setBooted)
  const tier = useApp((s) => effectiveTier(s))
  const reduced = usePrefersReducedMotion()
  const { progress } = useProgress()
  const [minElapsed, setMinElapsed] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('noboot') || reduced || tier === 0) {
      setBooted(true)
    }
  }, [reduced, tier, setBooted])

  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), MIN_MS)
    const max = setTimeout(() => setBooted(true), MAX_MS)
    return () => { clearTimeout(min); clearTimeout(max) }
  }, [setBooted])

  useEffect(() => {
    if (progress >= 100 && minElapsed) setBooted(true)
  }, [progress, minElapsed, setBooted])

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
      <div className={styles.bar}><span style={{ width: `${Math.max(8, progress)}%` }} /></div>
      <button type="button" onClick={() => setBooted(true)}>{t(lang, 'boot.skip')}</button>
    </div>
  )
}
