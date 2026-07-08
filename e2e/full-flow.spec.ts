import { expect, test } from '@playwright/test'

const DEV_API_URL = 'http://localhost:3001/api/ingest'

test('sign up, generate a key, push a real run from outside the page, see it appear live', async ({ page, request }) => {
  const email = `e2e-${Date.now()}@example.com`
  const password = 'test-password-123'
  const configName = `e2e-monitor-${Date.now()}`

  await page.goto('/signup')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign up' }).click()
  await page.waitForURL('**/dashboard')

  await page.goto('/settings/api-keys')
  await page.getByLabel('Key name').fill('e2e-test-key')
  await page.getByRole('button', { name: 'Generate key' }).click()
  const rawKey = await page.getByTestId('raw-api-key').textContent()
  expect(rawKey).toMatch(/^upd_/)

  // Pre-navigate to the monitor's page BEFORE any run exists for it -- the
  // Realtime subscription is already listening, so the assertion below
  // genuinely proves the live update, not just that the ingest write worked.
  await page.goto(`/dashboard/${encodeURIComponent(configName)}`)
  await expect(page.getByText('No runs yet for this monitor.')).toBeVisible()

  // The initial fetch resolving (above) only proves the page loaded --
  // it says nothing about the WebSocket subscription's own handshake,
  // which happens concurrently and isn't otherwise observable from
  // outside the page. Give it a moment to reach SUBSCRIBED before
  // pushing the row, so a slow handshake can't produce a false negative.
  await page.waitForTimeout(1500)

  const ingestResponse = await request.post(DEV_API_URL, {
    headers: { authorization: `Bearer ${rawKey}` },
    data: {
      configName,
      summary: {
        overallUptimePercent: 100,
        overallLatency: { min: 10, max: 50, mean: 20, p50: 18, p90: 30, p95: 40, p99: 45 },
        checks: [],
      },
      thresholdResult: { passed: true, violations: [] },
      narrative: 'e2e smoke run',
    },
  })
  expect(ingestResponse.status()).toBe(201)

  // No reload -- this is the point of the test.
  await expect(page.getByText('100.00%')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('e2e smoke run')).toBeVisible()
})
