import type { SessionType } from '@/types/database';

export const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  ptp: 'PTP',
  strength: 'Kuvvet',
  individual: 'Bireysel',
};

export const SESSION_TYPES: SessionType[] = ['ptp', 'strength', 'individual'];
