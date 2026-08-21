-- Kuvvet Takip: RLS — 2 rollü model (entry: yazar, viewer: sadece okur)

create function public.is_entry()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'entry'
  );
$$;

create function public.is_authenticated()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null;
$$;

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.muscle_groups enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_muscle_groups enable row level security;
alter table public.training_sessions enable row level security;
alter table public.session_entries enable row level security;

-- profiles: herkes okuyabilir ("kim girdi" göstermek için); rol alanı burada
-- güncellenemez, sadece set_user_role() RPC ile değişir (bkz. 0003).
create policy profiles_select_all on public.profiles
  for select using (public.is_authenticated());

create policy profiles_update_own_name on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- players
create policy players_select_all on public.players
  for select using (public.is_authenticated());
create policy players_write_entry on public.players
  for all using (public.is_entry()) with check (public.is_entry());

-- muscle_groups (nadiren değişir, yine de entry rolüne yazı izni)
create policy muscle_groups_select_all on public.muscle_groups
  for select using (public.is_authenticated());
create policy muscle_groups_write_entry on public.muscle_groups
  for all using (public.is_entry()) with check (public.is_entry());

-- exercises
create policy exercises_select_all on public.exercises
  for select using (public.is_authenticated());
create policy exercises_write_entry on public.exercises
  for all using (public.is_entry()) with check (public.is_entry());

-- exercise_muscle_groups
create policy exercise_muscle_groups_select_all on public.exercise_muscle_groups
  for select using (public.is_authenticated());
create policy exercise_muscle_groups_write_entry on public.exercise_muscle_groups
  for all using (public.is_entry()) with check (public.is_entry());

-- training_sessions
create policy training_sessions_select_all on public.training_sessions
  for select using (public.is_authenticated());
create policy training_sessions_write_entry on public.training_sessions
  for all using (public.is_entry()) with check (public.is_entry());

-- session_entries
create policy session_entries_select_all on public.session_entries
  for select using (public.is_authenticated());
create policy session_entries_write_entry on public.session_entries
  for all using (public.is_entry()) with check (public.is_entry());
