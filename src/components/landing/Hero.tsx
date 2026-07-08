import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap.js'
import { PulseVisual } from './PulseVisual.js'

export function Hero() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const subheadRef = useRef<HTMLParagraphElement | null>(null)
  const ctaRef = useRef<HTMLDivElement | null>(null)
  const pulseRef = useRef<HTMLDivElement | null>(null)

  useGSAP(() => {
    gsap.timeline({ defaults: { ease: 'power2.out' } })
      .fromTo(headlineRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 0)
      .fromTo(subheadRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 0.15)
      .fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.3)
      .fromTo(pulseRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.5)
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 ref={headlineRef} className="opacity-0 text-5xl md:text-6xl font-bold tracking-tight mb-6">
        Uptime Probe Dashboard
      </h1>
      <p ref={subheadRef} className="opacity-0 text-secondary text-lg max-w-xl mb-10">
        A hosted home for your Uptime Probe CLI runs — live uptime and latency history, per monitor, updating in real time.
      </p>
      <div ref={ctaRef} className="opacity-0 flex gap-4 mb-16">
        <Link to="/signup" className="bg-accent text-white px-6 py-3 rounded-full font-medium hover:bg-accent/90 transition-colors">
          Sign up
        </Link>
        <Link to="/login" className="border border-border px-6 py-3 rounded-full font-medium hover:border-secondary transition-colors">
          Log in
        </Link>
      </div>
      <div ref={pulseRef} className="opacity-0">
        <PulseVisual />
      </div>
    </section>
  )
}
