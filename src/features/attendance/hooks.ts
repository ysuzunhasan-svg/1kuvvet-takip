import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getOrCreateCardSession,
  listAttendance,
  listPlayerAttendedSessions,
  setAttendanceBulk,
} from './api';
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

export function useSaveAttendance(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: { playerId: string; attended: boolean }[]) => setAttendanceBulk(sessionId, rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['player-attended-sessions'] });
    },
  });
}

export function usePlayerAttendedSessions(playerId: string | undefined) {
  return useQuery({
    queryKey: ['player-attended-sessions', playerId],
    queryFn: () => listPlayerAttendedSessions(playerId as string),
    enabled: !!playerId,
  });
}
