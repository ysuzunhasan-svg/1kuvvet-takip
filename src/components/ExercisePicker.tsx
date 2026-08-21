import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { SearchPickerModal } from '@/components/SearchPickerModal';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ExerciseWithMuscleGroups } from '@/features/exercises/api';

interface ExercisePickerProps {
  exercises: ExerciseWithMuscleGroups[];
  value: string | null;
  onChange: (exerciseId: string) => void;
  placeholder?: string;
}

export function ExercisePicker({ exercises, value, onChange, placeholder = 'Hareket seç' }: ExercisePickerProps) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const selected = exercises.find((e) => e.id === value);

  const muscleGroupSummary = (exercise: ExerciseWithMuscleGroups) =>
    exercise.exercise_muscle_groups
      .filter((g) => g.is_primary)
      .map((g) => g.muscle_groups.name)
      .join(', ') || undefined;

  return (
    <>
      <Pressable
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}
        onPress={() => setVisible(true)}>
        <ThemedText themeColor={selected ? 'text' : 'textSecondary'}>
          {selected ? selected.name : placeholder}
        </ThemedText>
      </Pressable>
      <SearchPickerModal
        visible={visible}
        title="Hareket seç"
        items={exercises}
        getKey={(e) => e.id}
        getLabel={(e) => e.name}
        getSubLabel={muscleGroupSummary}
        onSelect={(e) => {
          onChange(e.id);
          setVisible(false);
        }}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
});
