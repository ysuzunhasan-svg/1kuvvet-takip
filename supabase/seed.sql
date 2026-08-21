-- Kuvvet Takip: başlangıç kas grubu + hareket verisi
-- Not: kulüpten gelen aktivasyon/kuvvet kartlarına göre bu liste güncellenecek.

insert into public.muscle_groups (name) values
  ('quadriceps'),
  ('hamstrings'),
  ('glutes'),
  ('calves'),
  ('hip_adductors'),
  ('hip_abductors'),
  ('core'),
  ('lower_back'),
  ('chest'),
  ('upper_back'),
  ('shoulders'),
  ('biceps'),
  ('triceps')
on conflict (name) do nothing;

-- Aktivasyon (saha antrenmanı öncesi) hareketleri
with mg as (select id, name from public.muscle_groups)
insert into public.exercises (name, category)
values
  ('Band Yürüyüşü (Lateral)', 'activation'),
  ('Band Monster Walk', 'activation'),
  ('Glute Bridge', 'activation'),
  ('Copenhagen Plank', 'activation'),
  ('Nordic Curl (Yarım)', 'activation'),
  ('Plank', 'activation'),
  ('Side Plank', 'activation'),
  ('Bird Dog', 'activation')
on conflict do nothing;

-- Kuvvet (saha antrenmanı sonrası salon) hareketleri
insert into public.exercises (name, category)
values
  ('Back Squat', 'strength'),
  ('Bulgarian Split Squat', 'strength'),
  ('Romanian Deadlift', 'strength'),
  ('Trap Bar Deadlift', 'strength'),
  ('Hip Thrust', 'strength'),
  ('Bench Press', 'strength'),
  ('Barbell Row', 'strength'),
  ('Pull-Up', 'strength'),
  ('Overhead Press', 'strength'),
  ('Nordic Curl', 'strength'),
  ('Calf Raise', 'strength')
on conflict do nothing;

-- Hareket -> kas grubu eşlemeleri (isim üzerinden, id'ler generated identity olduğu için)
insert into public.exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
select e.id, mg.id, x.is_primary
from (values
  ('Band Yürüyüşü (Lateral)', 'hip_abductors', true),
  ('Band Monster Walk', 'hip_abductors', true),
  ('Band Monster Walk', 'glutes', false),
  ('Glute Bridge', 'glutes', true),
  ('Glute Bridge', 'hamstrings', false),
  ('Copenhagen Plank', 'hip_adductors', true),
  ('Copenhagen Plank', 'core', false),
  ('Nordic Curl (Yarım)', 'hamstrings', true),
  ('Plank', 'core', true),
  ('Side Plank', 'core', true),
  ('Side Plank', 'hip_abductors', false),
  ('Bird Dog', 'core', true),
  ('Bird Dog', 'lower_back', false),
  ('Back Squat', 'quadriceps', true),
  ('Back Squat', 'glutes', false),
  ('Bulgarian Split Squat', 'quadriceps', true),
  ('Bulgarian Split Squat', 'glutes', false),
  ('Romanian Deadlift', 'hamstrings', true),
  ('Romanian Deadlift', 'glutes', false),
  ('Romanian Deadlift', 'lower_back', false),
  ('Trap Bar Deadlift', 'quadriceps', true),
  ('Trap Bar Deadlift', 'glutes', false),
  ('Trap Bar Deadlift', 'hamstrings', false),
  ('Hip Thrust', 'glutes', true),
  ('Hip Thrust', 'hamstrings', false),
  ('Bench Press', 'chest', true),
  ('Bench Press', 'triceps', false),
  ('Bench Press', 'shoulders', false),
  ('Barbell Row', 'upper_back', true),
  ('Barbell Row', 'biceps', false),
  ('Pull-Up', 'upper_back', true),
  ('Pull-Up', 'biceps', false),
  ('Overhead Press', 'shoulders', true),
  ('Overhead Press', 'triceps', false),
  ('Nordic Curl', 'hamstrings', true),
  ('Calf Raise', 'calves', true)
) as x(exercise_name, muscle_group_name, is_primary)
join public.exercises e on e.name = x.exercise_name
join public.muscle_groups mg on mg.name = x.muscle_group_name
on conflict (exercise_id, muscle_group_id) do nothing;
