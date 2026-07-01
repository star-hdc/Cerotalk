create table if not exists public.cerotalk_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cerotalk_state enable row level security;

-- The API routes authenticate with the anon key (no service_role secret is
-- stored in this repo), so the anon role needs explicit access to the single
-- shared row instead of relying on RLS bypass.
create policy "cerotalk_state_anon_select" on public.cerotalk_state
  for select to anon using (true);

create policy "cerotalk_state_anon_insert" on public.cerotalk_state
  for insert to anon with check (true);

create policy "cerotalk_state_anon_update" on public.cerotalk_state
  for update to anon using (true) with check (true);
