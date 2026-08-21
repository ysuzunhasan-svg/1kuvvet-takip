import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerPicker } from '@/components/PlayerPicker';
import { SetsRepsRow } from '@/components/SetsRepsRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCreateEntries } from '@/features/entries/hooks';
import { useExercises } from '@/features/exercises/hooks';
import { usePlayers } from '@/features/players/hooks';
import { useSession } from '@/features/sessions/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { ExerciseCategory, SessionType } from '@/types/database';

interface RowState {
  key: string;
  exerciseId: string | null;
  sets: string;
  repsPerSet: string;
  loadKg: string;
}

function newRow(): RowState {
  return { key: Math.random().toString(36).slice(2), exerciseId: null, sets: '3', repsPerSet: '10', loadKg: '' };
}

// 'individual' (Bireysel) için kategori filtresi yok — tüm hareketler gösterilir.
const SESSION_TYPE_TO_CATEGORY: Partial<Record<SessionType, ExerciseCategory>> = {
  ptp: 'activation',
  strength: 'strength',
};

export default function SessionEntryScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: session } = useSession(sessionId);
  const { data: players } = usePlayers();
  const category = session ? SESSION_TYPE_TO_CATEGORY[session.session_type] : undefined;
  const { data: exercises } = useExercises(category);
  const createEntries = useCreateEntries(sessionId);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [rows, setRows] = useState<RowState[]>([newRow()]);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  function updateRow(key: string, patch: Partial<RowState>) {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.key !== key) : prev));
  }

  const canSave =
    !!playerId &&
    rows.every((row) => row.exerciseId && Number(row.sets) > 0 && Number(row.repsPerSet) > 0) &&
    !createEntries.isPending;

  async function handleSave() {
    setError(null);
    if (!playerId) {
      setError('Önce bir oyuncu seçin');
      return;
    }
    try {
      await createEntries.mutateAsync({
        playerId,
        rows: rows.map((row) => ({
          exercise_id: row.exerciseId as string,
          sets: Number(row.sets),
          reps_per_set: Number(row.repsPerSet),
          load_kg: row.loadKg ? Number(row.loadKg) : null,
        })),
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kayıt eklenemedi');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.field}>
            <ThemedText type="smallBold">Oyuncu</ThemedText>
            <PlayerPicker players={players ?? []} value={playerId} onChange={setPlayerId} />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Hareketler</ThemedText>
            {rows.map((row) => (
              <SetsRepsRow
                key={row.key}
                exercises={exercises ?? []}
                exerciseId={row.exerciseId}
                sets={row.sets}
                repsPerSet={row.repsPerSet}
                loadKg={row.loadKg}
                onExerciseChange={(id) => updateRow(row.key, { exerciseId: id })}
                onSetsChange={(v) => updateRow(row.key, { sets: v })}
                onRepsChange={(v) => updateRow(row.key, { repsPerSet: v })}
                onLoadChange={(v) => updateRow(row.key, { loadKg: v })}
                onRemove={() => removeRow(row.key)}
              />
            ))}
            <Pressable onPress={() => setRows((prev) => [...prev, newRow()])} style={styles.addRowButton}>
              <ThemedText type="linkPrimary">+ Başka hareket ekle</ThemedText>
            </Pressable>
          </View>

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.accent, opacity: !canSave ? 0.5 : pressed ? 0.8 : 1 },
            ]}>
            <ThemedText themeColor="onAccent" type="smallBold">
              {createEntries.isPending ? 'Kaydediliyor...' : 'Kayıtları Kaydet'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  scrollContent: { gap: Spacing.four, paddingBottom: Spacing.six },
  field: { gap: Spacing.two },
  addRowButton: { paddingVertical: Spacing.two },
  error: { color: '#e34948' },
  button: { borderRadius: Spacing.two, paddingVertical: Spacing.three, alignItems: 'center' },
});
