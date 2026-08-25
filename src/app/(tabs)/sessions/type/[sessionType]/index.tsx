import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardsForType } from '@/constants/cards';
import { SESSION_TYPE_LABEL } from '@/constants/sessionTypes';
import { Spacing } from '@/constants/theme';
import { useExercisesLibrary } from '@/features/attendance/hooks';
import { useCreateCard, useDbCardsForType } from '@/features/cards/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

export default function SessionTypeCardsScreen() {
  const { sessionType, date } = useLocalSearchParams<{ sessionType: SessionType; date?: string }>();
  const theme = useTheme();
  const router = useRouter();
  const label = SESSION_TYPE_LABEL[sessionType] ?? sessionType;
  const staticCards = getCardsForType(sessionType);
  const { data: dbCards } = useDbCardsForType(sessionType);
  const cards = [
    ...staticCards,
    ...(dbCards ?? []).map((c) => ({ key: c.key, dayCode: c.dayCode, title: c.title, image: undefined })),
  ];
  const cardHrefSuffix = date ? `?date=${date}` : '';
  const [showCreate, setShowCreate] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleRow}>
            <ThemedText type="subtitle" style={styles.title}>
              {label}
            </ThemedText>
            <Pressable
              onPress={() => setShowCreate((prev) => !prev)}
              hitSlop={12}
              style={{ ...styles.roundButton, backgroundColor: theme.accent }}>
              <ThemedText themeColor="onAccent" type="subtitle" style={styles.roundButtonLabel}>
                +
              </ThemedText>
            </Pressable>
          </View>

          {showCreate ? (
            <CreateCardForm
              sessionType={sessionType}
              onDone={(newKey) => {
                setShowCreate(false);
                router.push(`/sessions/type/${sessionType}/card/${newKey}${cardHrefSuffix}`);
              }}
              onCancel={() => setShowCreate(false)}
            />
          ) : null}

          {cards.length === 0 ? (
            <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four, textAlign: 'center' }}>
              {label} için henüz kart yüklenmedi.
            </ThemedText>
          ) : (
            <View style={styles.list}>
              {cards.map((card) => (
                <Link key={card.key} href={`/sessions/type/${sessionType}/card/${card.key}${cardHrefSuffix}`} asChild>
                  <Pressable style={{ ...styles.card, backgroundColor: theme.backgroundElement }}>
                    {card.image ? (
                      <Image source={card.image} style={styles.thumb} resizeMode="cover" />
                    ) : (
                      <View
                        style={{ ...styles.thumb, ...styles.thumbPlaceholder, backgroundColor: theme.backgroundSelected }}>
                        <ThemedText type="small" themeColor="textSecondary">
                          Görsel yok
                        </ThemedText>
                      </View>
                    )}
                    <View style={styles.cardTextBlock}>
                      <ThemedText type="smallBold">{card.dayCode}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {card.title}
                      </ThemedText>
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function CreateCardForm({
  sessionType,
  onDone,
  onCancel,
}: {
  sessionType: SessionType;
  onDone: (newKey: string) => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const { data: library } = useExercisesLibrary();
  const createCard = useCreateCard();
  const [dayCode, setDayCode] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const filtered = (library ?? []).filter((ex) => ex.name.toLowerCase().includes(search.trim().toLowerCase()));

  function toggleExercise(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleCreate() {
    const trimmed = dayCode.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const newKey = await createCard.mutateAsync({
        sessionType,
        dayCode: trimmed,
        exercises: selectedIds.map((exerciseId) => ({ exerciseId, sets: 3, repsPerSet: 10 })),
      });
      onDone(newKey);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ ...styles.createCard, backgroundColor: theme.backgroundElement }}>
      <ThemedText type="smallBold">Yeni kart oluştur</ThemedText>
      <TextInput
        value={dayCode}
        onChangeText={setDayCode}
        placeholder="Kart adı (ör. MD-4, Squat Günü)"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
      />

      <ThemedText type="small" themeColor="textSecondary">
        Hareketleri seçin ({selectedIds.length} seçili) — set/tekrar varsayılan 3x10 olur, sonra kart ekranından
        ağırlığını girebilirsiniz.
      </ThemedText>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Hareket ara..."
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
      />
      <ScrollView style={styles.exerciseList} nestedScrollEnabled>
        {filtered.map((exercise) => {
          const selected = selectedIds.includes(exercise.id);
          return (
            <Pressable
              key={exercise.id}
              onPress={() => toggleExercise(exercise.id)}
              style={{
                ...styles.exerciseItem,
                backgroundColor: selected ? theme.accent : theme.backgroundSelected,
              }}>
              <ThemedText type="small" themeColor={selected ? 'onAccent' : 'text'}>
                {selected ? '✓ ' : ''}
                {exercise.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.formButtonRow}>
        <Pressable onPress={onCancel} hitSlop={8}>
          <ThemedText type="small" themeColor="textSecondary">
            Vazgeç
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handleCreate}
          disabled={!dayCode.trim() || saving}
          style={{
            ...styles.createButton,
            backgroundColor: theme.accent,
            opacity: !dayCode.trim() || saving ? 0.5 : 1,
          }}>
          <ThemedText themeColor="onAccent" type="smallBold">
            {saving ? 'Oluşturuluyor...' : 'Oluştur'}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  scrollContent: { paddingBottom: Spacing.six },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
  title: { marginBottom: 0 },
  roundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonLabel: { lineHeight: 30, marginBottom: 0 },
  createCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  input: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    fontSize: 14,
  },
  exerciseList: { maxHeight: 260 },
  exerciseItem: {
    padding: Spacing.two,
    borderRadius: Spacing.one,
    marginBottom: 4,
  },
  formButtonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.one },
  createButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  list: { gap: Spacing.three },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: Spacing.two,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cardTextBlock: {
    flex: 1,
    gap: 2,
  },
});
