import { Link, useParams } from 'react-router-dom'
import { useCheckRuns } from '../hooks/useCheckRuns.js'
import { UptimeChart } from '../components/monitor/UptimeChart.js'
import { LatencyChart } from '../components/monitor/LatencyChart.js'
import { RunHistoryTable } from '../components/monitor/RunHistoryTable.js'
import { NarrativePanel } from '../components/monitor/NarrativePanel.js'

export function MonitorDetailPage() {
  const { configName } = useParams<{ configName: string }>()
  const decodedName = decodeURIComponent(configName ?? '')
  const { runs, loading, realtimeReady } = useCheckRuns(decodedName)

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <Link to="/dashboard" className="text-sm text-secondary hover:text-primary">← Monitors</Link>
      <h1 className="text-2xl font-semibold mt-2 mb-8">{decodedName}</h1>
      {/* Observable-only signal for tests: an INSERT that happens before
          the Realtime subscription reaches SUBSCRIBED is missed forever,
          not just delayed, so waiting on a fixed timeout is unreliable. */}
      <span data-testid="realtime-status" data-ready={realtimeReady} className="hidden" />

      {loading ? (
        <p className="text-secondary text-sm">Loading…</p>
      ) : runs.length === 0 ? (
        <p className="text-secondary text-sm">No runs yet for this monitor.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UptimeChart runs={runs} />
            <LatencyChart runs={runs} />
          </div>
          <NarrativePanel latestRun={runs.at(-1)} />
          <RunHistoryTable runs={runs} />
        </div>
      )}
    </div>
  )
}
