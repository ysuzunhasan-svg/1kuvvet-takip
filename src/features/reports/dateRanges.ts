import { endOfWeek, format, startOfWeek, subDays } from 'date-fns';

import type { DateRange } from './api';

export type DateRangePreset = '7d' | '30d' | '90d' | 'all';

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: 'Son 7 gün' },
  { value: '30d', label: 'Son 30 gün' },
  { value: '90d', label: 'Son 90 gün' },
  { value: 'all', label: 'Tüm zamanlar' },
];

export function presetToRange(preset: DateRangePreset): DateRange {
  if (preset === 'all') return {};
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  return {
    start: format(subDays(new Date(), days), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  };
}

// Oyuncular sekmesindeki tarih alanıyla tutarlı olsun diye hafta Pazartesi
// başlıyor (takvimdeki hafta hesabıyla aynı kural).
export function getWeekRange(anchorDate: string): DateRange {
  const anchor = new Date(anchorDate + 'T00:00:00');
  return {
    start: format(startOfWeek(anchor, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    end: format(endOfWeek(anchor, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  };
}
