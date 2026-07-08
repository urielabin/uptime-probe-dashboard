import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase-client.js'

export interface CheckRunRow {
  id: number
  config_name: string
  pushed_at: string
  overall_uptime_percent: number
  overall_latency_p95_ms: number
  passed: boolean
  violation_count: number
  context: unknown
}

const RUN_COLUMNS = 'id, config_name, pushed_at, overall_uptime_percent, overall_latency_p95_ms, passed, violation_count, context'

/**
 * One card per distinct monitor (configName). RLS already scopes every
 * query to the signed-in user, so no explicit user_id filter is needed
 * here. Groups client-side rather than a SQL GROUP BY -- simplest option
 * at this scale, and it's the actual latest full row we want, not an
 * aggregate.
 */
export async function listLatestRunPerConfig(): Promise<CheckRunRow[]> {
  const { data, error } = await supabase
    .from('check_runs')
    .select(RUN_COLUMNS)
    .order('pushed_at', { ascending: false })
    .limit(500)
  if (error) throw error

  const latestByConfig = new Map<string, CheckRunRow>()
  for (const row of data as CheckRunRow[]) {
    if (!latestByConfig.has(row.config_name)) {
      latestByConfig.set(row.config_name, row)
    }
  }
  return Array.from(latestByConfig.values())
}

export async function listRunsForConfig(configName: string, limit = 200): Promise<CheckRunRow[]> {
  const { data, error } = await supabase
    .from('check_runs')
    .select(RUN_COLUMNS)
    .eq('config_name', configName)
    .order('pushed_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data as CheckRunRow[]
}

/**
 * Subscribes to new check_runs rows for the given user via Supabase
 * Realtime -- no custom WebSocket server needed. The `filter` is
 * defense-in-depth on top of RLS, not the access-control boundary itself.
 * Caller is responsible for calling `supabase.removeChannel(channel)` on
 * unmount.
 */
export function subscribeToNewRuns(userId: string, onInsert: (row: CheckRunRow) => void): RealtimeChannel {
  return supabase
    .channel(`check_runs:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'check_runs', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new as CheckRunRow),
    )
    .subscribe()
}
