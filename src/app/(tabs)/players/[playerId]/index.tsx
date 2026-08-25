import { isAfter, isEqual, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SESSION_TYPE_LABEL, SESSION_TYPES } from '@/constants/sessionTypes';
import { Spacing } from '@/constants/theme';
import { usePlayerAttendedSessions, usePlayerRecentWeights } from '@/features/attendance/hooks';
import { usePlayer } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { AttendedSession } from '@/features/attendance/api';
import type { SessionType } from '@/types/database';

function isOnOrAfter(dateStr: string, boundary: Date) {
  const date = parseISO(dateStr);
  return isEqual(date, boundary) || isAfter(date, boundary);
}

function summarize(sessions: AttendedSession[], since: Date) {
  const inRange = sessions.filter((s) => isOnOrAfter(s.session_date, since));
  const byType: Record<SessionType, number> = { ptp: 0, strength: 0, individual: 0 };
  inRange.forEach((s) => {
    byType[s.session_type] += 1;
  });
  return { total: inRange.length, byType };
}

export default function PlayerDetailScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const { data: player } = usePlayer(playerId);
  const { data: attended, isLoading } = usePlayerAttendedSessions(playerId);
  const { data: recentWeights } = usePlayerRecentWeights(playerId);
  const theme = useTheme();

  const weekSummary = useMemo(
    () => summarize(attended ?? [], startOfWeek(new Date(), { weekStartsOn: 1 })),
    [attended]
  );
  const monthSummary = useMemo(() => summarize(attended ?? [], startOfMonth(new Date())), [attended]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {player ? (
          <View style={styles.header}>
            <ThemedText type="subtitle">{player.full_name}</ThemedText>
            {player.position ? <ThemedText themeColor="textSecondary">{player.position}</ThemedText> : null}
          </View>
        ) : null}

        <Link href={`/players/${playerId}/report`} asChild>
          <Pressable style={{ ...styles.reportButton, backgroundColor: theme.accent }}>
            <ThemedText themeColor="onAccent" type="smallBold">
              Kümülatif Kas Grubu Raporu
            </ThemedText>
          </Pressable>
        </Link>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: Spacing.four }} />
        ) : (
          <View style={styles.summaryList}>
            <AttendanceSummaryCard title="Bu Hafta" summary={weekSummary} />
            <AttendanceSummaryCard title="Bu Ay" summary={monthSummary} />
          </View>
        )}

        {recentWeights && recentWeights.length > 0 ? (
          <View style={{ ...styles.summaryCard, backgroundColor: theme.backgroundElement, marginTop: Spacing.three }}>
            <ThemedText type="smallBold">Son Ağırlıklar</ThemedText>
            <View style={{ gap: Spacing.two }}>
              {recentWeights.map((row) => (
                <View key={row.exercise_id} style={styles.weightRow}>
                  <ThemedText type="small" style={{ flex: 1 }}>
                    {row.exercise_name}
                  </ThemedText>
                  <ThemedText type="smallBold" themeColor="accent">
                    {row.load_kg} kg
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

function AttendanceSummaryCard({
  title,
  summary,
}: {
  title: string;
  summary: { total: number; byType: Record<SessionType, number> };
}) {
  const theme = useTheme();
  return (
    <View style={{ ...styles.summaryCard, backgroundColor: theme.backgroundElement }}>
      <View style={styles.summaryHeader}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="smallBold" themeColor="accent">
          {summary.total} antrenman
        </ThemedText>
      </View>
      <View style={styles.typeRow}>
        {SESSION_TYPES.map((type) => (
          <View key={type} style={styles.typeItem}>
            <ThemedText type="subtitle" style={styles.typeCount}>
              {summary.byType[type]}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {SESSION_TYPE_LABEL[type]}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  header: { gap: 4, marginBottom: Spacing.three },
  reportButton: { paddingVertical: Spacing.three, borderRadius: Spacing.two, alignItems: 'center' },
  summaryList: { gap: Spacing.three, marginTop: Spacing.three },
  summaryCard: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.three },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeRow: { flexDirection: 'row', justifyContent: 'space-around' },
  typeItem: { alignItems: 'center', gap: 2 },
  weightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeCount: { fontSize: 24 },
});
