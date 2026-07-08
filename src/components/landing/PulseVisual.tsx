import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap.js'

/** A small animated "live" pulse line — the one bespoke visual touch for the hero. */
export function PulseVisual() {
  const dotRef = useRef<SVGCircleElement | null>(null)

  useGSAP(() => {
    if (!dotRef.current) return
    gsap.to(dotRef.current, {
      keyframes: [
        { cx: 0, cy: 30 },
        { cx: 60, cy: 30 },
        { cx: 75, cy: 8 },
        { cx: 90, cy: 52 },
        { cx: 105, cy: 30 },
        { cx: 320, cy: 30 },
      ],
      duration: 3,
      repeat: -1,
      ease: 'none',
    })
  }, [])

  return (
    <svg viewBox="0 0 320 60" width="320" height="60" className="opacity-80">
      <polyline
        points="0,30 60,30 75,8 90,52 105,30 320,30"
        fill="none"
        stroke="#2997ff"
        strokeWidth="2"
        strokeOpacity="0.3"
      />
      <circle ref={dotRef} cx="0" cy="30" r="4" fill="#2997ff" />
    </svg>
  )
}
