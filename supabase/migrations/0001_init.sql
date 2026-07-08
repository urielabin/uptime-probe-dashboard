create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_prefix text not null,       -- first 8 chars of the raw token, shown in UI so users can tell keys apart
  key_hash text not null,         -- sha-256 hex digest of the full token; raw token is never stored
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
alter table api_keys enable row level security;
create policy "select own keys" on api_keys for select using (auth.uid() = user_id);
create policy "insert own keys" on api_keys for insert with check (auth.uid() = user_id);
create policy "revoke own keys" on api_keys for update using (auth.uid() = user_id);

-- Recent Supabase versions no longer auto-expose new tables to the Data
-- API roles -- explicit grants are required. RLS above still enforces
-- per-row access; these grants are table-level, not a bypass.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on api_keys to authenticated;
grant all on api_keys to service_role;

create table check_runs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  config_name text not null,
  pushed_at timestamptz not null default now(),
  overall_uptime_percent numeric not null,
  overall_latency_p95_ms numeric not null,
  passed boolean not null,
  violation_count int not null,
  context jsonb not null          -- full ReportContext, verbatim: per-check breakdown, narrative, violations
);
alter table check_runs enable row level security;
create policy "select own runs" on check_runs for select using (auth.uid() = user_id);
-- deliberately no insert policy for the authenticated role: only the
-- service-role client (used exclusively by api/ingest.ts) writes here.
create index check_runs_user_config_time_idx on check_runs (user_id, config_name, pushed_at desc);

grant select on check_runs to authenticated;
grant all on check_runs to service_role;
grant usage, select on sequence check_runs_id_seq to service_role;

-- Realtime: allow the postgres_changes subscription to stream INSERTs on
-- check_runs to subscribed clients (RLS above still scopes which rows a
-- given user's subscription can actually see).
alter publication supabase_realtime add table check_runs;
