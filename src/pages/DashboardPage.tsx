import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type CheckRunRow, listLatestRunPerConfig } from '../lib/check-runs.js'
import { MonitorList } from '../components/dashboard/MonitorList.js'
import { signOut } from '../lib/auth.js'

export function DashboardPage() {
  const [runs, setRuns] = useState<CheckRunRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listLatestRunPerConfig()
      .then(setRuns)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Monitors</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/settings/api-keys" className="text-secondary hover:text-primary">API keys</Link>
          <button onClick={() => signOut()} className="text-secondary hover:text-primary">Log out</button>
        </div>
      </div>
      {loading ? (
        <p className="text-secondary text-sm">Loading…</p>
      ) : (
        <MonitorList runs={runs} />
      )}
    </div>
  )
}
