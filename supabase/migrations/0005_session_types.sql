-- Antrenman tiplerini 2'den 3'e çıkar: PTP (aktivasyon), Kuvvet, Bireysel.

alter table public.training_sessions drop constraint training_sessions_session_type_check;

update public.training_sessions set session_type = 'ptp' where session_type = 'pre_activation';
update public.training_sessions set session_type = 'strength' where session_type = 'post_strength';

alter table public.training_sessions add constraint training_sessions_session_type_check
  check (session_type in ('ptp', 'strength', 'individual'));
