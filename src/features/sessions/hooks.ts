import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createSession, type CreateSessionInput, getSession, listSessions } from './api';

export function useSessions() {
  return useQuery({ queryKey: ['sessions'], queryFn: listSessions });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => getSession(id as string),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSessionInput) => createSession(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });
}
