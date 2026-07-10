'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ReactLenis, type LenisRef } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useApp, effectiveTier } from '@/lib/store'
import { t } from '@/lib/i18n'
import type { Tier } from '@/lib/quality'
import { usePrefersReducedMotion } from '@/lib/hooks'
import { createKonami } from '@/lib/konami'
import { createCityAudio, type CityAudio } from '@/lib/audio'
import Sections from '@/components/dom/Sections'
import Hud from '@/components/dom/Hud'
import ProjectModal from '@/components/dom/ProjectModal'
import BootOverlay from '@/components/dom/BootOverlay'
import CursorTrail from '@/components/dom/CursorTrail'

const WorldCanvas = dynamic(() => import('@/components/world/World'), { ssr: false })

// Experience é SSR-renderizado (client component ainda roda no servidor) — guard obrigatório
if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

function webglSupported(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Experience() {
  const lang = useApp((s) => s.lang)
  const tier = useApp((s) => effectiveTier(s))
  const setTierOverride = useApp((s) => s.setTierOverride)
  const synthwave = useApp((s) => s.synthwave)
  const soundOn = useApp((s) => s.soundOn)
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const reduced = usePrefersReducedMotion()
  const lenisRef = useRef<LenisRef>(null)
  const audioRef = useRef<CityAudio | null>(null)

  useEffect(() => {
    const feed = createKonami(() => useApp.getState().toggleSynthwave())
    const onKey = (e: KeyboardEvent) => feed(e)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('synthwave', synthwave)
  }, [synthwave])

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    if (!root.dataset.section) root.dataset.section = 'hero'
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.reduced = String(reduced)
    if (reduced) return
    const update = () => ScrollTrigger.update()
    const raf = (time: number) => lenisRef.current?.lenis?.raf(time * 1000)
    lenisRef.current?.lenis?.on('scroll', update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenisRef.current?.lenis?.off('scroll', update)
    }
  }, [reduced])

  useEffect(() => {
    // ?tier=N força o tier (para testes e debug)
    const forced = new URLSearchParams(window.location.search).get('tier')
    if (forced !== null && ['0', '1', '2', '3'].includes(forced)) {
      setTierOverride(Number(forced) as Tier)
    }
    setWebgl(webglSupported())
  }, [setTierOverride])

  useEffect(() => {
    document.documentElement.dataset.tier = String(webgl === false ? 0 : tier)
  }, [tier, webgl])

  useEffect(() => {
    if (soundOn) {
      audioRef.current ??= createCityAudio()
      audioRef.current.start()
      const depthId = setInterval(() => {
        const dive = Number(getComputedStyle(document.documentElement).getPropertyValue('--dive')) || 0
        audioRef.current?.setDepth(dive)
      }, 250)
      const unsub = useApp.subscribe((s, prev) => {
        if (s.activeSection !== prev.activeSection) audioRef.current?.whoosh()
      })
      return () => { clearInterval(depthId); unsub() }
    }
    audioRef.current?.stop()
  }, [soundOn])

  const show3d = webgl === true && tier > 0

  const content = (
    <>
      <a className="skip-link" href="#projects">{t(lang, 'a11y.skip')}</a>
      {show3d ? <WorldCanvas /> : webgl !== null ? (
        <div className="static-fallback" aria-hidden>
          <p>{t(lang, 'a11y.static')}</p>
        </div>
      ) : null}
      <main id="scroll-root">
        <Sections />
      </main>
      <Hud />
      <CursorTrail />
      <ProjectModal />
      <BootOverlay />
    </>
  )

  return reduced ? content : (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {content}
    </ReactLenis>
  )
}
