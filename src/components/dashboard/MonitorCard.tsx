import { Link } from 'react-router-dom'
import type { CheckRunRow } from '../../lib/check-runs.js'

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function MonitorCard({ run }: { run: CheckRunRow }) {
  return (
    <Link
      to={`/dashboard/${encodeURIComponent(run.config_name)}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:border-secondary transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-primary">{run.config_name}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${run.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
        >
          {run.passed ? 'PASS' : 'FAIL'}
        </span>
      </div>
      <div className="flex gap-6 text-sm text-secondary">
        <span>Uptime {run.overall_uptime_percent.toFixed(2)}%</span>
        <span>p95 {run.overall_latency_p95_ms.toFixed(0)}ms</span>
      </div>
      <p className="text-xs text-secondary mt-3">Last seen {relativeTime(run.pushed_at)}</p>
    </Link>
  )
}
