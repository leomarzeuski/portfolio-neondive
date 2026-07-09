'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks'

export default function CursorTrail() {
  const dot = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced || window.matchMedia('(pointer: coarse)').matches) return
    const el = dot.current
    if (!el) return
    let raf = 0
    let x = -100
    let y = -100
    let tx = -100
    let ty = -100
    const onMove = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY }
    const tick = () => {
      x += (tx - x) * 0.16
      y += (ty - y) * 0.16
      el.style.transform = `translate(${x}px, ${y}px)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf) }
  }, [reduced])

  if (reduced) return null
  return <div ref={dot} className="cursor-trail" aria-hidden />
}
