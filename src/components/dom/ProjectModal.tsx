'use client'

import { useEffect, useRef } from 'react'
import { useApp } from '@/lib/store'
import { t } from '@/lib/i18n'
import { PROJECTS } from '@/lib/content'
import styles from './ProjectModal.module.css'

export default function ProjectModal() {
  const openProjectId = useApp((s) => s.openProjectId)
  const openProject = useApp((s) => s.openProject)
  const lang = useApp((s) => s.lang)
  const closeRef = useRef<HTMLButtonElement>(null)

  const project = PROJECTS.find((p) => p.id === openProjectId)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // trava o scroll e torna o fundo inerte enquanto o modal está aberto.
  // declarado ANTES do effect de foco: cleanups rodam em ordem de declaração,
  // então o inert sai do gatilho antes do foco ser devolvido a ele.
  useEffect(() => {
    if (!project) return
    // captura o foco anterior ANTES do inert — inert num ancestral desfoca o gatilho
    previousFocusRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const bg = [document.getElementById('scroll-root'), document.getElementById('hud')]
    bg.forEach((el) => el?.setAttribute('inert', ''))
    return () => {
      bg.forEach((el) => el?.removeAttribute('inert'))
      document.body.style.overflow = ''
    }
  }, [project])

  useEffect(() => {
    if (!project) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') openProject(null) }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previousFocusRef.current?.focus()
    }
  }, [project, openProject])

  if (!project) return null

  return (
    <div className={styles.backdrop} data-lenis-prevent onClick={() => openProject(null)}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <span className={styles.codename}>{project.codename} · <span style={{ color: project.statusColor }}>{project.status[lang]}</span></span>
          <button ref={closeRef} type="button" className={styles.close} onClick={() => openProject(null)}>
            {t(lang, 'modal.close')}
          </button>
        </header>
        <h2>{project.title}</h2>
        <p className={styles.type}>{project.type[lang]}</p>
        <p className={styles.label}>{t(lang, 'modal.briefing')}</p>
        <p>{project.desc[lang]}</p>
        <p className={styles.label}>{t(lang, 'modal.challenge')}</p>
        <p>{project.challenges[lang]}</p>
        <p className={styles.label}>{t(lang, 'modal.stack')}</p>
        <p className="chips">{project.stack.map((s) => <span key={s}>{s}</span>)}</p>
        <div className={styles.links}>
          {project.demo && <a href={project.demo} target="_blank" rel="noreferrer">{t(lang, 'modal.demo')}</a>}
          <a className={styles.ghost} href={project.code} target="_blank" rel="noreferrer">{t(lang, 'modal.code')}</a>
        </div>
      </div>
    </div>
  )
}
