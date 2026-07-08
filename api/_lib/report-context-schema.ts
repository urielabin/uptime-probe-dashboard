import { z } from 'zod'

// Mirrors uptime-probe's ReportContext shape, loosely -- .passthrough() at
// every level because the CLI and this dashboard are independently
// versioned repos; a future CLI field addition must not hard-break ingestion.

const latencyStatsSchema = z
  .object({
    min: z.number(),
    max: z.number(),
    mean: z.number(),
    p50: z.number(),
    p90: z.number(),
    p95: z.number(),
    p99: z.number(),
  })
  .passthrough()

const checkSummarySchema = z
  .object({
    checkName: z.string(),
    totalRuns: z.number(),
    totalFailures: z.number(),
    uptimePercent: z.number(),
    consecutiveFailures: z.number(),
    maxConsecutiveFailures: z.number(),
    latency: latencyStatsSchema,
    earlyP95Ms: z.number(),
    lateP95Ms: z.number(),
  })
  .passthrough()

const probeSummarySchema = z
  .object({
    overallUptimePercent: z.number(),
    overallLatency: latencyStatsSchema,
    checks: z.array(checkSummarySchema),
  })
  .passthrough()

const thresholdViolationSchema = z
  .object({
    metric: z.string(),
    limit: z.number(),
    actual: z.number(),
  })
  .passthrough()

const thresholdResultSchema = z
  .object({
    passed: z.boolean(),
    violations: z.array(thresholdViolationSchema),
  })
  .passthrough()

export const reportContextSchema = z
  .object({
    configName: z.string(),
    summary: probeSummarySchema,
    thresholdResult: thresholdResultSchema,
    narrative: z.string(),
  })
  .passthrough()

export type PushedReportContext = z.infer<typeof reportContextSchema>
