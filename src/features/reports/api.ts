import { supabase } from '@/lib/supabase';
import type { MuscleGroupVolume } from '@/types/database';

export interface DateRange {
  start?: string;
  end?: string;
}

export async function getPlayerMuscleGroupVolume(playerId: string, range: DateRange) {
  const { data, error } = await supabase.rpc('get_player_muscle_group_volume', {
    p_player_id: playerId,
    p_start_date: range.start ?? null,
    p_end_date: range.end ?? null,
  });
  if (error) throw error;
  return (data ?? []) as MuscleGroupVolume[];
}

export interface TeamMuscleGroupVolume extends MuscleGroupVolume {
  player_count: number;
}

export async function getTeamMuscleGroupVolume(range: DateRange) {
  const { data, error } = await supabase.rpc('get_team_muscle_group_volume', {
    p_start_date: range.start ?? null,
    p_end_date: range.end ?? null,
  });
  if (error) throw error;
  return (data ?? []) as TeamMuscleGroupVolume[];
}
