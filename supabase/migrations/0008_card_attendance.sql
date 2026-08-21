-- Kart bazlı antrenman akışı: her training_session artık belirli bir görsel
-- karta (card_key) bağlanabiliyor, ve oyuncu katılımı (geldi/gelmedi) ayrı
-- bir tabloda tutuluyor.

alter table public.training_sessions add column card_key text;

create index training_sessions_card_lookup_idx
  on public.training_sessions (session_type, card_key, session_date);

create table public.session_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  attended boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, player_id)
);

alter table public.session_attendance enable row level security;

create policy session_attendance_open_access on public.session_attendance
  for all using (true) with check (true);
