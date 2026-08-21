import { supabase } from '@/lib/supabase';
import type { SessionEntry } from '@/types/database';

export interface NewEntryRow {
  exercise_id: string;
  sets: number;
  reps_per_set: number;
  load_kg?: number | null;
}

export interface SessionEntryWithNames extends SessionEntry {
  players: { full_name: string };
  exercises: { name: string };
}

export async function listEntriesForSession(sessionId: string) {
  const { data, error } = await supabase
    .from('session_entries')
    .select('*, players(full_name), exercises(name)')
    .eq('session_id', sessionId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as unknown as SessionEntryWithNames[];
}

export interface PlayerEntryWithSession extends SessionEntry {
  training_sessions: { session_date: string; session_type: string };
  exercises: { name: string };
}

export async function listEntriesForPlayer(playerId: string) {
  const { data, error } = await supabase
    .from('session_entries')
    .select('*, training_sessions(session_date, session_type), exercises(name)')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PlayerEntryWithSession[];
}

export async function createEntries(sessionId: string, playerId: string, rows: NewEntryRow[]) {
  const payload = rows.map((row) => ({
    session_id: sessionId,
    player_id: playerId,
    exercise_id: row.exercise_id,
    sets: row.sets,
    reps_per_set: row.reps_per_set,
    load_kg: row.load_kg ?? null,
  }));
  const { error } = await supabase.from('session_entries').insert(payload);
  if (error) throw error;
}
