import { format, subDays } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttendanceChecklist } from '@/components/AttendanceChecklist';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardByKey } from '@/constants/cards';
import { ClubColors, Spacing } from '@/constants/theme';
import type { CardExerciseRow } from '@/features/attendance/api';
import {
  useAddCardExercise,
  useAttendance,
  useCardExercises,
  useCardSession,
  useExercisesLibrary,
  useRemoveCardExercise,
  useUpdateCardExerciseDefaultWeight,
  useUpdateCardExerciseExercise,
} from '@/features/attendance/hooks';
import { useDbCardByKey } from '@/features/cards/hooks';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

export default function CardAttendanceScreen() {
  const { sessionType, cardKey, date: dateParam } = useLocalSearchParams<{
    sessionType: SessionType;
    cardKey: string;
    date?: string;
  }>();
  const staticCard = getCardByKey(cardKey);
  // Statik listede yoksa (kullanıcının uygulamadan oluşturduğu bir kart
  // olabilir) veritabanından ara.
  const { data: dbCard, isLoading: dbCardLoading } = useDbCardByKey(staticCard ? undefined : cardKey);
  const card = staticCard ?? (dbCard ? { key: dbCard.key, dayCode: dbCard.dayCode, title: dbCard.title } : undefined);
  const theme = useTheme();

  const [date, setDate] = useState(dateParam || format(new Date(), 'yyyy-MM-dd'));
  const [showAttendance, setShowAttendance] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);

  const { data: session } = useCardSession(sessionType, cardKey, date);
  const { data: players } = usePlayers();
  const { data: attendance } = useAttendance(session?.id);
  const { data: cardExercises, isLoading: exercisesLoading } = useCardExercises(cardKey);
  const updateDefaultWeight = useUpdateCardExerciseDefaultWeight(cardKey);
  const updateExercise = useUpdateCardExerciseExercise(cardKey);
  const removeExercise = useRemoveCardExercise(cardKey);
  const addExercise = useAddCardExercise(cardKey);
  const attendedCount = attendance?.filter((a) => a.attended).length ?? 0;

  if (!card) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {dbCardLoading ? (
            <ActivityIndicator style={{ marginTop: Spacing.four }} />
          ) : (
            <ThemedText themeColor="textSecondary">Kart bulunamadı.</ThemedText>
          )}
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.dateField}>
            <ThemedText type="smallBold">Tarih</ThemedText>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-AA-GG"
              style={[styles.dateInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            />
            <View style={styles.quickDateRow}>
              <Pressable onPress={() => setDate(format(new Date(), 'yyyy-MM-dd'))}>
                <ThemedText type="link" themeColor="textSecondary">
                  Bugün
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => setDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'))}>
                <ThemedText type="link" themeColor="textSecondary">
                  Dün
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={{ ...styles.exerciseCard, backgroundColor: theme.backgroundElement }}>
            <ThemedText type="smallBold" style={{ marginBottom: 2 }}>
              {card.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
              Hareketin üzerine dokunarak değiştirebilir, × ile çıkarabilirsiniz. Ağırlık takımın bu hareket için
              yapması gereken varsayılan ağırlıktır. Bir oyuncu farklı bir ağırlık/hareket yapacaksa, aşağıda
              "Katılan Oyuncular" listesinden o oyuncuya özel değiştirebilirsiniz.
            </ThemedText>
            {exercisesLoading ? (
              <ActivityIndicator style={{ marginTop: Spacing.two }} />
            ) : (
              <View style={{ gap: Spacing.two }}>
                {(cardExercises ?? []).map((exercise, index) => (
                  <DefaultWeightRow
                    key={exercise.id}
                    index={index}
                    exercise={exercise}
                    onChangeWeight={(weight) =>
                      updateDefaultWeight.mutate({ cardExerciseId: exercise.id, weightKg: weight })
                    }
                    onSwap={(exerciseId) => updateExercise.mutate({ cardExerciseId: exercise.id, exerciseId })}
                    onRemove={() => removeExercise.mutate(exercise.id)}
                  />
                ))}
                {cardExercises && cardExercises.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Bu kart için henüz hareket programı tanımlanmadı.
                  </ThemedText>
                ) : null}
                <AddCardExerciseControl
                  show={showAddExercise}
                  setShow={setShowAddExercise}
                  onAdd={(exerciseId) =>
                    addExercise.mutate({ exerciseId, sortOrder: cardExercises?.length ?? 0 })
                  }
                />
              </View>
            )}
          </View>

          <Pressable
            onPress={() => setShowAttendance((prev) => !prev)}
            style={{ ...styles.attendanceButton, backgroundColor: theme.accent }}>
            <ThemedText themeColor="onAccent" type="smallBold">
              {showAttendance ? 'Katılımı Gizle' : 'Katılan Oyuncular'}
              {players && players.length > 0 ? ` (${attendedCount}/${players.length})` : ''}
            </ThemedText>
          </Pressable>

          {showAttendance && session ? <AttendanceChecklist sessionId={session.id} /> : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function DefaultWeightRow({
  index,
  exercise,
  onChangeWeight,
  onSwap,
  onRemove,
}: {
  index: number;
  exercise: CardExerciseRow;
  onChangeWeight: (weight: number | null) => void;
  onSwap: (exerciseId: string) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const [text, setText] = useState(exercise.default_weight_kg != null ? String(exercise.default_weight_kg) : '');
  const [showSwap, setShowSwap] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  function commit() {
    const raw = text.trim().replace(',', '.');
    const weight = raw === '' ? null : Number(raw);
    if (weight !== null && Number.isNaN(weight)) return;
    onChangeWeight(weight);
  }

  return (
    <View>
      <View style={{ ...styles.exerciseRow, ...styles.selectedExerciseBorder }}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.exerciseIndex}>
          {index + 1}.
        </ThemedText>
        <Pressable style={{ flex: 1 }} onPress={() => setShowSwap((prev) => !prev)} hitSlop={4}>
          <ThemedText type="small">{exercise.exercise_name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {exercise.sets}x{exercise.reps_per_set}
          </ThemedText>
        </Pressable>
        {confirmRemove ? (
          <View style={styles.confirmRow}>
            <Pressable onPress={onRemove} hitSlop={8}>
              <ThemedText type="small" themeColor="accent">
                Evet, çıkar
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setConfirmRemove(false)} hitSlop={8}>
              <ThemedText type="small" themeColor="textSecondary">
                Vazgeç
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <>
            <TextInput
              value={text}
              onChangeText={setText}
              onBlur={commit}
              onSubmitEditing={commit}
              placeholder="kg"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              style={[styles.weightInput, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
            />
            <Pressable onPress={() => setConfirmRemove(true)} hitSlop={8}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                ×
              </ThemedText>
            </Pressable>
          </>
        )}
      </View>
      {showSwap ? (
        <View style={styles.swapWrap}>
          <ExercisePickerList
            onSelect={(exerciseId) => {
              onSwap(exerciseId);
              setShowSwap(false);
            }}
            onClose={() => setShowSwap(false)}
            title={`"${exercise.exercise_name}" yerine`}
          />
        </View>
      ) : null}
    </View>
  );
}

function ExercisePickerList({
  onSelect,
  onClose,
  title,
}: {
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
  title: string;
}) {
  const theme = useTheme();
  const { data: library } = useExercisesLibrary();
  const [search, setSearch] = useState('');
  const filtered = (library ?? []).filter((ex) => ex.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <View style={styles.pickerWrap}>
      <View style={styles.pickerHeaderRow}>
        <ThemedText type="small" themeColor="textSecondary">
          {title}
        </ThemedText>
        <Pressable onPress={onClose} hitSlop={8}>
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
        style={[styles.searchInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
      />
      <ScrollView style={styles.pickerList} nestedScrollEnabled>
        {filtered.map((exercise) => (
          <Pressable
            key={exercise.id}
            onPress={() => onSelect(exercise.id)}
            style={{ ...styles.pickerItem, backgroundColor: theme.backgroundElement }}>
            <ThemedText type="small">{exercise.name}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function AddCardExerciseControl({
  show,
  setShow,
  onAdd,
}: {
  show: boolean;
  setShow: (v: boolean) => void;
  onAdd: (exerciseId: string) => void;
}) {
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
    <ExercisePickerList
      title="Hareket ekle"
      onClose={() => setShow(false)}
      onSelect={(exerciseId) => {
        onAdd(exerciseId);
        setShow(false);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  scrollContent: { gap: Spacing.three, paddingBottom: Spacing.six },
  dateField: { gap: Spacing.two },
  dateInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  quickDateRow: { flexDirection: 'row', gap: Spacing.three },
  exerciseCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  selectedExerciseBorder: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1.5,
    borderColor: ClubColors.yellow,
  },
  exerciseIndex: { width: 20 },
  weightInput: {
    width: 56,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Spacing.one,
    textAlign: 'center',
  },
  swapWrap: { marginTop: Spacing.two, marginLeft: 20 + Spacing.two },
  confirmRow: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  pickerWrap: { gap: Spacing.two },
  pickerHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  searchInput: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
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
  attendanceButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
