import { describe, it, expect } from 'vitest'
import { PROJECTS, TIMELINE, SKILLS, SOCIALS } from './content'

describe('content', () => {
  it('6 projetos reais com ids únicos', () => {
    expect(PROJECTS).toHaveLength(6)
    expect(new Set(PROJECTS.map(p => p.id)).size).toBe(6)
  })
  it('todo projeto tem code no GitHub do Leo', () => {
    expect(PROJECTS.every(p => p.code.startsWith('https://github.com/leomarzeuski/'))).toBe(true)
  })
  it('timeline com 6 paradas, Meta primeiro', () => {
    expect(TIMELINE).toHaveLength(6)
    expect(TIMELINE[0].company).toBe('Meta')
  })
  it('5 grupos de skills com itens', () => {
    expect(SKILLS).toHaveLength(5)
    expect(SKILLS.every(s => s.items.length > 0)).toBe(true)
  })
  it('socials reais', () => {
    const hrefs = SOCIALS.map(s => s.href).join(' ')
    expect(hrefs).toContain('github.com/leomarzeuski')
    expect(hrefs).toContain('wa.me/5515988108850')
    expect(hrefs).toContain('mailto:leomarzeuskii@gmail.com')
    expect(hrefs).toContain('linkedin.com/in/leonardo-marzeuski')
  })
})
