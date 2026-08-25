import type { SessionType } from '@/types/database';

export interface TrainingCard {
  key: string;
  sessionType: SessionType;
  dayCode: string;
  title: string;
  // Görsel henüz gelmediyse undefined olabilir (örn. Kuvvet kartları) — kart
  // yine de listede görünür, tarih/katılım girişi görsel olmadan da çalışır.
  image?: number;
}

export const TRAINING_CARDS: TrainingCard[] = [
  {
    key: 'ptp-m2-aktivasyon',
    sessionType: 'ptp',
    dayCode: 'M-2',
    title: 'M-2 · Aktivasyon',
    image: require('@/assets/cards/ptp-m2-aktivasyon.png'),
  },
  {
    key: 'ptp-m4',
    sessionType: 'ptp',
    dayCode: 'M-4',
    title: 'M-4 · Pre Training Preparation',
    image: require('@/assets/cards/ptp-m4.png'),
  },
  {
    key: 'ptp-md3-v3',
    sessionType: 'ptp',
    dayCode: 'MD-3',
    title: 'MD-3 · Pre Training Preparation',
    image: require('@/assets/cards/ptp-md3-v3.png'),
  },
  {
    key: 'strength-ust-vucut',
    sessionType: 'strength',
    dayCode: 'Üst Vücut',
    title: 'Üst Vücut Kuvvet',
  },
  {
    key: 'strength-alt-vucut',
    sessionType: 'strength',
    dayCode: 'Alt Vücut',
    title: 'Alt Vücut Kuvvet',
  },
];

export function getCardsForType(sessionType: SessionType): TrainingCard[] {
  return TRAINING_CARDS.filter((card) => card.sessionType === sessionType);
}

export function getCardByKey(key: string): TrainingCard | undefined {
  return TRAINING_CARDS.find((card) => card.key === key);
}
