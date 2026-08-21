import { supabase } from '@/lib/supabase';
import type { Exercise, ExerciseCategory } from '@/types/database';

export interface ExerciseWithMuscleGroups extends Exercise {
  exercise_muscle_groups: {
    muscle_group_id: number;
    is_primary: boolean;
    muscle_groups: { name: string };
  }[];
}

export async function listExercises(category?: ExerciseCategory) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*, exercise_muscle_groups(muscle_group_id, is_primary, muscle_groups(name))')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  const all = (data ?? []) as unknown as ExerciseWithMuscleGroups[];
  if (!category) return all;
  return all.filter((e) => e.category === category || e.category === 'both' || e.category === null);
}
