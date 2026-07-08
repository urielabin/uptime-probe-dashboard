import type { CheckRunRow } from '../../lib/check-runs.js'

export function NarrativePanel({ latestRun }: { latestRun: CheckRunRow | undefined }) {
  if (!latestRun) return null

  const context = latestRun.context as { narrative?: string } | null
  const narrative = context?.narrative
  if (!narrative) return null

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-sm text-secondary mb-2">Latest summary</h3>
      <p className="text-sm text-primary leading-relaxed">{narrative}</p>
    </div>
  )
}
