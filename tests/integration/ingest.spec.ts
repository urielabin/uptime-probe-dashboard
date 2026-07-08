import { createServer, type IncomingMessage, type ServerResponse, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import handler from '../../api/ingest.js'

// Real local Supabase stack (via `supabase start`), no mocking -- matches
// the house style already used in uptime-probe's own integration tests.
const SUPABASE_URL = process.env['VITE_SUPABASE_URL'] ?? 'http://127.0.0.1:54321'
const SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']!
const ANON_KEY = process.env['VITE_SUPABASE_ANON_KEY']!

function validReportContext() {
  return {
    configName: 'integration-test-config',
    summary: {
      overallUptimePercent: 100,
      overallLatency: { min: 10, max: 100, mean: 50, p50: 50, p90: 80, p95: 90, p99: 95 },
      checks: [],
    },
    thresholdResult: { passed: true, violations: [] },
    narrative: 'all good',
  }
}

describe('POST /api/ingest (real HTTP against real local Supabase, no mocking)', () => {
  let server: Server
  let baseUrl: string
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  let userId: string
  let rawKey: string

  beforeAll(async () => {
    server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      let rawBody = ''
      for await (const chunk of req) rawBody += chunk
      const vercelReq = Object.assign(req, { body: rawBody ? JSON.parse(rawBody) : {} })
      const vercelRes = Object.assign(res, {
        status(code: number) {
          res.statusCode = code
          return vercelRes
        },
        json(payload: unknown) {
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(payload))
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await handler(vercelReq as any, vercelRes as any)
    }).listen(0)
    await new Promise<void>((resolve) => server.once('listening', resolve))
    const { port } = server.address() as AddressInfo
    baseUrl = `http://127.0.0.1:${port}`

    const email = `ingest-test-${Date.now()}@example.com`
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: 'test-password-123',
      email_confirm: true,
    })
    if (createError) throw createError
    userId = created.user.id

    rawKey = `upd_test_${crypto.randomUUID()}`
    const { createHash } = await import('node:crypto')
    const keyHash = createHash('sha256').update(rawKey).digest('hex')
    const { error: keyError } = await admin
      .from('api_keys')
      .insert({ user_id: userId, name: 'integration-test-key', key_prefix: rawKey.slice(0, 12), key_hash: keyHash })
    if (keyError) throw keyError
  })

  afterAll(async () => {
    server.close()
    await admin.auth.admin.deleteUser(userId)
  })

  it('accepts a valid push and inserts a real row', async () => {
    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${rawKey}` },
      body: JSON.stringify(validReportContext()),
    })
    expect(response.status).toBe(201)

    const { data } = await admin.from('check_runs').select('*').eq('user_id', userId)
    expect(data).toHaveLength(1)
    expect(data?.[0]?.['config_name']).toBe('integration-test-config')
  })

  it('rejects a missing Authorization header', async () => {
    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(validReportContext()),
    })
    expect(response.status).toBe(401)
  })

  it('rejects an invalid API key', async () => {
    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer not-a-real-key' },
      body: JSON.stringify(validReportContext()),
    })
    expect(response.status).toBe(401)
  })

  it('rejects a malformed payload', async () => {
    const response = await fetch(`${baseUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${rawKey}` },
      body: JSON.stringify({ nonsense: true }),
    })
    expect(response.status).toBe(400)
  })

  it('RLS blocks a different user from reading this row via the anon client', async () => {
    const otherEmail = `ingest-test-other-${Date.now()}@example.com`
    const { data: otherUser, error: otherCreateError } = await admin.auth.admin.createUser({
      email: otherEmail,
      password: 'test-password-123',
      email_confirm: true,
    })
    if (otherCreateError) throw otherCreateError

    const otherClient = createClient(SUPABASE_URL, ANON_KEY)
    const { error: signInError } = await otherClient.auth.signInWithPassword({
      email: otherEmail,
      password: 'test-password-123',
    })
    if (signInError) throw signInError

    const { data } = await otherClient.from('check_runs').select('*')
    expect(data).toHaveLength(0)

    await admin.auth.admin.deleteUser(otherUser.user.id)
  })
})
