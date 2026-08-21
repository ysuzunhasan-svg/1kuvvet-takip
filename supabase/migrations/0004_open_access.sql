-- Kuvvet Takip: hesap/giriş zorunluluğu kaldırıldı.
-- Link kimde varsa görüntüleyebilir ve kayıt girebilir; kimlik doğrulama yok.

drop policy if exists profiles_select_all on public.profiles;
drop policy if exists profiles_update_own_name on public.profiles;
drop policy if exists players_select_all on public.players;
drop policy if exists players_write_entry on public.players;
drop policy if exists muscle_groups_select_all on public.muscle_groups;
drop policy if exists muscle_groups_write_entry on public.muscle_groups;
drop policy if exists exercises_select_all on public.exercises;
drop policy if exists exercises_write_entry on public.exercises;
drop policy if exists exercise_muscle_groups_select_all on public.exercise_muscle_groups;
drop policy if exists exercise_muscle_groups_write_entry on public.exercise_muscle_groups;
drop policy if exists training_sessions_select_all on public.training_sessions;
drop policy if exists training_sessions_write_entry on public.training_sessions;
drop policy if exists session_entries_select_all on public.session_entries;
drop policy if exists session_entries_write_entry on public.session_entries;

create policy players_open_access on public.players for all using (true) with check (true);
create policy muscle_groups_open_access on public.muscle_groups for all using (true) with check (true);
create policy exercises_open_access on public.exercises for all using (true) with check (true);
create policy exercise_muscle_groups_open_access on public.exercise_muscle_groups for all using (true) with check (true);
create policy training_sessions_open_access on public.training_sessions for all using (true) with check (true);
create policy session_entries_open_access on public.session_entries for all using (true) with check (true);
