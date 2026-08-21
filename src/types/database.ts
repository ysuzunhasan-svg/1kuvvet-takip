// El ile yazılmış tipler. Gerçek bir Supabase projesi bağlandıktan sonra
// `supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts`
// ile üretilip bu dosyanın yerine konabilir.

export type Role = 'entry' | 'viewer';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Player {
  id: string;
  full_name: string;
  position: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MuscleGroup {
  id: number;
  name: string;
}

export type ExerciseCategory = 'activation' | 'strength' | 'both';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory | null;
  is_active: boolean;
  created_at: string;
}

export type SessionType = 'ptp' | 'strength' | 'individual';

export interface TrainingSession {
  id: string;
  session_date: string;
  session_type: SessionType;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface SessionEntry {
  id: string;
  session_id: string;
  player_id: string;
  exercise_id: string;
  sets: number;
  reps_per_set: number;
  load_kg: number | null;
  created_by: string | null;
  created_at: string;
}

export interface MuscleGroupVolume {
  muscle_group_name: string;
  total_sets: number;
  total_volume: number;
}
