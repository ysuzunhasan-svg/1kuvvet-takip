import { format, subDays } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, type LayoutChangeEvent, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttendanceChecklist } from '@/components/AttendanceChecklist';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardByKey } from '@/constants/cards';
import { Spacing } from '@/constants/theme';
import { useAttendance, useCardSession } from '@/features/attendance/hooks';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

// Kartların hepsi aynı oranda export edildi (2339×1653 px).
const CARD_ASPECT_RATIO = 1653 / 2339;

export default function CardAttendanceScreen() {
  const { sessionType, cardKey, date: dateParam } = useLocalSearchParams<{
    sessionType: SessionType;
    cardKey: string;
    date?: string;
  }>();
  const card = getCardByKey(cardKey);
  const theme = useTheme();

  const [date, setDate] = useState(dateParam || format(new Date(), 'yyyy-MM-dd'));
  const [showAttendance, setShowAttendance] = useState(false);
  const [imageWidth, setImageWidth] = useState(0);

  function handleImageContainerLayout(event: LayoutChangeEvent) {
    setImageWidth(event.nativeEvent.layout.width);
  }

  const { data: session } = useCardSession(sessionType, cardKey, date);
  const { data: players } = usePlayers();
  const { data: attendance } = useAttendance(session?.id);
  const attendedCount = attendance?.filter((a) => a.attended).length ?? 0;

  if (!card) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText themeColor="textSecondary">Kart bulunamadı.</ThemedText>
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

          <View onLayout={handleImageContainerLayout}>
            {imageWidth > 0 ? (
              <Image
                source={card.image}
                style={{ width: imageWidth, height: imageWidth * CARD_ASPECT_RATIO, borderRadius: Spacing.two }}
                resizeMode="contain"
              />
            ) : null}
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
  attendanceButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
