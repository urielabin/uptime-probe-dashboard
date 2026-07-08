import { createHash } from 'node:crypto'

/** Pure function: SHA-256 hex digest of a raw API key. The raw key itself is never stored. */
export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}
