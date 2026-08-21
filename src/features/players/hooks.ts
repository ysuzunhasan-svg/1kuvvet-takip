import { useQuery } from '@tanstack/react-query';

import { getPlayer, listPlayers } from './api';

export function usePlayers(activeOnly = true) {
  return useQuery({
    queryKey: ['players', { activeOnly }],
    queryFn: () => listPlayers(activeOnly),
  });
}

export function usePlayer(id: string | undefined) {
  return useQuery({
    queryKey: ['players', id],
    queryFn: () => getPlayer(id as string),
    enabled: !!id,
  });
}
