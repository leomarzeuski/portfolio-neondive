'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera, Vector3 } from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { createCamRail, createLookRail, sectionAt, SECTION_RANGES, type SectionId } from '@/lib/curve'
import { useApp } from '@/lib/store'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function CameraRig({ reduced = false }: { reduced?: boolean }) {
  const camRail = useMemo(() => createCamRail(), [])
  const lookRail = useMemo(() => createLookRail(), [])
  const proxy = useRef({ t: 0 })
  const smooth = useRef(0)
  const lastSection = useRef<SectionId>('hero')
  const pos = useMemo(() => new Vector3(), [])
  const look = useMemo(() => new Vector3(), [])

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-root',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        snap: reduced
          ? undefined
          : { snapTo: 'labelsDirectional', duration: { min: 0.2, max: 0.8 }, ease: 'power1.inOut' },
      },
    })
    tl.addLabel('hero')
      .to(proxy.current, { t: SECTION_RANGES.projects.start, duration: 15, ease: 'power1.inOut' })
      .addLabel('projects')
      .to(proxy.current, { t: SECTION_RANGES.journey.start, duration: 30, ease: 'none' })
      .addLabel('journey')
      .to(proxy.current, { t: SECTION_RANGES.skills.start, duration: 20, ease: 'power1.inOut' })
      .addLabel('skills')
      .to(proxy.current, { t: SECTION_RANGES.contact.start, duration: 20, ease: 'none' })
      .addLabel('contact')
      .to(proxy.current, { t: 1, duration: 15, ease: 'power1.out' })
  }, [reduced])

  useFrame((state, delta) => {
    const prevT = smooth.current
    // damp mais firme (9) + scrub 0.5 no ScrollTrigger → mergulho colado ao scroll, sem flutuar
    smooth.current = reduced
      ? proxy.current.t
      : MathUtils.damp(smooth.current, proxy.current.t, 9, delta)
    const t = MathUtils.clamp(smooth.current, 0, 1)
    camRail.getPointAt(t, pos)
    lookRail.getPointAt(Math.min(1, t + 0.02), look)

    // state.camera é o parâmetro do useFrame (não um valor de hook) → pode ajustar fov/posição
    const cam = state.camera as PerspectiveCamera
    if (reduced) {
      cam.position.copy(pos)
    } else {
      // cinematográfico: leve shake + FOV dinâmico proporcional à velocidade do mergulho
      const speed = MathUtils.clamp(Math.abs(smooth.current - prevT) / Math.max(delta, 1e-3) / 1.5, 0, 1)
      const time = state.clock.elapsedTime
      const amp = 0.06 + speed * 0.32
      const sx = Math.sin(time * 13.3) * amp + Math.sin(time * 7.1) * amp * 0.5
      const sy = Math.cos(time * 11.7) * amp
      cam.position.set(pos.x + sx, pos.y + sy, pos.z)
      cam.fov = MathUtils.damp(cam.fov, 55 + speed * 7, 5, delta)
      cam.updateProjectionMatrix()
    }
    cam.lookAt(look)

    const root = document.documentElement
    root.style.setProperty('--dive', t.toFixed(4))
    const sec = sectionAt(t)
    if (sec !== lastSection.current) {
      lastSection.current = sec
      root.dataset.section = sec
      useApp.getState().setActiveSection(sec)
    }
  })

  return null
}
