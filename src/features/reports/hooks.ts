import { useQuery } from '@tanstack/react-query';

import { type DateRange, getPlayerMuscleGroupVolume, getTeamMuscleGroupVolume } from './api';

export function usePlayerMuscleGroupVolume(playerId: string | undefined, range: DateRange) {
  return useQuery({
    queryKey: ['muscle-volume', 'player', playerId, range],
    queryFn: () => getPlayerMuscleGroupVolume(playerId as string, range),
    enabled: !!playerId,
  });
}

export function useTeamMuscleGroupVolume(range: DateRange) {
  return useQuery({
    queryKey: ['muscle-volume', 'team', range],
    queryFn: () => getTeamMuscleGroupVolume(range),
  });
}
