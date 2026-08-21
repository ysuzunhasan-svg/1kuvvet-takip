import { supabase } from '@/lib/supabase';
import type { Player } from '@/types/database';

export async function listPlayers(activeOnly = true) {
  let query = supabase.from('players').select('*').order('full_name');
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data as Player[];
}

export async function getPlayer(id: string) {
  const { data, error } = await supabase.from('players').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Player;
}

export interface CreatePlayerInput {
  full_name: string;
  position?: string;
}

export async function createPlayer(input: CreatePlayerInput) {
  const { data, error } = await supabase
    .from('players')
    .insert({ full_name: input.full_name, position: input.position || null })
    .select()
    .single();
  if (error) throw error;
  return data as Player;
}
