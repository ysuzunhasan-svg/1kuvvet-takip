import { supabase } from '@/lib/supabase';
import type { SessionType, TrainingSession } from '@/types/database';

export async function listSessions(sessionType?: SessionType) {
  let query = supabase
    .from('training_sessions')
    .select('*')
    .order('session_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (sessionType) query = query.eq('session_type', sessionType);
  const { data, error } = await query;
  if (error) throw error;
  return data as TrainingSession[];
}

export async function getSession(id: string) {
  const { data, error } = await supabase.from('training_sessions').select('*').eq('id', id).single();
  if (error) throw error;
  return data as TrainingSession;
}

export interface CreateSessionInput {
  session_date: string;
  session_type: SessionType;
  notes?: string;
}

export async function createSession(input: CreateSessionInput) {
  const { data, error } = await supabase.from('training_sessions').insert(input).select().single();
  if (error) throw error;
  return data as TrainingSession;
}
