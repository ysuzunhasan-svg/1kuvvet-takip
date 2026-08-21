import { supabase } from '@/lib/supabase';
import type { Role } from '@/types/database';

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: Role;
}

export async function listUsers() {
  const { data, error } = await supabase.rpc('list_users');
  if (error) throw error;
  return (data ?? []) as UserRow[];
}

export async function setUserRole(userId: string, role: Role) {
  const { error } = await supabase.rpc('set_user_role', { target_user_id: userId, new_role: role });
  if (error) throw error;
}
