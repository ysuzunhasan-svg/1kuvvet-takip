import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { listUsers, setUserRole } from './api';
import type { Role } from '@/types/database';

export function useUsers() {
  return useQuery({ queryKey: ['admin-users'], queryFn: listUsers });
}

export function useSetUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => setUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}
