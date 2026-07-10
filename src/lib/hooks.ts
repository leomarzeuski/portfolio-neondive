'use client'

import { useSyncExternalStore } from 'react'

function subscribeMedia(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeMedia('(prefers-reduced-motion: reduce)'),
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeMedia('(pointer: coarse), (max-width: 759px)'),
    () => window.matchMedia('(pointer: coarse), (max-width: 759px)').matches,
    () => false,
  )
}
