import type { CheckRunRow } from '../../lib/check-runs.js'

export function RunHistoryTable({ runs }: { runs: CheckRunRow[] }) {
  const recent = [...runs].reverse().slice(0, 20)

  return (
    <div className="bg-surface border border-border rounded-xl p-4 overflow-x-auto">
      <h3 className="text-sm text-secondary mb-3">Recent runs</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-secondary border-b border-border">
            <th className="pb-2 pr-4">Pushed at</th>
            <th className="pb-2 pr-4">Uptime</th>
            <th className="pb-2 pr-4">p95</th>
            <th className="pb-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((run) => (
            <tr key={run.id} className="border-b border-border/50">
              <td className="py-2 pr-4 text-secondary">{new Date(run.pushed_at).toLocaleString()}</td>
              <td className="py-2 pr-4">{run.overall_uptime_percent.toFixed(2)}%</td>
              <td className="py-2 pr-4">{run.overall_latency_p95_ms.toFixed(0)}ms</td>
              <td className="py-2 pr-4">
                <span className={run.passed ? 'text-green-400' : 'text-red-400'}>{run.passed ? 'PASS' : 'FAIL'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
