-- Kartların kendi hareket programını (kart görsellerinden çıkarılan set/tekrar
-- verileri) tanımlar. Bir oyuncu bir karta "katıldı" işaretlendiğinde, bu
-- program otomatik olarak session_entries'e yazılır ve kümülatif kas grubu
-- raporları (get_player_muscle_group_volume / get_team_muscle_group_volume)
-- bu veriyi kullanır.

-- Copenhagen Plank eksikti (orijinal seed atlanmıştı), şimdi ekleniyor.
insert into public.exercises (name, category)
values ('Copenhagen Plank', 'activation')
on conflict do nothing;

insert into public.exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
select e.id, mg.id, x.is_primary
from (values
  ('Copenhagen Plank', 'hip_adductors', true),
  ('Copenhagen Plank', 'core', false)
) as x(exercise_name, muscle_group_name, is_primary)
join public.exercises e on e.name = x.exercise_name
join public.muscle_groups mg on mg.name = x.muscle_group_name
on conflict (exercise_id, muscle_group_id) do nothing;

create table public.card_exercises (
  id uuid primary key default gen_random_uuid(),
  card_key text not null,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  sets smallint not null check (sets > 0),
  reps_per_set smallint not null check (reps_per_set > 0),
  sort_order smallint not null default 0
);

create index card_exercises_card_key_idx on public.card_exercises (card_key);

alter table public.card_exercises enable row level security;

create policy card_exercises_open_access on public.card_exercises
  for all using (true) with check (true);

insert into public.card_exercises (card_key, exercise_id, sets, reps_per_set, sort_order)
select x.card_key, e.id, x.sets, x.reps_per_set, x.sort_order
from (values
  ('ptp-m2-aktivasyon', 'Lateral Iso Push Wall', 3, 7, 1),
  ('ptp-m2-aktivasyon', 'Cable Palloff Press', 2, 6, 2),
  ('ptp-m2-aktivasyon', 'Medball Rotational Throw', 2, 6, 3),
  ('ptp-m2-aktivasyon', 'Band Resisted Crossover Step', 2, 3, 4),
  ('ptp-m2-aktivasyon', 'Lateral Bound', 1, 4, 5),

  ('ptp-m4', 'Ankle Iso Push Wall', 3, 7, 1),
  ('ptp-m4', 'Iso Split Squat Pull', 3, 6, 2),
  ('ptp-m4', 'Copenhagen Plank', 2, 15, 3),
  ('ptp-m4', 'Lateral Step Up Knee Drive', 2, 4, 4),
  ('ptp-m4', 'MB Split Squat Drop Catch', 3, 3, 5),
  ('ptp-m4', 'Trap Bar Squat', 2, 3, 6),
  ('ptp-m4', 'Dumbbell Squat Jump', 2, 3, 7),
  ('ptp-m4', 'CMJ', 2, 3, 8),
  ('ptp-m4', 'Band Assisted Jump', 2, 3, 9),

  ('ptp-md3-v3', 'Single Leg Hip Bridge with Foam Roller', 2, 10, 1),
  ('ptp-md3-v3', 'Standing Hip Flexion Iso Hold w/ KB', 3, 8, 2),
  ('ptp-md3-v3', 'Single Leg RDL to Plate Punch', 2, 4, 3),
  ('ptp-md3-v3', 'Banded Acceleration', 2, 3, 4),
  ('ptp-md3-v3', 'Banded Lean Pogo', 2, 8, 5)
) as x(card_key, exercise_name, sets, reps_per_set, sort_order)
join public.exercises e on e.name = x.exercise_name;
