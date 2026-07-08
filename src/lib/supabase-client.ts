import { createClient } from '@supabase/supabase-js'

const url = import.meta.env['VITE_SUPABASE_URL'] as string
const anonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string

if (!url || !anonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set')
}

// Browser client, scoped to the signed-in user's session -- every query
// this client makes is subject to RLS. Safe to expose the anon key; RLS is
// the actual access-control boundary, not key secrecy.
export const supabase = createClient(url, anonKey)
