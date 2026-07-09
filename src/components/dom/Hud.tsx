'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { t } from '@/lib/i18n'
import { SECTIONS } from '@/lib/curve'
import type { Tier } from '@/lib/quality'
import styles from './Hud.module.css'

const QUALITY_OPTIONS: { key: string; value: Tier | null }[] = [
  { key: 'hud.quality_auto', value: null },
  { key: 'hud.quality_high', value: 3 },
  { key: 'hud.quality_medium', value: 2 },
  { key: 'hud.quality_low', value: 1 },
]

export default function Hud() {
  const lang = useApp((s) => s.lang)
  const setLang = useApp((s) => s.setLang)
  const soundOn = useApp((s) => s.soundOn)
  const toggleSound = useApp((s) => s.toggleSound)
  const tierOverride = useApp((s) => s.tierOverride)
  const setTierOverride = useApp((s) => s.setTierOverride)
  const synthwave = useApp((s) => s.synthwave)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className={styles.hud} aria-label="HUD">
      <div className={styles.controls}>
        <button type="button" onClick={() => setLang(lang === 'en' ? 'pt' : 'en')}>
          {lang === 'en' ? 'PT' : 'EN'}
        </button>
        <button type="button" onClick={toggleSound} aria-pressed={soundOn}>
          {t(lang, soundOn ? 'hud.sound_on' : 'hud.sound_off')}
        </button>
        <button type="button" onClick={() => setSettingsOpen((v) => !v)} aria-expanded={settingsOpen}>
          {t(lang, 'hud.settings')}
        </button>
      </div>

      {settingsOpen && (
        <div className={styles.settings} role="group" aria-label={t(lang, 'hud.quality')}>
          <h3>{t(lang, 'hud.quality')}</h3>
          {QUALITY_OPTIONS.map((o) => (
            <label key={o.key}>
              <input
                type="radio"
                name="quality"
                checked={tierOverride === o.value}
                onChange={() => setTierOverride(o.value)}
              />
              {t(lang, o.key)}
            </label>
          ))}
        </div>
      )}

      <nav className={styles.altimeter} data-testid="altimeter" aria-label="sections">
        {SECTIONS.map((id, i) => (
          <a key={id} href={`#${id}`} style={{ top: `${(i / (SECTIONS.length - 1)) * 100}%` }}>
            {t(lang, `nav.${id}`)}
          </a>
        ))}
        <span className={styles.needle} aria-hidden />
        <span className={styles.alt_label}>{t(lang, 'hud.altitude')}</span>
      </nav>

      <div className={`${styles.toast} ${synthwave ? styles.toastOn : ''}`} role="status">
        {t(lang, 'konami.toast')}
      </div>
    </div>
  )
}
