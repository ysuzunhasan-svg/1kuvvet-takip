-- Temel kas grubu listesi hiç eklenmemişti (ilk seed bilinçli olarak atlanmıştı),
-- bu yüzden 0006'daki exercise_muscle_groups eşlemelerinin çoğu sessizce boşa düştü.
-- Bu migration eksik kas gruplarını ekleyip aynı eşlemeleri tekrar (idempotent) uygular.

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
  ('Single Leg RDL to Plate Punch', 'hamstrings', true),
  ('Single Leg RDL to Plate Punch', 'glutes', false),
  ('Single Leg RDL to Plate Punch', 'core', false),
  ('Banded Acceleration', 'glutes', false),
  ('Banded Acceleration', 'quadriceps', false),
  ('Banded Lean Pogo', 'calves', true)
) as x(exercise_name, muscle_group_name, is_primary)
join public.exercises e on e.name = x.exercise_name
join public.muscle_groups mg on mg.name = x.muscle_group_name
on conflict (exercise_id, muscle_group_id) do nothing;
