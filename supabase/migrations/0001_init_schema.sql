-- Kuvvet Takip: temel şema
-- profiles, players, muscle_groups, exercises, exercise_muscle_groups,
-- training_sessions, session_entries

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'viewer' check (role in ('entry', 'viewer')),
  created_at timestamptz not null default now()
);

-- Her yeni auth.users kaydında otomatik profil oluştur (varsayılan rol: viewer)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── players ─────────────────────────────────────────────────────────────
create table public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── muscle_groups ───────────────────────────────────────────────────────
create table public.muscle_groups (
  id smallint generated always as identity primary key,
  name text not null unique
);

-- ── exercises ───────────────────────────────────────────────────────────
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('activation', 'strength', 'both')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── exercise_muscle_groups (many-to-many) ─────────────────────────────────
create table public.exercise_muscle_groups (
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  muscle_group_id smallint not null references public.muscle_groups (id) on delete cascade,
  is_primary boolean not null default true,
  primary key (exercise_id, muscle_group_id)
);

-- ── training_sessions ───────────────────────────────────────────────────
create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  session_date date not null default current_date,
  session_type text not null check (session_type in ('pre_activation', 'post_strength')),
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ── session_entries ─────────────────────────────────────────────────────
create table public.session_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions (id) on delete cascade,
  player_id uuid not null references public.players (id),
  exercise_id uuid not null references public.exercises (id),
  sets smallint not null check (sets > 0),
  reps_per_set smallint not null check (reps_per_set > 0),
  load_kg numeric(5, 2),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index session_entries_player_session_idx on public.session_entries (player_id, session_id);
create index session_entries_exercise_idx on public.session_entries (exercise_id);
create index training_sessions_date_idx on public.training_sessions (session_date);
