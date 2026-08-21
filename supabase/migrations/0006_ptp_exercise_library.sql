-- İstanbulspor PTP kartlarından (M-2 Aktivasyon, PTP M-4, PTP MD-3 v3) gerçek hareket kütüphanesi.
-- Not: kartlardaki serbest ısınma blokları (bisiklet, mobilite, miniband aktivasyonu)
-- sayılabilir set/tekrar içermediği için hareket olarak eklenmedi.

insert into public.muscle_groups (name) values ('hip_flexors')
on conflict (name) do nothing;

-- Trap Bar Squat, kontrast güç bloğunda PTP içinde de kullanılıyor -> hem strength hem ptp'de görünsün.
update public.exercises set category = 'both' where name = 'Trap Bar Squat';

insert into public.exercises (name, category)
values
  ('Lateral Iso Push Wall', 'activation'),
  ('Cable Palloff Press', 'activation'),
  ('Medball Rotational Throw', 'activation'),
  ('Band Resisted Crossover Step', 'activation'),
  ('Lateral Bound', 'activation'),
  ('Ankle Iso Push Wall', 'activation'),
  ('Iso Split Squat Pull', 'activation'),
  ('Lateral Step Up Knee Drive', 'activation'),
  ('MB Split Squat Drop Catch', 'activation'),
  ('Dumbbell Squat Jump', 'both'),
  ('CMJ', 'both'),
  ('Band Assisted Jump', 'both'),
  ('Single Leg Hip Bridge with Foam Roller', 'activation'),
  ('Standing Hip Flexion Iso Hold w/ KB', 'activation'),
  ('Single Leg RDL to Plate Punch', 'activation'),
  ('Banded Acceleration', 'activation'),
  ('Banded Lean Pogo', 'activation')
on conflict do nothing;

insert into public.exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
select e.id, mg.id, x.is_primary
from (values
  ('Lateral Iso Push Wall', 'hip_abductors', true),
  ('Lateral Iso Push Wall', 'core', false),
  ('Cable Palloff Press', 'core', true),
  ('Medball Rotational Throw', 'core', true),
  ('Medball Rotational Throw', 'shoulders', false),
  ('Band Resisted Crossover Step', 'hip_abductors', true),
  ('Band Resisted Crossover Step', 'glutes', false),
  ('Lateral Bound', 'glutes', true),
  ('Lateral Bound', 'quadriceps', false),
  ('Lateral Bound', 'calves', false),
  ('Ankle Iso Push Wall', 'calves', true),
  ('Iso Split Squat Pull', 'quadriceps', true),
  ('Iso Split Squat Pull', 'glutes', false),
  ('Lateral Step Up Knee Drive', 'quadriceps', true),
  ('Lateral Step Up Knee Drive', 'glutes', false),
  ('Lateral Step Up Knee Drive', 'hip_abductors', false),
  ('MB Split Squat Drop Catch', 'quadriceps', true),
  ('MB Split Squat Drop Catch', 'glutes', false),
  ('MB Split Squat Drop Catch', 'core', false),
  ('Dumbbell Squat Jump', 'quadriceps', true),
  ('Dumbbell Squat Jump', 'glutes', false),
  ('Dumbbell Squat Jump', 'calves', false),
  ('CMJ', 'quadriceps', true),
  ('CMJ', 'glutes', false),
  ('CMJ', 'calves', false),
  ('Band Assisted Jump', 'quadriceps', true),
  ('Band Assisted Jump', 'glutes', false),
  ('Band Assisted Jump', 'calves', false),
  ('Single Leg Hip Bridge with Foam Roller', 'glutes', true),
  ('Single Leg Hip Bridge with Foam Roller', 'hamstrings', false),
  ('Standing Hip Flexion Iso Hold w/ KB', 'hip_flexors', true),
  ('Single Leg RDL to Plate Punch', 'hamstrings', true),
  ('Single Leg RDL to Plate Punch', 'glutes', false),
  ('Single Leg RDL to Plate Punch', 'core', false),
  ('Banded Acceleration', 'hip_flexors', true),
  ('Banded Acceleration', 'glutes', false),
  ('Banded Acceleration', 'quadriceps', false),
  ('Banded Lean Pogo', 'calves', true),
  ('Banded Lean Pogo', 'hip_flexors', false)
) as x(exercise_name, muscle_group_name, is_primary)
join public.exercises e on e.name = x.exercise_name
join public.muscle_groups mg on mg.name = x.muscle_group_name
on conflict (exercise_id, muscle_group_id) do nothing;
