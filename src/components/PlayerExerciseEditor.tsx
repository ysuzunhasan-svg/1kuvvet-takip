import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { muscleGroupLabel, MUSCLE_GROUP_ORDER } from '@/constants/muscleGroups';
import { ClubColors, Spacing } from '@/constants/theme';
import {
  useAddPlayerSessionEntry,
  useCreateExercise,
  useExercisesLibrary,
  useMuscleGroups,
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
      <ThemedText type="small" themeColor="textSecondary">
        Bu oyuncuya özel — takım varsayılanından farklıysa buradan değiştirin.
      </ThemedText>
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
  const [mode, setMode] = useState<'list' | 'create'>('list');

  function close() {
    setShow(false);
    setMode('list');
  }

  if (!show) {
    return (
      <Pressable onPress={() => setShow(true)} hitSlop={8}>
        <ThemedText type="small" themeColor="accent">
          + Hareket ekle
        </ThemedText>
      </Pressable>
    );
  }

  if (mode === 'create') {
    return (
      <CreateExerciseForm
        sessionId={sessionId}
        playerId={playerId}
        onBack={() => setMode('list')}
        onDone={close}
      />
    );
  }

  return (
    <View style={styles.pickerWrap}>
      <View style={styles.pickerHeaderRow}>
        <ThemedText type="small" themeColor="textSecondary">
          Hareket seç
        </ThemedText>
        <Pressable onPress={close} hitSlop={8}>
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
              close();
            }}
            style={{ ...styles.pickerItem, backgroundColor: theme.backgroundElement }}>
            <ThemedText type="small">{exercise.name}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => setMode('create')} hitSlop={8}>
        <ThemedText type="small" themeColor="accent">
          + Kütüphanede yok, yeni hareket oluştur
        </ThemedText>
      </Pressable>
    </View>
  );
}

function CreateExerciseForm({
  sessionId,
  playerId,
  onBack,
  onDone,
}: {
  sessionId: string;
  playerId: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const theme = useTheme();
  const { data: muscleGroups } = useMuscleGroups();
  const createExercise = useCreateExercise();
  const addEntry = useAddPlayerSessionEntry(sessionId, playerId);
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const orderedGroups = (muscleGroups ?? [])
    .slice()
    .sort((a, b) => MUSCLE_GROUP_ORDER.indexOf(a.name) - MUSCLE_GROUP_ORDER.indexOf(b.name));

  function toggleGroup(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const exercise = await createExercise.mutateAsync({ name: trimmed, muscleGroupIds: selectedIds });
      await addEntry.mutateAsync(exercise.id);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.pickerWrap}>
      <View style={styles.pickerHeaderRow}>
        <Pressable onPress={onBack} hitSlop={8}>
          <ThemedText type="small" themeColor="accent">
            ‹ Listeye dön
          </ThemedText>
        </Pressable>
        <ThemedText type="small" themeColor="textSecondary">
          Yeni hareket
        </ThemedText>
      </View>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Hareket adı"
        placeholderTextColor={theme.textSecondary}
        style={[styles.nameInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
      />
      <ThemedText type="small" themeColor="textSecondary">
        Hangi kas gruplarını çalıştırıyor? (rapora yansıması için seçin)
      </ThemedText>
      <View style={styles.chipRow}>
        {orderedGroups.map((mg) => {
          const selected = selectedIds.includes(mg.id);
          return (
            <Pressable
              key={mg.id}
              onPress={() => toggleGroup(mg.id)}
              style={{ ...styles.chip, backgroundColor: selected ? theme.accent : theme.backgroundElement }}>
              <ThemedText type="small" themeColor={selected ? 'onAccent' : 'text'}>
                {muscleGroupLabel(mg.name)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={handleCreate}
        disabled={!name.trim() || saving}
        style={{ ...styles.createButton, backgroundColor: theme.accent, opacity: !name.trim() || saving ? 0.5 : 1 }}>
        <ThemedText themeColor="onAccent" type="smallBold">
          {saving ? 'Ekleniyor...' : 'Oluştur ve ekle'}
        </ThemedText>
      </Pressable>
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
    borderWidth: 1.5,
    borderColor: ClubColors.yellow,
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
  pickerItem: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,209,0,0.3)',
  },
  nameInput: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    fontSize: 14,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Spacing.two,
  },
  createButton: {
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
