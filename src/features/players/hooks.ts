import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createPlayer, type CreatePlayerInput, getPlayer, listPlayers } from './api';

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

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePlayerInput) => createPlayer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  });
}
