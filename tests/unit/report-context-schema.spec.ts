import { describe, expect, it } from 'vitest'
import { reportContextSchema } from '../../api/_lib/report-context-schema.js'

function validPayload() {
  return {
    configName: 'production api',
    summary: {
      overallUptimePercent: 100,
      overallLatency: { min: 10, max: 100, mean: 50, p50: 50, p90: 80, p95: 90, p99: 95 },
      checks: [
        {
          checkName: 'health',
          totalRuns: 1,
          totalFailures: 0,
          uptimePercent: 100,
          consecutiveFailures: 0,
          maxConsecutiveFailures: 0,
          latency: { min: 10, max: 10, mean: 10, p50: 10, p90: 10, p95: 10, p99: 10 },
          earlyP95Ms: 0,
          lateP95Ms: 10,
        },
      ],
    },
    thresholdResult: { passed: true, violations: [] },
    narrative: 'all good',
  }
}

describe('reportContextSchema', () => {
  it('accepts a real ReportContext payload', () => {
    const result = reportContextSchema.safeParse(validPayload())
    expect(result.success).toBe(true)
  })

  it('rejects a payload missing required fields', () => {
    const payload: Record<string, unknown> = validPayload()
    delete payload['configName']
    const result = reportContextSchema.safeParse(payload)
    expect(result.success).toBe(false)
  })

  it('passes through unknown extra fields instead of rejecting them (forward compatibility)', () => {
    const payload = { ...validPayload(), futureField: 'something new' }
    const result = reportContextSchema.safeParse(payload)
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>)['futureField']).toBe('something new')
    }
  })

  it('passes through unknown fields on nested check objects too', () => {
    const payload = validPayload()
    // @ts-expect-error -- intentionally adding an extra field to test passthrough
    payload.summary.checks[0].futureCheckField = 'new metric'
    const result = reportContextSchema.safeParse(payload)
    expect(result.success).toBe(true)
  })
})
