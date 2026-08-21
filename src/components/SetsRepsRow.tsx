import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ExercisePicker } from '@/components/ExercisePicker';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ExerciseWithMuscleGroups } from '@/features/exercises/api';
import { useTheme } from '@/hooks/use-theme';

interface SetsRepsRowProps {
  exercises: ExerciseWithMuscleGroups[];
  exerciseId: string | null;
  sets: string;
  repsPerSet: string;
  loadKg: string;
  onExerciseChange: (id: string) => void;
  onSetsChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onLoadChange: (value: string) => void;
  onRemove: () => void;
}

export function SetsRepsRow({
  exercises,
  exerciseId,
  sets,
  repsPerSet,
  loadKg,
  onExerciseChange,
  onSetsChange,
  onRepsChange,
  onLoadChange,
  onRemove,
}: SetsRepsRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.exerciseRow}>
        <View style={{ flex: 1 }}>
          <ExercisePicker exercises={exercises} value={exerciseId} onChange={onExerciseChange} />
        </View>
        <Pressable onPress={onRemove} hitSlop={12} style={styles.removeButton}>
          <ThemedText themeColor="textSecondary">Sil</ThemedText>
        </Pressable>
      </View>
      <View style={styles.numbersRow}>
        <NumberField label="Set" value={sets} onChangeText={onSetsChange} />
        <NumberField label="Tekrar" value={repsPerSet} onChangeText={onRepsChange} />
        <NumberField label="Yük (kg, opsiyonel)" value={loadKg} onChangeText={onLoadChange} />
      </View>
    </View>
  );
}

function NumberField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.numberField}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        style={[styles.numberInput, { color: theme.text, backgroundColor: theme.background }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  removeButton: {
    paddingHorizontal: Spacing.two,
  },
  numbersRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  numberField: {
    flex: 1,
    gap: 4,
  },
  numberInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});
