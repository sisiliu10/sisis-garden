-- Sisi's Garden: database setup. Paste all of this into Supabase > SQL Editor > New query, then press Run.

create table if not exists public.docs (
  path        text primary key,
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.docs enable row level security;

-- Who can read: every signed-in player sees all gardens (and who owns the app).
-- Private notes (data/users/...) only their owner.
drop policy if exists "read" on public.docs;
create policy "read" on public.docs for select to authenticated
  using (path like 'gardens/%' or path = 'app/owner' or owner = auth.uid());

-- Who can write: everyone only their own garden and their own private data.
drop policy if exists "insert own" on public.docs;
create policy "insert own" on public.docs for insert to authenticated
  with check (
    owner = auth.uid() and (
      path = 'gardens/' || auth.uid()
      or path like 'gardens/' || auth.uid() || '/%'
      or path like 'data/users/' || auth.uid() || '/%'
      or (path = 'app/owner' and auth.jwt() ->> 'email' = 'sisiliu2003@icloud.com' and data ->> 'id' = auth.uid()::text)
    )
  );

drop policy if exists "update own" on public.docs;
create policy "update own" on public.docs for update to authenticated
  using (owner = auth.uid())
  with check (
    owner = auth.uid() and (
      path = 'gardens/' || auth.uid()
      or path like 'gardens/' || auth.uid() || '/%'
      or path like 'data/users/' || auth.uid() || '/%'
      or (path = 'app/owner' and auth.jwt() ->> 'email' = 'sisiliu2003@icloud.com' and data ->> 'id' = auth.uid()::text)
    )
  );

-- Live updates when someone's garden changes
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- Number of gardens, for the sign-up screen ("Join 12 gardeners …"). Only returns a count, nothing else.
create or replace function public.garden_count() returns integer
  language sql stable security definer set search_path = public
as $$ select count(*)::int from public.docs where path ~ '^gardens/[^/]+$' $$;
revoke all on function public.garden_count() from public;
grant execute on function public.garden_count() to anon, authenticated;
