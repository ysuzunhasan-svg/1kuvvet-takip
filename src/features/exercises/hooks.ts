import { useQuery } from '@tanstack/react-query';

import { listExercises } from './api';
import type { ExerciseCategory } from '@/types/database';

export function useExercises(category?: ExerciseCategory) {
  return useQuery({
    queryKey: ['exercises', category ?? 'all'],
    queryFn: () => listExercises(category),
  });
}
