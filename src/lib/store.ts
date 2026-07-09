import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from './i18n'
import type { Tier } from './quality'

// manter em sincronia com curve.ts (Task 4 troca por: import type { SectionId } from './curve')
type SectionId = 'hero' | 'projects' | 'journey' | 'skills' | 'contact'

interface AppState {
  lang: Lang
  tier: Tier
  tierOverride: Tier | null
  soundOn: boolean
  booted: boolean
  synthwave: boolean
  activeSection: SectionId
  openProjectId: string | null
  setLang: (l: Lang) => void
  setTier: (t: Tier) => void
  setTierOverride: (t: Tier | null) => void
  toggleSound: () => void
  setBooted: (v: boolean) => void
  toggleSynthwave: () => void
  setActiveSection: (s: SectionId) => void
  openProject: (id: string | null) => void
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      tier: 1,
      tierOverride: null,
      soundOn: false,
      booted: false,
      synthwave: false,
      activeSection: 'hero',
      openProjectId: null,
      setLang: (lang) => set({ lang }),
      setTier: (tier) => set({ tier }),
      setTierOverride: (tierOverride) => set({ tierOverride }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setBooted: (booted) => set({ booted }),
      toggleSynthwave: () => set((s) => ({ synthwave: !s.synthwave })),
      setActiveSection: (activeSection) => set({ activeSection }),
      openProject: (openProjectId) => set({ openProjectId }),
    }),
    {
      name: 'neondive',
      // tierOverride NÃO persiste: ?tier=N (debug) passa por ele
      partialize: (s) => ({ lang: s.lang }),
    },
  ),
)

export function effectiveTier(s: { tier: Tier; tierOverride: Tier | null }): Tier {
  return s.tierOverride === null ? s.tier : s.tierOverride
}
