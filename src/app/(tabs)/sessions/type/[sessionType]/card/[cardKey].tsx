import { format, subDays } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttendanceChecklist } from '@/components/AttendanceChecklist';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardByKey } from '@/constants/cards';
import { Spacing } from '@/constants/theme';
import type { CardExerciseRow } from '@/features/attendance/api';
import {
  useAttendance,
  useCardExercises,
  useCardSession,
  useUpdateCardExerciseDefaultWeight,
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

  const { data: session } = useCardSession(sessionType, cardKey, date);
  const { data: players } = usePlayers();
  const { data: attendance } = useAttendance(session?.id);
  const { data: cardExercises, isLoading: exercisesLoading } = useCardExercises(cardKey);
  const updateDefaultWeight = useUpdateCardExerciseDefaultWeight(cardKey);
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
              Takımın bu hareket için yapması gereken ağırlığı girin. Bir oyuncu farklı bir ağırlık/hareket
              yapacaksa, aşağıda "Katılan Oyuncular" listesinden o oyuncuya özel değiştirebilirsiniz.
            </ThemedText>
            {exercisesLoading ? (
              <ActivityIndicator style={{ marginTop: Spacing.two }} />
            ) : cardExercises && cardExercises.length > 0 ? (
              <View style={{ gap: Spacing.two }}>
                {cardExercises.map((exercise, index) => (
                  <DefaultWeightRow
                    key={exercise.id}
                    index={index}
                    exercise={exercise}
                    onChangeWeight={(weight) =>
                      updateDefaultWeight.mutate({ cardExerciseId: exercise.id, weightKg: weight })
                    }
                  />
                ))}
              </View>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Bu kart için henüz hareket programı tanımlanmadı. Katılımı yine de girebilirsiniz; oyuncu bazında
                hareket ekleyebilirsiniz.
              </ThemedText>
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
}: {
  index: number;
  exercise: CardExerciseRow;
  onChangeWeight: (weight: number | null) => void;
}) {
  const theme = useTheme();
  const [text, setText] = useState(exercise.default_weight_kg != null ? String(exercise.default_weight_kg) : '');

  function commit() {
    const raw = text.trim().replace(',', '.');
    const weight = raw === '' ? null : Number(raw);
    if (weight !== null && Number.isNaN(weight)) return;
    onChangeWeight(weight);
  }

  return (
    <View style={styles.exerciseRow}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.exerciseIndex}>
        {index + 1}.
      </ThemedText>
      <View style={{ flex: 1 }}>
        <ThemedText type="small">{exercise.exercise_name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {exercise.sets}x{exercise.reps_per_set}
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
        style={[styles.weightInput, { color: theme.text, backgroundColor: theme.backgroundSelected }]}
      />
    </View>
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
  exerciseIndex: { width: 20 },
  weightInput: {
    width: 56,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Spacing.one,
    textAlign: 'center',
  },
  attendanceButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
