import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CheckRunRow } from '../../lib/check-runs.js'

export function LatencyChart({ runs }: { runs: CheckRunRow[] }) {
  const data = runs.map((run) => ({
    time: new Date(run.pushed_at).toLocaleTimeString(),
    p95: run.overall_latency_p95_ms,
  }))

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-sm text-secondary mb-3">p95 latency (ms)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#86868b" fontSize={11} />
          <YAxis stroke="#86868b" fontSize={11} />
          <Tooltip contentStyle={{ background: '#111111', border: '1px solid #2a2a2a', borderRadius: 8 }} />
          <Line type="monotone" dataKey="p95" stroke="#f5a623" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
