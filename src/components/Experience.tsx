'use client'

import { useEffect } from 'react'
import { useApp } from '@/lib/store'
import { t } from '@/lib/i18n'
import Sections from '@/components/dom/Sections'
import Hud from '@/components/dom/Hud'

export default function Experience() {
  const lang = useApp((s) => s.lang)

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    if (!root.dataset.section) root.dataset.section = 'hero'
  }, [lang])

  return (
    <>
      <a className="skip-link" href="#projects">{t(lang, 'a11y.skip')}</a>
      <main id="scroll-root">
        <Sections />
      </main>
      <Hud />
    </>
  )
}
