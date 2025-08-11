-- 1) Table
create table if not exists player_identities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_main text check (role_main in ('Goalkeeper','Defender','Midfielder','Attacker')),
  role_type text,                     -- e.g. "Creator", "Finisher"
  strengths text[] default '{}',     -- up to 3
  helps_team text[] default '{}',    -- e.g. ["Create chances","Score goals"]
  main_weapon text,                  -- one sentence
  motto text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

-- 2) RLS
alter table player_identities enable row level security;

-- Current user can read own identity
create policy "read_own_identity"
on player_identities for select
to authenticated
using (user_id = auth.uid());

-- Current user can insert own identity
create policy "insert_own_identity"
on player_identities for insert
to authenticated
with check (user_id = auth.uid());

-- Current user can update own identity
create policy "update_own_identity"
on player_identities for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Keep updated_at fresh
create trigger update_player_identities_updated_at
before update on public.player_identities
for each row execute function public.update_updated_at_column();