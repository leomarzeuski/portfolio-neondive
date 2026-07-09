'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useApp, effectiveTier } from '@/lib/store'
import { t } from '@/lib/i18n'
import type { Tier } from '@/lib/quality'
import Sections from '@/components/dom/Sections'
import Hud from '@/components/dom/Hud'

const WorldCanvas = dynamic(() => import('@/components/world/World'), { ssr: false })

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
  const [webgl, setWebgl] = useState<boolean | null>(null)

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    if (!root.dataset.section) root.dataset.section = 'hero'
  }, [lang])

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

  const show3d = webgl === true && tier > 0

  return (
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
    </>
  )
}
