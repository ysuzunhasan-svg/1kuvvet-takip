import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCard, getDbCardByKey, listAllDbCards, listDbCardsForType, type NewCardExercise } from './api';
import type { SessionType } from '@/types/database';

export function useDbCardsForType(sessionType: SessionType | null | undefined) {
  return useQuery({
    queryKey: ['db-cards', sessionType],
    queryFn: () => listDbCardsForType(sessionType as SessionType),
    enabled: !!sessionType,
  });
}

export function useAllDbCards() {
  return useQuery({
    queryKey: ['db-cards-all'],
    queryFn: listAllDbCards,
  });
}

export function useDbCardByKey(key: string | undefined) {
  return useQuery({
    queryKey: ['db-card', key],
    queryFn: () => getDbCardByKey(key as string),
    enabled: !!key,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionType,
      dayCode,
      exercises,
    }: {
      sessionType: SessionType;
      dayCode: string;
      exercises: NewCardExercise[];
    }) => createCard(sessionType, dayCode, exercises),
    onSuccess: (_key, variables) => {
      queryClient.invalidateQueries({ queryKey: ['db-cards', variables.sessionType] });
      queryClient.invalidateQueries({ queryKey: ['db-cards-all'] });
    },
  });
}
