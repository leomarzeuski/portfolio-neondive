'use client'

import { useApp } from '@/lib/store'
import { t } from '@/lib/i18n'
import { PROJECTS, TIMELINE, SKILLS, SOCIALS } from '@/lib/content'

export default function Sections() {
  const lang = useApp((s) => s.lang)
  const openProject = useApp((s) => s.openProject)

  return (
    <>
      <section id="hero" className="sec sec-hero">
        <div className="panel panel-center">
          <p className="badge">{t(lang, 'hero.badge')}</p>
          <p className="hi">{t(lang, 'hero.hi')}</p>
          <h1 className="name">LEONARDO<br />MARZEUSKI</h1>
          <p className="sub">{t(lang, 'hero.sub')}</p>
          <a className="cta" href="#projects">{t(lang, 'hero.dive')}</a>
        </div>
      </section>

      <section id="projects" className="sec sec-projects">
        <div className="panel">
          <p className="eyebrow">{t(lang, 'sec.projects.eyebrow')}</p>
          <h2 className="title">{t(lang, 'sec.projects.title')}</h2>
          <ul className="cards">
            {PROJECTS.map((p) => (
              <li key={p.id} className="card">
                <header>
                  <span className="codename">{p.codename}</span>
                  <span className="status" style={{ color: p.statusColor }}>{p.status[lang]}</span>
                </header>
                <h3>{p.title}</h3>
                <p className="type">{p.type[lang]}</p>
                <p className="desc">{p.desc[lang]}</p>
                <p className="chips">{p.stack.map((s) => <span key={s}>{s}</span>)}</p>
                <button type="button" className="inspect" onClick={() => openProject(p.id)}>
                  {t(lang, 'work.inspect')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="journey" className="sec sec-journey">
        <div className="panel">
          <p className="eyebrow">{t(lang, 'sec.journey.eyebrow')}</p>
          <h2 className="title">{t(lang, 'sec.journey.title')}</h2>
          <ol className="timeline">
            {TIMELINE.map((s) => (
              <li key={s.company + s.year.en}>
                <span className="year">{s.year[lang]}</span>
                <h3>{s.role[lang]} · {s.company}</h3>
                <p className="desc">{s.desc[lang]}</p>
                <p className="chips">{s.tags.map((tag) => <span key={tag}>{tag}</span>)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="skills" className="sec sec-skills">
        <div className="panel">
          <p className="eyebrow">{t(lang, 'sec.skills.eyebrow')}</p>
          <h2 className="title">{t(lang, 'sec.skills.title')}</h2>
          <ul className="skill-groups">
            {SKILLS.map((g) => (
              <li key={g.code} className="skill-group">
                <h3><span className="code">{g.code}</span> {g.cat[lang]}</h3>
                <p className="chips">{g.items.map((i) => <span key={i}>{i}</span>)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" className="sec sec-contact">
        <div className="panel panel-center">
          <p className="eyebrow">{t(lang, 'sec.contact.eyebrow')}</p>
          <h2 className="title">{t(lang, 'sec.contact.title')}</h2>
          <p className="sub">{t(lang, 'sec.contact.sub')}</p>
          <ul className="socials">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <strong>{s.label}</strong> <span>{s.handle}</span>
                </a>
              </li>
            ))}
          </ul>
          <footer className="footer">
            <p>{t(lang, 'footer.built')}</p>
            <p className="hint">{t(lang, 'footer.hint')}</p>
          </footer>
        </div>
      </section>
    </>
  )
}
