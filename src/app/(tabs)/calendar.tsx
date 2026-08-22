import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardByKey } from '@/constants/cards';
import { SESSION_TYPE_LABEL } from '@/constants/sessionTypes';
import { Spacing } from '@/constants/theme';
import { useSessionDatesInRange, useSessionsForDate } from '@/features/attendance/hooks';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';

const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function CalendarScreen() {
  const theme = useTheme();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const gridStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  const rangeStart = format(gridStart, 'yyyy-MM-dd');
  const rangeEnd = format(gridEnd, 'yyyy-MM-dd');
  const { data: sessionDates } = useSessionDatesInRange(rangeStart, rangeEnd);
  const markedDates = useMemo(() => new Set((sessionDates ?? []).map((s) => s.session_date)), [sessionDates]);

  const { data: daySessions, isLoading: daySessionsLoading } = useSessionsForDate(selectedDate);
  const { data: players } = usePlayers();
  const totalPlayers = players?.length ?? 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="subtitle" style={styles.title}>
            Takvim
          </ThemedText>

          <View style={styles.monthHeader}>
            <Pressable onPress={() => setVisibleMonth((m) => subMonths(m, 1))} hitSlop={12}>
              <ThemedText type="subtitle" themeColor="accent">
                ‹
              </ThemedText>
            </Pressable>
            <ThemedText type="smallBold" style={styles.monthLabel}>
              {format(visibleMonth, 'MMMM yyyy', { locale: tr })}
            </ThemedText>
            <Pressable onPress={() => setVisibleMonth((m) => addMonths(m, 1))} hitSlop={12}>
              <ThemedText type="subtitle" themeColor="accent">
                ›
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((d) => (
              <ThemedText key={d} type="small" themeColor="textSecondary" style={styles.weekdayCell}>
                {d}
              </ThemedText>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const inMonth = isSameMonth(day, visibleMonth);
              const selected = dateKey === selectedDate;
              const today = isToday(day);
              const hasSession = markedDates.has(dateKey);
              return (
                <Pressable key={dateKey} onPress={() => setSelectedDate(dateKey)} style={styles.dayCellWrap}>
                  <View
                    style={{
                      ...styles.dayCell,
                      backgroundColor: selected ? theme.accent : today ? theme.backgroundSelected : 'transparent',
                    }}>
                    <ThemedText
                      type="small"
                      themeColor={selected ? 'onAccent' : 'text'}
                      style={!inMonth ? styles.dimmed : undefined}>
                      {format(day, 'd')}
                    </ThemedText>
                    <View
                      style={{
                        ...styles.dot,
                        backgroundColor: hasSession ? (selected ? theme.onAccent : theme.accent) : 'transparent',
                      }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.daySection}>
            <ThemedText type="smallBold" style={{ marginBottom: Spacing.two }}>
              {format(parseISO(selectedDate), 'd MMMM yyyy, EEEE', { locale: tr })}
            </ThemedText>

            {daySessionsLoading ? (
              <ActivityIndicator style={{ marginTop: Spacing.two }} />
            ) : daySessions && daySessions.length > 0 ? (
              <View style={{ gap: Spacing.two }}>
                {daySessions.map((session) => {
                  const card = session.card_key ? getCardByKey(session.card_key) : undefined;
                  return (
                    <Pressable
                      key={session.id}
                      onPress={() => {
                        if (!session.card_key) return;
                        router.push(
                          `/sessions/type/${session.session_type}/card/${session.card_key}?date=${session.session_date}`
                        );
                      }}
                      style={{ ...styles.sessionRow, backgroundColor: theme.backgroundElement }}>
                      <View>
                        <ThemedText type="smallBold">{SESSION_TYPE_LABEL[session.session_type]}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {card?.dayCode ?? session.card_key}
                        </ThemedText>
                      </View>
                      <ThemedText type="smallBold" themeColor="accent">
                        {session.attendedCount}/{totalPlayers} katıldı
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <ThemedText themeColor="textSecondary">Bu tarihte antrenman kaydı yok.</ThemedText>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  scrollContent: { paddingBottom: Spacing.six },
  title: { marginBottom: Spacing.three },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  monthLabel: { textTransform: 'capitalize' },
  weekdayRow: { flexDirection: 'row', marginBottom: Spacing.one },
  weekdayCell: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    gap: 3,
  },
  dimmed: { opacity: 0.35 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  daySection: { marginTop: Spacing.four },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
