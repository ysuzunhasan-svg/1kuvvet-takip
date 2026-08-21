-- Kuvvet Takip: kümülatif kas grubu hacmi view + RPC'ler, rol yönetimi RPC'si

create view public.entry_muscle_volume as
select
  se.id as entry_id,
  se.player_id,
  se.session_id,
  ts.session_date,
  ts.session_type,
  emg.muscle_group_id,
  mg.name as muscle_group_name,
  emg.is_primary,
  se.sets,
  se.reps_per_set,
  se.sets * se.reps_per_set as reps_volume,
  se.load_kg
from public.session_entries se
join public.training_sessions ts on ts.id = se.session_id
join public.exercise_muscle_groups emg on emg.exercise_id = se.exercise_id
join public.muscle_groups mg on mg.id = emg.muscle_group_id;

create function public.get_player_muscle_group_volume(
  p_player_id uuid,
  p_start_date date default null,
  p_end_date date default null
)
returns table (muscle_group_name text, total_sets bigint, total_volume bigint)
language sql
stable
as $$
  select
    muscle_group_name,
    sum(sets)::bigint as total_sets,
    sum(reps_volume)::bigint as total_volume
  from public.entry_muscle_volume
  where player_id = p_player_id
    and (p_start_date is null or session_date >= p_start_date)
    and (p_end_date is null or session_date <= p_end_date)
  group by muscle_group_name
  order by total_volume desc;
$$;

create function public.get_team_muscle_group_volume(
  p_start_date date default null,
  p_end_date date default null
)
returns table (muscle_group_name text, total_sets bigint, total_volume bigint, player_count bigint)
language sql
stable
as $$
  select
    muscle_group_name,
    sum(sets)::bigint as total_sets,
    sum(reps_volume)::bigint as total_volume,
    count(distinct player_id)::bigint as player_count
  from public.entry_muscle_volume
  where (p_start_date is null or session_date >= p_start_date)
    and (p_end_date is null or session_date <= p_end_date)
  group by muscle_group_name
  order by total_volume desc;
$$;

-- Rol yönetimi: profiles.role normal UPDATE ile değiştirilemez (bkz. 0002),
-- sadece bu RPC üzerinden — çağıran zaten 'entry' rolünde olmalı.
create function public.set_user_role(target_user_id uuid, new_role text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_entry() then
    raise exception 'yetkisiz';
  end if;
  if new_role not in ('entry', 'viewer') then
    raise exception 'gecersiz rol: %', new_role;
  end if;
  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

-- Kullanıcı listesi (admin ekranı için): auth.users normal sorguyla
-- erişilemez, bu yüzden security definer RPC ile email + profil bilgisini
-- birlikte döndürüyoruz. Sadece 'entry' rolü çağırabilir.
create function public.list_users()
returns table (id uuid, email text, full_name text, role text)
language sql
stable
security definer set search_path = public
as $$
  select u.id, u.email, p.full_name, p.role
  from auth.users u
  join public.profiles p on p.id = u.id
  where public.is_entry()
  order by p.full_name;
$$;
