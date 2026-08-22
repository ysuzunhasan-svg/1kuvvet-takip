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
// katılan oyuncuların session_entries'ine otomatik yansıtır; katılmayanların
// bu session'a ait otomatik kayıtlarını temizler. Böylece kümülatif kas grubu
// raporu, ekstra bir hareket girişi yapılmadan kartın programından hesaplanır.
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

  const { data: cardExercises, error: cardError } = await supabase
    .from('card_exercises')
    .select('exercise_id, sets, reps_per_set')
    .eq('card_key', session.card_key);
  if (cardError) throw cardError;
  if (!cardExercises || cardExercises.length === 0) return;

  const { error: deleteError } = await supabase
    .from('session_entries')
    .delete()
    .eq('session_id', sessionId)
    .in('player_id', attendedPlayerIds);
  if (deleteError) throw deleteError;

  const entries = attendedPlayerIds.flatMap((playerId) =>
    cardExercises.map((ex) => ({
      session_id: sessionId,
      player_id: playerId,
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps_per_set: ex.reps_per_set,
    }))
  );
  const { error: insertError } = await supabase.from('session_entries').insert(entries);
  if (insertError) throw insertError;
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
