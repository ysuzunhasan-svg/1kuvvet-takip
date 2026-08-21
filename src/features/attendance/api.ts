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
