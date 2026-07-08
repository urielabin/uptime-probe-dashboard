import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createSupabaseAdminClient } from './_lib/supabase-admin.js'
import { hashApiKey } from './_lib/hash-api-key.js'
import { reportContextSchema } from './_lib/report-context-schema.js'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' })
    return
  }

  const authHeader = req.headers['authorization']
  const bearerMatch = typeof authHeader === 'string' ? /^Bearer (.+)$/.exec(authHeader) : null
  if (!bearerMatch) {
    res.status(401).json({ error: 'missing or malformed Authorization header' })
    return
  }
  const rawKey = bearerMatch[1]!
  const keyHash = hashApiKey(rawKey)

  let supabase
  try {
    supabase = createSupabaseAdminClient()
  } catch (error) {
    console.error('uptime-probe-dashboard: ingest misconfigured:', error)
    res.status(500).json({ error: 'internal error' })
    return
  }

  const { data: apiKeyRow, error: lookupError } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key_hash', keyHash)
    .is('revoked_at', null)
    .maybeSingle()

  if (lookupError) {
    console.error('uptime-probe-dashboard: api_keys lookup failed:', lookupError)
    res.status(500).json({ error: 'internal error' })
    return
  }
  if (!apiKeyRow) {
    res.status(401).json({ error: 'invalid or revoked API key' })
    return
  }

  const parsed = reportContextSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid payload', issues: parsed.error.issues })
    return
  }
  const context = parsed.data

  const { data: insertedRow, error: insertError } = await supabase
    .from('check_runs')
    .insert({
      user_id: apiKeyRow['user_id'],
      config_name: context.configName,
      overall_uptime_percent: context.summary.overallUptimePercent,
      overall_latency_p95_ms: context.summary.overallLatency.p95,
      passed: context.thresholdResult.passed,
      violation_count: context.thresholdResult.violations.length,
      context,
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('uptime-probe-dashboard: check_runs insert failed:', insertError)
    res.status(500).json({ error: 'internal error' })
    return
  }

  // Best-effort -- don't fail the request if this write doesn't land.
  await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', apiKeyRow['id'])

  res.status(201).json({ received: true, id: insertedRow['id'] })
}
