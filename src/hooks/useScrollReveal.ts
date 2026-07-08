import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/gsap.js'

/** Fade+translateY a single element in on scroll, once. Mirrors the portfolio site's own hook for visual consistency across projects. */
export function useScrollReveal({ y = 24, duration = 0.6, delay = 0, start = 'top 85%' } = {}) {
  const ref = useRef<HTMLElement | null>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start,
          toggleActions: 'play none none none',
        },
      },
    )
  }, [])

  return ref
}
