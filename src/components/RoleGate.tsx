import type { PropsWithChildren } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';

// Sadece UX içindir — gerçek yetkilendirme Supabase RLS'de.
export function RoleGate({ children }: PropsWithChildren) {
  const { isEntry } = useAuth();
  if (!isEntry) return null;
  return <>{children}</>;
}
