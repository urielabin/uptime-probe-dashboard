import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client -- bypasses RLS by design. Used exclusively by
 * api/ingest.ts to resolve an API key to a user and write on that machine
 * caller's behalf. The service-role key is a server-only env var (never
 * VITE_-prefixed), so it never reaches the browser bundle.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env['VITE_SUPABASE_URL']
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

  if (!url || !serviceRoleKey) {
    throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
