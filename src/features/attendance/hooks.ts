import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getOrCreateCardSession, listAttendance, setAttendance } from './api';
import type { SessionType } from '@/types/database';

export function useCardSession(sessionType: SessionType, cardKey: string, date: string) {
  return useQuery({
    queryKey: ['card-session', sessionType, cardKey, date],
    queryFn: () => getOrCreateCardSession(sessionType, cardKey, date),
  });
}

export function useAttendance(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', sessionId],
    queryFn: () => listAttendance(sessionId as string),
    enabled: !!sessionId,
  });
}

export function useSetAttendance(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, attended }: { playerId: string; attended: boolean }) =>
      setAttendance(sessionId, playerId, attended),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance', sessionId] }),
  });
}
