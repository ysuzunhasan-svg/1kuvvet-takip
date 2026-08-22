-- "set × tekrar" hacim sayısı (örn. 84, 12) bir teknik direktör için anlamsız
-- bir rakamdı. Rapor artık öncelikli olarak "kaç antrenmanda çalışıldı"
-- (session_count) döndürüyor — doğrudan anlaşılır bir sayı.

drop function if exists public.get_player_muscle_group_volume(uuid, date, date);
drop function if exists public.get_team_muscle_group_volume(date, date);

create function public.get_player_muscle_group_volume(
  p_player_id uuid,
  p_start_date date default null,
  p_end_date date default null
)
returns table (muscle_group_name text, session_count bigint, total_sets bigint, total_volume bigint)
language sql
stable
as $$
  select
    muscle_group_name,
    count(distinct session_id)::bigint as session_count,
    sum(sets)::bigint as total_sets,
    sum(reps_volume)::bigint as total_volume
  from public.entry_muscle_volume
  where player_id = p_player_id
    and (p_start_date is null or session_date >= p_start_date)
    and (p_end_date is null or session_date <= p_end_date)
  group by muscle_group_name
  order by session_count desc, total_volume desc;
$$;

create function public.get_team_muscle_group_volume(
  p_start_date date default null,
  p_end_date date default null
)
returns table (muscle_group_name text, session_count bigint, total_sets bigint, total_volume bigint, player_count bigint)
language sql
stable
as $$
  select
    muscle_group_name,
    count(distinct session_id)::bigint as session_count,
    sum(sets)::bigint as total_sets,
    sum(reps_volume)::bigint as total_volume,
    count(distinct player_id)::bigint as player_count
  from public.entry_muscle_volume
  where (p_start_date is null or session_date >= p_start_date)
    and (p_end_date is null or session_date <= p_end_date)
  group by muscle_group_name
  order by session_count desc, total_volume desc;
$$;
