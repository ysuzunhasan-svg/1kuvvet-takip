import { format, subDays } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardByKey } from '@/constants/cards';
import { Spacing } from '@/constants/theme';
import { useAttendance, useCardSession, useSaveAttendance } from '@/features/attendance/hooks';
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
  const [localAttendance, setLocalAttendance] = useState<Map<string, boolean> | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function handleImageContainerLayout(event: LayoutChangeEvent) {
    setImageWidth(event.nativeEvent.layout.width);
  }

  const { data: session, isLoading: sessionLoading } = useCardSession(sessionType, cardKey, date);
  const { data: players } = usePlayers();
  const { data: attendance } = useAttendance(session?.id);
  const saveAttendance = useSaveAttendance(session?.id ?? '');

  // Sunucudan gelen katılım verisi yüklendiğinde (veya kart/tarih değiştiğinde) yerel
  // seçim durumunu sıfırla — kaydedilmemiş işaretlemeler tarih/kart değişince kaybolur.
  useEffect(() => {
    setLocalAttendance(null);
  }, [session?.id]);

  useEffect(() => {
    if (attendance && localAttendance === null) {
      const map = new Map<string, boolean>();
      attendance.forEach((row) => map.set(row.player_id, row.attended));
      setLocalAttendance(map);
    }
  }, [attendance, localAttendance]);

  function toggleLocal(playerId: string) {
    setJustSaved(false);
    setLocalAttendance((prev) => {
      const next = new Map(prev ?? []);
      next.set(playerId, !(prev?.get(playerId) ?? false));
      return next;
    });
  }

  async function handleSave() {
    if (!session || !players) return;
    const rows = players.map((p) => ({ playerId: p.id, attended: localAttendance?.get(p.id) ?? false }));
    await saveAttendance.mutateAsync(rows);
    setJustSaved(true);
  }

  const attendedCount = players?.filter((p) => localAttendance?.get(p.id)).length ?? 0;

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

          {showAttendance ? (
            sessionLoading || localAttendance === null ? (
              <ActivityIndicator style={{ marginTop: Spacing.three }} />
            ) : (
              <View style={styles.attendanceList}>
                {(players ?? []).map((player) => {
                  const attended = localAttendance.get(player.id) ?? false;
                  return (
                    <Pressable
                      key={player.id}
                      onPress={() => toggleLocal(player.id)}
                      style={{ ...styles.playerRow, backgroundColor: theme.backgroundElement }}>
                      <ThemedText>{player.full_name}</ThemedText>
                      <View
                        style={{
                          ...styles.checkbox,
                          backgroundColor: attended ? theme.accent : 'transparent',
                          borderColor: attended ? theme.accent : theme.textSecondary,
                        }}>
                        {attended ? (
                          <ThemedText themeColor="onAccent" type="smallBold">
                            ✓
                          </ThemedText>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
                {players && players.length === 0 ? (
                  <ThemedText themeColor="textSecondary" style={{ textAlign: 'center', marginTop: Spacing.three }}>
                    Henüz oyuncu eklenmemiş.
                  </ThemedText>
                ) : (
                  <Pressable
                    onPress={handleSave}
                    disabled={saveAttendance.isPending}
                    style={{
                      ...styles.saveButton,
                      backgroundColor: theme.accent,
                      opacity: saveAttendance.isPending ? 0.6 : 1,
                    }}>
                    <ThemedText themeColor="onAccent" type="smallBold">
                      {saveAttendance.isPending ? 'Kaydediliyor...' : justSaved ? 'Kaydedildi ✓' : 'Kaydet'}
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            )
          ) : null}
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
  attendanceList: { gap: Spacing.two },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
