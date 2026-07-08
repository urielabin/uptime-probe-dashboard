import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CheckRunRow } from '../../lib/check-runs.js'

export function UptimeChart({ runs }: { runs: CheckRunRow[] }) {
  const data = runs.map((run) => ({
    time: new Date(run.pushed_at).toLocaleTimeString(),
    uptime: run.overall_uptime_percent,
  }))

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <h3 className="text-sm text-secondary mb-3">Uptime %</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#86868b" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="#86868b" fontSize={11} />
          <Tooltip contentStyle={{ background: '#111111', border: '1px solid #2a2a2a', borderRadius: 8 }} />
          <Line type="monotone" dataKey="uptime" stroke="#2997ff" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
