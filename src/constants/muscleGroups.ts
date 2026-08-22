// Türkçe görünen adlar + sabit sıralama (dataviz: kategorik renk atamasında
// hep aynı sırayla, hiç döngüye girmeden kullanılır).
export const MUSCLE_GROUP_LABEL_TR: Record<string, string> = {
  quadriceps: 'Quadriceps',
  hamstrings: 'Hamstring',
  glutes: 'Kalça (Glute)',
  calves: 'Baldır',
  hip_adductors: 'Kalça İç Adduktor',
  hip_abductors: 'Kalça Dış Abduktor',
  hip_flexors: 'Kalça Fleksör',
  core: 'Karın (Core)',
  lower_back: 'Alt Sırt',
  chest: 'Göğüs',
  upper_back: 'Üst Sırt',
  shoulders: 'Omuz',
  biceps: 'Biceps',
  triceps: 'Triceps',
};

export const MUSCLE_GROUP_ORDER = [
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'hip_adductors',
  'hip_abductors',
  'hip_flexors',
  'core',
  'lower_back',
  'chest',
  'upper_back',
  'shoulders',
  'biceps',
  'triceps',
];

export function muscleGroupLabel(name: string): string {
  return MUSCLE_GROUP_LABEL_TR[name] ?? name;
}
