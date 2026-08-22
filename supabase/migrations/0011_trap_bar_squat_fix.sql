-- Trap Bar Squat hiç eklenmemişti (orijinal atlanan seed'den kalma eksiklik),
-- bu yüzden M-4 kartının kontrast bloğunda 9 yerine 8 hareket vardı.

insert into public.exercises (name, category)
values ('Trap Bar Squat', 'both')
on conflict do nothing;

insert into public.exercise_muscle_groups (exercise_id, muscle_group_id, is_primary)
select e.id, mg.id, x.is_primary
from (values
  ('Trap Bar Squat', 'quadriceps', true),
  ('Trap Bar Squat', 'glutes', false)
) as x(exercise_name, muscle_group_name, is_primary)
join public.exercises e on e.name = x.exercise_name
join public.muscle_groups mg on mg.name = x.muscle_group_name
on conflict (exercise_id, muscle_group_id) do nothing;

insert into public.card_exercises (card_key, exercise_id, sets, reps_per_set, sort_order)
select 'ptp-m4', e.id, 2, 3, 6
from public.exercises e
where e.name = 'Trap Bar Squat'
and not exists (
  select 1 from public.card_exercises ce
  where ce.card_key = 'ptp-m4' and ce.exercise_id = e.id
);
