import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addCardExercise,
  addPlayerSessionEntry,
  createExercise,
  deleteSession,
  getOrCreateCardSession,
  listAttendance,
  listCardExercises,
  listExercisesLibrary,
  listMuscleGroups,
  listPlayerAttendedSessions,
  listPlayerRecentWeights,
  listPlayerSessionEntries,
  listSessionDatesInRange,
  listSessionsForDate,
  removeCardExercise,
  removeSessionEntry,
  setAttendanceBulk,
  updateCardExerciseDefaultWeight,
  updateCardExerciseExercise,
  updateEntryWeight,
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
      queryClient.invalidateQueries({ queryKey: ['sessions-for-date'] });
      queryClient.invalidateQueries({ queryKey: ['session-dates'] });
      queryClient.invalidateQueries({ queryKey: ['muscle-volume'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions-for-date'] });
      queryClient.invalidateQueries({ queryKey: ['session-dates'] });
      queryClient.invalidateQueries({ queryKey: ['player-attended-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['muscle-volume'] });
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

export function useSessionDatesInRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['session-dates', startDate, endDate],
    queryFn: () => listSessionDatesInRange(startDate, endDate),
  });
}

export function useSessionsForDate(date: string | null) {
  return useQuery({
    queryKey: ['sessions-for-date', date],
    queryFn: () => listSessionsForDate(date as string),
    enabled: !!date,
  });
}

export function useCardExercises(cardKey: string | undefined) {
  return useQuery({
    queryKey: ['card-exercises', cardKey],
    queryFn: () => listCardExercises(cardKey as string),
    enabled: !!cardKey,
  });
}

export function useUpdateCardExerciseDefaultWeight(cardKey: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardExerciseId, weightKg }: { cardExerciseId: string; weightKg: number | null }) =>
      updateCardExerciseDefaultWeight(cardExerciseId, weightKg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-exercises', cardKey] });
    },
  });
}

export function useUpdateCardExerciseExercise(cardKey: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardExerciseId, exerciseId }: { cardExerciseId: string; exerciseId: string }) =>
      updateCardExerciseExercise(cardExerciseId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-exercises', cardKey] });
      queryClient.invalidateQueries({ queryKey: ['muscle-volume'] });
    },
  });
}

export function useRemoveCardExercise(cardKey: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardExerciseId: string) => removeCardExercise(cardExerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-exercises', cardKey] });
      queryClient.invalidateQueries({ queryKey: ['muscle-volume'] });
    },
  });
}

export function useAddCardExercise(cardKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, sortOrder }: { exerciseId: string; sortOrder: number }) =>
      addCardExercise(cardKey, exerciseId, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-exercises', cardKey] });
    },
  });
}

export function useExercisesLibrary() {
  return useQuery({
    queryKey: ['exercises-library'],
    queryFn: listExercisesLibrary,
  });
}

export function useMuscleGroups() {
  return useQuery({
    queryKey: ['muscle-groups'],
    queryFn: listMuscleGroups,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, muscleGroupIds }: { name: string; muscleGroupIds: number[] }) =>
      createExercise(name, muscleGroupIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises-library'] });
    },
  });
}

export function usePlayerSessionEntries(sessionId: string | undefined, playerId: string | undefined) {
  return useQuery({
    queryKey: ['player-session-entries', sessionId, playerId],
    queryFn: () => listPlayerSessionEntries(sessionId as string, playerId as string),
    enabled: !!sessionId && !!playerId,
  });
}

export function useAddPlayerSessionEntry(sessionId: string, playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => addPlayerSessionEntry(sessionId, playerId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-session-entries', sessionId, playerId] });
      queryClient.invalidateQueries({ queryKey: ['muscle-volume'] });
    },
  });
}

export function useRemoveSessionEntry(sessionId: string, playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => removeSessionEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-session-entries', sessionId, playerId] });
      queryClient.invalidateQueries({ queryKey: ['muscle-volume'] });
    },
  });
}

export function useUpdateEntryWeight(sessionId: string, playerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, weightKg }: { entryId: string; weightKg: number | null }) =>
      updateEntryWeight(entryId, weightKg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-session-entries', sessionId, playerId] });
    },
  });
}

export function usePlayerRecentWeights(playerId: string | undefined) {
  return useQuery({
    queryKey: ['player-recent-weights', playerId],
    queryFn: () => listPlayerRecentWeights(playerId as string),
    enabled: !!playerId,
  });
}
