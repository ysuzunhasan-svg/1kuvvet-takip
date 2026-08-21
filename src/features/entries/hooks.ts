import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createEntries, listEntriesForPlayer, listEntriesForSession, type NewEntryRow } from './api';

export function useSessionEntries(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-entries', sessionId],
    queryFn: () => listEntriesForSession(sessionId as string),
    enabled: !!sessionId,
  });
}

export function usePlayerEntries(playerId: string | undefined) {
  return useQuery({
    queryKey: ['player-entries', playerId],
    queryFn: () => listEntriesForPlayer(playerId as string),
    enabled: !!playerId,
  });
}

export function useCreateEntries(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, rows }: { playerId: string; rows: NewEntryRow[] }) =>
      createEntries(sessionId, playerId, rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-entries', sessionId] });
    },
  });
}
