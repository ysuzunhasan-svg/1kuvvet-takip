import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  useAddPlayerSessionEntry,
  useExercisesLibrary,
  usePlayerSessionEntries,
  useRemoveSessionEntry,
  useUpdateEntryWeight,
} from '@/features/attendance/hooks';
import { useTheme } from '@/hooks/use-theme';

interface PlayerExerciseEditorProps {
  sessionId: string;
  playerId: string;
  attended: boolean;
}

export function PlayerExerciseEditor({ sessionId, playerId, attended }: PlayerExerciseEditorProps) {
  const theme = useTheme();
  const { data: entries, isLoading } = usePlayerSessionEntries(sessionId, playerId);
  const updateWeight = useUpdateEntryWeight(sessionId, playerId);
  const removeEntry = useRemoveSessionEntry(sessionId, playerId);
  const [showAddPicker, setShowAddPicker] = useState(false);

  if (!attended) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        Bu oyuncu bu antrenmana katılmadı.
      </ThemedText>
    );
  }

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: Spacing.two }} />;
  }

  if (!entries || entries.length === 0) {
    return (
      <View style={styles.wrap}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          Kaydettikten sonra hareketleri buradan düzenleyebilirsiniz.
        </ThemedText>
        <AddExerciseControl sessionId={sessionId} playerId={playerId} show={showAddPicker} setShow={setShowAddPicker} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {entries.map((entry) => (
        <EntryRow
          key={entry.id}
          exerciseName={entry.exercise_name}
          sets={entry.sets}
          repsPerSet={entry.reps_per_set}
          loadKg={entry.load_kg}
          onChangeWeight={(weight) => updateWeight.mutate({ entryId: entry.id, weightKg: weight })}
          onRemove={() => removeEntry.mutate(entry.id)}
        />
      ))}
      <AddExerciseControl sessionId={sessionId} playerId={playerId} show={showAddPicker} setShow={setShowAddPicker} />
    </View>
  );
}

function EntryRow({
  exerciseName,
  sets,
  repsPerSet,
  loadKg,
  onChangeWeight,
  onRemove,
}: {
  exerciseName: string;
  sets: number;
  repsPerSet: number;
  loadKg: number | null;
  onChangeWeight: (weight: number | null) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const [text, setText] = useState(loadKg != null ? String(loadKg) : '');

  function commit() {
    const raw = text.trim().replace(',', '.');
    const weight = raw === '' ? null : Number(raw);
    if (weight !== null && Number.isNaN(weight)) return;
    onChangeWeight(weight);
  }

  return (
    <View style={{ ...styles.entryRow, backgroundColor: theme.backgroundSelected }}>
      <View style={{ flex: 1 }}>
        <ThemedText type="small">{exerciseName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {sets}x{repsPerSet}
        </ThemedText>
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        onBlur={commit}
        onSubmitEditing={commit}
        placeholder="kg"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
        style={[styles.weightInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
      />
      <Pressable onPress={onRemove} hitSlop={8}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          ×
        </ThemedText>
      </Pressable>
    </View>
  );
}

function AddExerciseControl({
  sessionId,
  playerId,
  show,
  setShow,
}: {
  sessionId: string;
  playerId: string;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  const theme = useTheme();
  const { data: library } = useExercisesLibrary();
  const addEntry = useAddPlayerSessionEntry(sessionId, playerId);

  if (!show) {
    return (
      <Pressable onPress={() => setShow(true)} hitSlop={8}>
        <ThemedText type="small" themeColor="accent">
          + Hareket ekle
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={styles.pickerWrap}>
      <View style={styles.pickerHeaderRow}>
        <ThemedText type="small" themeColor="textSecondary">
          Hareket seç
        </ThemedText>
        <Pressable onPress={() => setShow(false)} hitSlop={8}>
          <ThemedText type="small" themeColor="textSecondary">
            Kapat
          </ThemedText>
        </Pressable>
      </View>
      <ScrollView style={styles.pickerList} nestedScrollEnabled>
        {(library ?? []).map((exercise) => (
          <Pressable
            key={exercise.id}
            onPress={() => {
              addEntry.mutate(exercise.id);
              setShow(false);
            }}
            style={{ ...styles.pickerItem, backgroundColor: theme.backgroundElement }}>
            <ThemedText type="small">{exercise.name}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two, paddingTop: Spacing.two },
  note: { paddingTop: Spacing.one },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Spacing.two,
  },
  weightInput: {
    width: 56,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Spacing.one,
    textAlign: 'center',
  },
  pickerWrap: { gap: Spacing.two },
  pickerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerList: { maxHeight: 240 },
  pickerItem: { padding: Spacing.two, borderRadius: Spacing.one, marginBottom: 4 },
});
