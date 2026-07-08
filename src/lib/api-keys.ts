import { supabase } from './supabase-client.js'

export interface ApiKeyRow {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `upd_${hex}`
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generates a new API key entirely client-side: a CSPRNG token is hashed
 * and only the hash is persisted (via the user's own RLS-scoped insert).
 * The raw token is returned once and never stored anywhere -- callers must
 * show it to the user immediately, since it can't be retrieved again.
 */
export async function generateApiKey(userId: string, name: string): Promise<{ rawToken: string }> {
  const rawToken = randomToken()
  const keyHash = await sha256Hex(rawToken)
  const keyPrefix = rawToken.slice(0, 12)

  const { error } = await supabase
    .from('api_keys')
    .insert({ user_id: userId, name, key_prefix: keyPrefix, key_hash: keyHash })
  if (error) throw error

  return { rawToken }
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, created_at, last_used_at, revoked_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ApiKeyRow[]
}

export async function revokeApiKey(id: string): Promise<void> {
  const { error } = await supabase.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}
