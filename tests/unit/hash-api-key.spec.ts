import { describe, expect, it } from 'vitest'
import { hashApiKey } from '../../api/_lib/hash-api-key.js'

describe('hashApiKey', () => {
  it('produces a 64-character hex digest', () => {
    const hash = hashApiKey('some-raw-token')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic for the same input', () => {
    expect(hashApiKey('token-a')).toBe(hashApiKey('token-a'))
  })

  it('produces different hashes for different inputs', () => {
    expect(hashApiKey('token-a')).not.toBe(hashApiKey('token-b'))
  })
})
