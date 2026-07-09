'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { createCamRail, createLookRail, sectionAt, SECTION_RANGES, type SectionId } from '@/lib/curve'
import { useApp } from '@/lib/store'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function CameraRig({ reduced = false }: { reduced?: boolean }) {
  const camera = useThree((s) => s.camera)
  const camRail = useMemo(createCamRail, [])
  const lookRail = useMemo(createLookRail, [])
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
        scrub: 1,
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

  useFrame((_, delta) => {
    smooth.current = reduced
      ? proxy.current.t
      : MathUtils.damp(smooth.current, proxy.current.t, 4, delta)
    const t = MathUtils.clamp(smooth.current, 0, 1)
    camRail.getPointAt(t, pos)
    lookRail.getPointAt(Math.min(1, t + 0.02), look)
    camera.position.copy(pos)
    camera.lookAt(look)

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
