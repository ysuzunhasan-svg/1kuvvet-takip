import { supabase } from '@/lib/supabase';
import type { SessionType, TrainingSession } from '@/types/database';

export async function listSessions() {
  const { data, error } = await supabase
    .from('training_sessions')
    .select('*')
    .order('session_date', { ascending: false })
    .order('created_at', { ascending: false });
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
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('training_sessions')
    .insert({ ...input, created_by: userData.user?.id })
    .select()
    .single();
  if (error) throw error;
  return data as TrainingSession;
}
