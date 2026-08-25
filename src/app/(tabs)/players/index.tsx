import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ClubColors, Spacing } from '@/constants/theme';
import type { ExerciseOption, PlayerSessionEntry } from '@/features/attendance/api';
import {
  useAddFreeformEntry,
  useExercisesLibrary,
  useIndividualSession,
  usePlayerSessionEntries,
  useRemoveSessionEntry,
  useUpdateEntryWeight,
} from '@/features/attendance/hooks';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { Player } from '@/types/database';

const DESKTOP_BREAKPOINT = 760;

export default function PlayersScreen() {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= DESKTOP_BREAKPOINT;

  const { data: players, isLoading: playersLoading } = usePlayers();
  const [query, setQuery] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const filtered = useMemo(() => {
    if (!players) return [];
    if (!query.trim()) return players;
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return players.filter((p) => p.full_name.toLocaleLowerCase('tr-TR').includes(q));
  }, [players, query]);

  const selectedPlayer = players?.find((p) => p.id === selectedPlayerId);
  const { data: session } = useIndividualSession(date);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Oyuncular</ThemedText>
          <Link href="/players/new" asChild>
            <Pressable style={{ ...styles.newButton, backgroundColor: theme.accent }}>
              <ThemedText themeColor="onAccent" type="smallBold">
                + Oyuncu Ekle
              </ThemedText>
            </Pressable>
          </Link>
        </View>

        <View style={isWide ? styles.bodyRow : styles.bodyColumn}>
          <View
            style={[
              styles.sidebar,
              isWide ? styles.sidebarWide : styles.sidebarNarrow,
              { backgroundColor: theme.backgroundElement },
            ]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Oyuncu ara..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.search, { color: theme.text, backgroundColor: theme.background }]}
            />
            {playersLoading ? (
              <ActivityIndicator style={{ marginTop: Spacing.three }} />
            ) : (
              <ScrollView style={isWide ? styles.playerListWide : styles.playerListNarrow}>
                <View style={{ gap: Spacing.one, paddingBottom: Spacing.two }}>
                  {filtered.map((p) => {
                    const selected = p.id === selectedPlayerId;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => setSelectedPlayerId(p.id)}
                        style={{
                          ...styles.playerRow,
                          backgroundColor: selected ? theme.accent : theme.background,
                        }}>
                        <ThemedText type="small" themeColor={selected ? 'onAccent' : 'text'}>
                          {p.full_name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary" style={{ padding: Spacing.two }}>
                      Oyuncu bulunamadı.
                    </ThemedText>
                  ) : null}
                </View>
              </ScrollView>
            )}
          </View>

          <View style={{ ...styles.panel, backgroundColor: theme.backgroundElement }}>
            {!selectedPlayer ? (
              <ThemedText themeColor="textSecondary" style={styles.emptyPanelText}>
                Hareket eklemek için {isWide ? 'soldan' : 'yukarıdan'} bir oyuncu seçin.
              </ThemedText>
            ) : (
              <PlayerEntryPanel player={selectedPlayer} date={date} setDate={setDate} sessionId={session?.id} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function PlayerEntryPanel({
  player,
  date,
  setDate,
  sessionId,
}: {
  player: Player;
  date: string;
  setDate: (date: string) => void;
  sessionId: string | undefined;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const { data: entries, isLoading } = usePlayerSessionEntries(sessionId, player.id);
  const addEntry = useAddFreeformEntry(sessionId, player.id);
  const removeEntry = useRemoveSessionEntry(sessionId ?? '', player.id);
  const updateWeight = useUpdateEntryWeight(sessionId ?? '', player.id);
  const [showAddPicker, setShowAddPicker] = useState(false);

  return (
    <View style={{ gap: Spacing.three }}>
      <View style={styles.panelHeader}>
        <View>
          <ThemedText type="smallBold">{player.full_name}</ThemedText>
          {player.position ? (
            <ThemedText type="small" themeColor="textSecondary">
              {player.position}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.panelHeaderRight}>
          <View style={styles.quickDateRow}>
            <Pressable onPress={() => setDate(today)} hitSlop={6}>
              <ThemedText type="link" themeColor={date === today ? 'accent' : 'textSecondary'}>
                Bugün
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setDate(yesterday)} hitSlop={6}>
              <ThemedText type="link" themeColor={date === yesterday ? 'accent' : 'textSecondary'}>
                Dün
              </ThemedText>
            </Pressable>
          </View>
          <Link href={`/players/${player.id}`} asChild>
            <Pressable hitSlop={6}>
              <ThemedText type="link" themeColor="accent">
                Profil →
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {format(new Date(date + 'T00:00:00'), 'd MMMM yyyy', { locale: tr })} tarihi için hareket ve ağırlık girin —
        kümülatif kas grubu raporuna otomatik yansır.
      </ThemedText>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.two }} />
      ) : (
        <View style={{ gap: Spacing.two }}>
          {(entries ?? []).map((entry: PlayerSessionEntry) => (
            <FreeformEntryRow
              key={entry.id}
              exerciseName={entry.exercise_name}
              sets={entry.sets}
              repsPerSet={entry.reps_per_set}
              loadKg={entry.load_kg}
              onChangeWeight={(weight) => updateWeight.mutate({ entryId: entry.id, weightKg: weight })}
              onRemove={() => removeEntry.mutate(entry.id)}
            />
          ))}
          {(entries ?? []).length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Bu oyuncu için bu tarihte henüz hareket eklenmedi.
            </ThemedText>
          ) : null}
        </View>
      )}

      <AddFreeformExerciseControl
        show={showAddPicker}
        setShow={setShowAddPicker}
        onAdd={(exerciseId) => addEntry.mutate(exerciseId)}
      />
    </View>
  );
}

function FreeformEntryRow({
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

function AddFreeformExerciseControl({
  show,
  setShow,
  onAdd,
}: {
  show: boolean;
  setShow: (v: boolean) => void;
  onAdd: (exerciseId: string) => void;
}) {
  const theme = useTheme();
  const { data: library } = useExercisesLibrary();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!library) return [];
    if (!search.trim()) return library;
    const q = search.trim().toLocaleLowerCase('tr-TR');
    return library.filter((e: ExerciseOption) => e.name.toLocaleLowerCase('tr-TR').includes(q));
  }, [library, search]);

  function close() {
    setShow(false);
    setSearch('');
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
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Hareket ara..."
        placeholderTextColor={theme.textSecondary}
        style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background }]}
      />
      <ScrollView style={styles.pickerList} nestedScrollEnabled>
        {filtered.map((exercise: ExerciseOption) => (
          <Pressable
            key={exercise.id}
            onPress={() => {
              onAdd(exercise.id);
              close();
            }}
            style={{ ...styles.pickerItem, backgroundColor: theme.backgroundElement }}>
            <ThemedText type="small">{exercise.name}</ThemedText>
          </Pressable>
        ))}
        {filtered.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary" style={{ padding: Spacing.two }}>
            Hareket bulunamadı.
          </ThemedText>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  newButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  bodyRow: { flex: 1, flexDirection: 'row', gap: Spacing.three, paddingBottom: Spacing.four },
  bodyColumn: { flex: 1, flexDirection: 'column', gap: Spacing.three, paddingBottom: Spacing.four },
  sidebar: { borderRadius: Spacing.three, padding: Spacing.three },
  sidebarWide: { width: 260 },
  sidebarNarrow: { width: '100%' },
  search: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    marginBottom: Spacing.two,
  },
  playerListWide: { flex: 1 },
  playerListNarrow: { maxHeight: 220 },
  playerRow: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, borderRadius: Spacing.two },
  panel: { flex: 1, borderRadius: Spacing.three, padding: Spacing.three },
  emptyPanelText: { paddingVertical: Spacing.six, textAlign: 'center' },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  panelHeaderRight: { alignItems: 'flex-end', gap: Spacing.one },
  quickDateRow: { flexDirection: 'row', gap: Spacing.three },
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
  searchInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: ClubColors.yellow,
  },
  pickerList: { maxHeight: 240 },
  pickerItem: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,209,0,0.3)',
  },
});
