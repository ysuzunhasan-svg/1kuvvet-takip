import { supabase } from '@/lib/supabase';
import type { SessionType, TrainingSession } from '@/types/database';

export async function getOrCreateCardSession(sessionType: SessionType, cardKey: string, date: string) {
  const { data: existing, error: selectError } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('session_type', sessionType)
    .eq('card_key', cardKey)
    .eq('session_date', date)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing) return existing as TrainingSession;

  const { data: created, error: insertError } = await supabase
    .from('training_sessions')
    .insert({ session_type: sessionType, card_key: cardKey, session_date: date })
    .select()
    .single();
  if (insertError) throw insertError;
  return created as TrainingSession;
}

export interface AttendanceRow {
  player_id: string;
  attended: boolean;
}

export async function listAttendance(sessionId: string) {
  const { data, error } = await supabase
    .from('session_attendance')
    .select('player_id, attended')
    .eq('session_id', sessionId);
  if (error) throw error;
  return (data ?? []) as AttendanceRow[];
}

export async function setAttendance(sessionId: string, playerId: string, attended: boolean) {
  const { error } = await supabase
    .from('session_attendance')
    .upsert({ session_id: sessionId, player_id: playerId, attended }, { onConflict: 'session_id,player_id' });
  if (error) throw error;
}

export async function setAttendanceBulk(sessionId: string, rows: { playerId: string; attended: boolean }[]) {
  const payload = rows.map((row) => ({ session_id: sessionId, player_id: row.playerId, attended: row.attended }));
  const { error } = await supabase
    .from('session_attendance')
    .upsert(payload, { onConflict: 'session_id,player_id' });
  if (error) throw error;

  await syncEntriesWithCardProgram(sessionId, rows);
}

// Katılım kaydedildiğinde, kartın kendi hareket programını (card_exercises)
// henüz hiç hareket kaydı olmayan katılan oyunculara otomatik uygular;
// katılmayanların bu session'a ait kayıtlarını temizler. Zaten hareket kaydı
// olan (elle düzenlenmiş olabilecek) oyuncuların kayıtlarına dokunmaz — aksi
// halde her "Kaydet" basışında ağırlık/özel hareket düzenlemeleri silinirdi.
async function syncEntriesWithCardProgram(sessionId: string, rows: { playerId: string; attended: boolean }[]) {
  const attendedPlayerIds = rows.filter((r) => r.attended).map((r) => r.playerId);
  const notAttendedPlayerIds = rows.filter((r) => !r.attended).map((r) => r.playerId);

  if (notAttendedPlayerIds.length > 0) {
    const { error } = await supabase
      .from('session_entries')
      .delete()
      .eq('session_id', sessionId)
      .in('player_id', notAttendedPlayerIds);
    if (error) throw error;
  }

  if (attendedPlayerIds.length === 0) return;

  const { data: session, error: sessionError } = await supabase
    .from('training_sessions')
    .select('card_key')
    .eq('id', sessionId)
    .single();
  if (sessionError) throw sessionError;
  if (!session.card_key) return;

  const { data: existingRows, error: existingError } = await supabase
    .from('session_entries')
    .select('player_id')
    .eq('session_id', sessionId)
    .in('player_id', attendedPlayerIds);
  if (existingError) throw existingError;
  const existingPlayerIds = new Set((existingRows ?? []).map((r) => r.player_id));
  const playersNeedingTemplate = attendedPlayerIds.filter((id) => !existingPlayerIds.has(id));
  if (playersNeedingTemplate.length === 0) return;

  const { data: cardExercises, error: cardError } = await supabase
    .from('card_exercises')
    .select('exercise_id, sets, reps_per_set, default_weight_kg')
    .eq('card_key', session.card_key);
  if (cardError) throw cardError;
  if (!cardExercises || cardExercises.length === 0) return;

  const entries = playersNeedingTemplate.flatMap((playerId) =>
    cardExercises.map((ex) => ({
      session_id: sessionId,
      player_id: playerId,
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps_per_set: ex.reps_per_set,
      load_kg: ex.default_weight_kg,
    }))
  );
  const { error: insertError } = await supabase.from('session_entries').insert(entries);
  if (insertError) throw insertError;
}

export interface CardExerciseRow {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps_per_set: number;
  sort_order: number;
  default_weight_kg: number | null;
}

// Kartın referans programı — kart ekranında görsel yerine gösterilen hareket
// listesi. Buradaki ağırlık, takımın o hareket için varsayılan/hedef
// ağırlığıdır; bir oyuncu antrenmana ilk katıldığında bu değer session_entries'e
// kopyalanır (oyuncu bazında sonra değiştirilebilir, kartın varsayılanı sabit kalır).
export async function listCardExercises(cardKey: string) {
  const { data, error } = await supabase
    .from('card_exercises')
    .select('id, exercise_id, sets, reps_per_set, sort_order, default_weight_kg, exercises(name)')
    .eq('card_key', cardKey)
    .order('sort_order');
  if (error) throw error;
  return (
    (data ?? []) as unknown as {
      id: string;
      exercise_id: string;
      sets: number;
      reps_per_set: number;
      sort_order: number;
      default_weight_kg: number | null;
      exercises: { name: string } | null;
    }[]
  ).map((row) => ({
    id: row.id,
    exercise_id: row.exercise_id,
    exercise_name: row.exercises?.name ?? '',
    sets: row.sets,
    reps_per_set: row.reps_per_set,
    sort_order: row.sort_order,
    default_weight_kg: row.default_weight_kg,
  })) as CardExerciseRow[];
}

export async function updateCardExerciseDefaultWeight(cardExerciseId: string, weightKg: number | null) {
  const { error } = await supabase
    .from('card_exercises')
    .update({ default_weight_kg: weightKg })
    .eq('id', cardExerciseId);
  if (error) throw error;
}

export interface ExerciseOption {
  id: string;
  name: string;
}

export async function listExercisesLibrary() {
  const { data, error } = await supabase.from('exercises').select('id, name').eq('is_active', true).order('name');
  if (error) throw error;
  return (data ?? []) as ExerciseOption[];
}

export interface MuscleGroupOption {
  id: number;
  name: string;
}

export async function listMuscleGroups() {
  const { data, error } = await supabase.from('muscle_groups').select('id, name');
  if (error) throw error;
  return (data ?? []) as MuscleGroupOption[];
}

// Kütüphaneye yeni bir hareket ekler ve seçilen kas gruplarıyla eşler (ilk
// seçilen birincil kas grubu sayılır). Böylece kütüphane sonradan başka
// kaynaklardan (kitap, koç bilgisi) beslenebilir ve rapor bunu otomatik yansıtır.
export async function createExercise(name: string, muscleGroupIds: number[]) {
  const { data: exercise, error } = await supabase
    .from('exercises')
    .insert({ name, category: 'strength' })
    .select('id, name')
    .single();
  if (error) throw error;

  if (muscleGroupIds.length > 0) {
    const rows = muscleGroupIds.map((muscleGroupId, index) => ({
      exercise_id: exercise.id,
      muscle_group_id: muscleGroupId,
      is_primary: index === 0,
    }));
    const { error: mgError } = await supabase.from('exercise_muscle_groups').insert(rows);
    if (mgError) throw mgError;
  }
  return exercise as ExerciseOption;
}

export interface PlayerSessionEntry {
  id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps_per_set: number;
  load_kg: number | null;
}

// Bir oyuncunun bu session'daki hareket listesi — kartın standart programıyla
// başlar ama oyuncuya özel eklenen/çıkarılan hareketleri de yansıtır (o gün
// farklı bir program yapmış olabilir).
export async function listPlayerSessionEntries(sessionId: string, playerId: string) {
  const { data, error } = await supabase
    .from('session_entries')
    .select('id, exercise_id, sets, reps_per_set, load_kg, exercises(name)')
    .eq('session_id', sessionId)
    .eq('player_id', playerId)
    .order('created_at');
  if (error) throw error;
  return ((data ?? []) as unknown as { id: string; exercise_id: string; sets: number; reps_per_set: number; load_kg: number | null; exercises: { name: string } | null }[]).map(
    (row) => ({
      id: row.id,
      exercise_id: row.exercise_id,
      exercise_name: row.exercises?.name ?? '',
      sets: row.sets,
      reps_per_set: row.reps_per_set,
      load_kg: row.load_kg,
    })
  ) as PlayerSessionEntry[];
}

export async function addPlayerSessionEntry(sessionId: string, playerId: string, exerciseId: string) {
  const { error } = await supabase
    .from('session_entries')
    .insert({ session_id: sessionId, player_id: playerId, exercise_id: exerciseId, sets: 3, reps_per_set: 10 });
  if (error) throw error;
}

export async function removeSessionEntry(entryId: string) {
  const { error } = await supabase.from('session_entries').delete().eq('id', entryId);
  if (error) throw error;
}

export async function updateEntryWeight(entryId: string, weightKg: number | null) {
  const { error } = await supabase.from('session_entries').update({ load_kg: weightKg }).eq('id', entryId);
  if (error) throw error;
}

export interface PlayerRecentWeight {
  exercise_id: string;
  exercise_name: string;
  load_kg: number;
  session_date: string;
}

// Oyuncunun her hareket için en son kaydedilen ağırlığı — oyuncu raporunda
// gösterilir.
export async function listPlayerRecentWeights(playerId: string) {
  const { data, error } = await supabase
    .from('session_entries')
    .select('exercise_id, load_kg, exercises(name), training_sessions(session_date)')
    .eq('player_id', playerId)
    .not('load_kg', 'is', null)
    .order('session_date', { referencedTable: 'training_sessions', ascending: false })
    .limit(200);
  if (error) throw error;
  const rows = (data ?? []) as unknown as {
    exercise_id: string;
    load_kg: number;
    exercises: { name: string } | null;
    training_sessions: { session_date: string } | null;
  }[];
  const byExercise = new Map<string, PlayerRecentWeight>();
  rows.forEach((row) => {
    if (!row.training_sessions || byExercise.has(row.exercise_id)) return;
    byExercise.set(row.exercise_id, {
      exercise_id: row.exercise_id,
      exercise_name: row.exercises?.name ?? '',
      load_kg: row.load_kg,
      session_date: row.training_sessions.session_date,
    });
  });
  return Array.from(byExercise.values()).sort((a, b) => a.exercise_name.localeCompare(b.exercise_name));
}

export async function deleteSession(sessionId: string) {
  const { error } = await supabase.from('training_sessions').delete().eq('id', sessionId);
  if (error) throw error;
}

export interface AttendedSession {
  session_date: string;
  session_type: SessionType;
}

export async function listPlayerAttendedSessions(playerId: string) {
  const { data, error } = await supabase
    .from('session_attendance')
    .select('training_sessions(session_date, session_type)')
    .eq('player_id', playerId)
    .eq('attended', true);
  if (error) throw error;
  return ((data ?? []) as unknown as { training_sessions: AttendedSession | null }[])
    .map((row) => row.training_sessions)
    .filter((s): s is AttendedSession => s !== null);
}

export interface SessionDateMarker {
  session_date: string;
  session_type: SessionType;
  card_key: string | null;
}

export async function listSessionDatesInRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('session_date, session_type, card_key')
    .gte('session_date', startDate)
    .lte('session_date', endDate);
  if (error) throw error;
  return (data ?? []) as SessionDateMarker[];
}

export interface SessionWithAttendanceCount extends TrainingSession {
  attendedCount: number;
}

export async function listSessionsForDate(date: string) {
  const { data: sessions, error } = await supabase.from('training_sessions').select('*').eq('session_date', date);
  if (error) throw error;
  const sessionRows = (sessions ?? []) as TrainingSession[];
  if (sessionRows.length === 0) return [];

  const sessionIds = sessionRows.map((s) => s.id);
  const { data: attendanceRows, error: attendanceError } = await supabase
    .from('session_attendance')
    .select('session_id')
    .in('session_id', sessionIds)
    .eq('attended', true);
  if (attendanceError) throw attendanceError;

  return sessionRows.map((s) => ({
    ...s,
    attendedCount: (attendanceRows ?? []).filter((a) => a.session_id === s.id).length,
  })) as SessionWithAttendanceCount[];
}
