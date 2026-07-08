import { useScrollReveal } from '../../hooks/useScrollReveal.js'

const features = [
  {
    title: 'Push from the CLI',
    body: 'Set DASHBOARD_API_URL and DASHBOARD_API_KEY and every uptime-probe run is pushed here automatically — no extra tooling.',
  },
  {
    title: 'Live, not polled',
    body: 'New runs appear the moment they land, via a Postgres realtime subscription scoped to your account.',
  },
  {
    title: 'Your data, your account',
    body: 'Real accounts, row-level security, and per-key revocation — nothing here is shared across users.',
  },
]

function FeatureCard({ title, body }: { title: string; body: string }) {
  const ref = useScrollReveal({ y: 20 })
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="bg-surface border border-border rounded-xl p-6">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-secondary text-sm leading-relaxed">{body}</p>
    </div>
  )
}

export function Features() {
  return (
    <section className="px-6 py-20 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </section>
  )
}
