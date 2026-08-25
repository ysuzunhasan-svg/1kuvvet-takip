-- Antrenman kartları artık uygulamadan da (statik listeye ek olarak)
-- oluşturulabilir. Var olan 3 PTP kartı (görselleri olan) hâlâ
-- src/constants/cards.ts içinde statik olarak tanımlı; bu tablo kullanıcının
-- Antrenmanlar ekranından oluşturduğu yeni kartları tutar (görselsiz,
-- sadece hareket listesiyle).

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  session_type text not null check (session_type in ('ptp', 'strength', 'individual')),
  day_code text not null,
  title text not null,
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

create policy cards_open_access on public.cards for all using (true) with check (true);
