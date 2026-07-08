import type { CheckRunRow } from '../../lib/check-runs.js'
import { MonitorCard } from './MonitorCard.js'

export function MonitorList({ runs }: { runs: CheckRunRow[] }) {
  if (runs.length === 0) {
    return (
      <div className="text-secondary text-sm">
        No monitors yet. Push a run from the CLI with <code className="text-primary">DASHBOARD_API_URL</code> and{' '}
        <code className="text-primary">DASHBOARD_API_KEY</code> set to see it here.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {runs.map((run) => (
        <MonitorCard key={run.config_name} run={run} />
      ))}
    </div>
  )
}
