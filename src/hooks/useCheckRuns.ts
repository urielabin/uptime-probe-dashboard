import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-client.js'
import { type CheckRunRow, listRunsForConfig, subscribeToNewRuns } from '../lib/check-runs.js'
import { useSession } from './useSession.js'

/**
 * Loads run history for one monitor and live-appends new rows as they land
 * via the Realtime subscription -- no polling, no custom WebSocket server.
 */
export function useCheckRuns(configName: string): { runs: CheckRunRow[]; loading: boolean } {
  const { session } = useSession()
  const [runs, setRuns] = useState<CheckRunRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    let cancelled = false
    setLoading(true)
    listRunsForConfig(configName).then((rows) => {
      if (!cancelled) {
        setRuns(rows)
        setLoading(false)
      }
    })

    const channel = subscribeToNewRuns(session.user.id, (row) => {
      if (row.config_name !== configName) return
      setRuns((prev) => [...prev, row])
    })

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [session, configName])

  return { runs, loading }
}
