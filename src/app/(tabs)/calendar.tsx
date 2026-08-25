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
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { AttendanceChecklist } from '@/components/AttendanceChecklist';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardByKey, getCardsForType } from '@/constants/cards';
import { SESSION_TYPE_LABEL, SESSION_TYPES } from '@/constants/sessionTypes';
import { Spacing } from '@/constants/theme';
import { getOrCreateCardSession } from '@/features/attendance/api';
import { useDeleteSession, useSessionDatesInRange, useSessionsForDate } from '@/features/attendance/hooks';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const CALENDAR_MAX_WIDTH = 500;
const DAY_COLUMN_MAX_WIDTH = 480;
const DESKTOP_BREAKPOINT = 760;
const CELL_MARGIN = 3;

export default function CalendarScreen() {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= DESKTOP_BREAKPOINT;
  // Genişlik yüzdesi + aspectRatio geniş (masaüstü) ekranlarda kutucukları dev
  // boyuta çıkarıyordu — bunun yerine piksel bazlı, telefon genişliğine
  // sabitlenmiş bir hesap kullanıyoruz.
  const contentWidth = Math.min(windowWidth, CALENDAR_MAX_WIDTH) - Spacing.three * 2;
  const columnWidth = contentWidth / 7;
  const cellSize = Math.max(28, columnWidth - CELL_MARGIN * 2);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [addSessionType, setAddSessionType] = useState<SessionType | null>(null);
  const [creatingCardKey, setCreatingCardKey] = useState<string | null>(null);
  const [showDeletePicker, setShowDeletePicker] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const deleteSessionMutation = useDeleteSession();
  const queryClient = useQueryClient();

  function selectDate(dateKey: string) {
    setSelectedDate(dateKey);
    setExpandedSessionId(null);
    setShowTypePicker(false);
    setAddSessionType(null);
    setShowDeletePicker(false);
    setConfirmDeleteId(null);
  }

  function confirmDeleteSession(sessionId: string) {
    deleteSessionMutation.mutate(sessionId);
    setConfirmDeleteId(null);
  }

  async function addCardSession(sessionType: SessionType, cardKey: string) {
    setCreatingCardKey(cardKey);
    try {
      const session = await getOrCreateCardSession(sessionType, cardKey, selectedDate);
      await queryClient.invalidateQueries({ queryKey: ['sessions-for-date'] });
      await queryClient.invalidateQueries({ queryKey: ['session-dates'] });
      setExpandedSessionId(session.id);
      setShowTypePicker(false);
      setAddSessionType(null);
    } finally {
      setCreatingCardKey(null);
    }
  }

  const gridStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  const rangeStart = format(gridStart, 'yyyy-MM-dd');
  const rangeEnd = format(gridEnd, 'yyyy-MM-dd');
  const { data: sessionDates } = useSessionDatesInRange(rangeStart, rangeEnd);

  // Her tarih için o günkü kart(lar)ın etiketini (M-4 PTP, MD-3 PTP, ...) çıkar.
  const labelsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    (sessionDates ?? []).forEach((s) => {
      const card = s.card_key ? getCardByKey(s.card_key) : undefined;
      const dayCode = card?.dayCode ?? s.card_key ?? '';
      const label = `${dayCode} ${SESSION_TYPE_LABEL[s.session_type]}`.trim();
      const existing = map.get(s.session_date) ?? [];
      if (!existing.includes(label)) existing.push(label);
      map.set(s.session_date, existing);
    });
    return map;
  }, [sessionDates]);

  const { data: daySessions, isLoading: daySessionsLoading } = useSessionsForDate(selectedDate);
  const { data: players } = usePlayers();
  const totalPlayers = players?.length ?? 0;

  const calendarBlock = (
    <View style={isWide ? { width: CALENDAR_MAX_WIDTH } : styles.narrowCentered}>
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
          const labels = labelsByDate.get(dateKey) ?? [];
          return (
            <Pressable
              key={dateKey}
              onPress={() => selectDate(dateKey)}
              style={{ width: columnWidth, padding: CELL_MARGIN }}>
              <View
                style={{
                  ...styles.dayCell,
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: selected ? theme.accent : today ? theme.backgroundSelected : 'transparent',
                }}>
                <ThemedText
                  themeColor={selected ? 'onAccent' : 'text'}
                  style={[styles.dayNumber, !inMonth && styles.dimmed]}>
                  {format(day, 'd')}
                </ThemedText>
                {labels.slice(0, 2).map((label) => (
                  <View key={label} style={styles.labelRow}>
                    <View
                      style={{
                        ...styles.labelDot,
                        backgroundColor: selected ? theme.onAccent : theme.accent,
                      }}
                    />
                    <ThemedText themeColor={selected ? 'onAccent' : 'text'} numberOfLines={1} style={styles.cardLabel}>
                      {label}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const dayBlock = (
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
            const expanded = expandedSessionId === session.id;
            return (
              <View key={session.id}>
                <Pressable
                  onPress={() => setExpandedSessionId(expanded ? null : session.id)}
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
                {expanded ? (
                  <View style={styles.checklistWrap}>
                    <AttendanceChecklist sessionId={session.id} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <ThemedText themeColor="textSecondary">Bu tarihte antrenman kaydı yok.</ThemedText>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.addRemoveGroup}>
            <Pressable
              onPress={() => {
                setShowTypePicker((prev) => !prev);
                setAddSessionType(null);
                setShowDeletePicker(false);
                setConfirmDeleteId(null);
              }}
              hitSlop={12}
              style={{ ...styles.roundButton, backgroundColor: theme.accent }}>
              <ThemedText themeColor="onAccent" type="subtitle" style={styles.roundButtonLabel}>
                +
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowDeletePicker((prev) => !prev);
                setShowTypePicker(false);
                setConfirmDeleteId(null);
              }}
              hitSlop={12}
              style={{ ...styles.roundButton, backgroundColor: theme.backgroundElement }}>
              <ThemedText type="subtitle" style={styles.roundButtonLabel}>
                −
              </ThemedText>
            </Pressable>
          </View>

          {showTypePicker ? (
            <View style={{ ...styles.typePickerCard, backgroundColor: theme.backgroundElement }}>
              {addSessionType === null ? (
                <>
                  <ThemedText type="small" themeColor="textSecondary">
                    {format(parseISO(selectedDate), 'd MMMM yyyy, EEEE', { locale: tr })} için antrenman ekle
                  </ThemedText>
                  <View style={styles.typePickerRow}>
                    {SESSION_TYPES.map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => setAddSessionType(type)}
                        style={{ ...styles.typePickerButton, backgroundColor: theme.backgroundSelected }}>
                        <ThemedText type="smallBold">{SESSION_TYPE_LABEL[type]}</ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.typePickerHeaderRow}>
                    <Pressable onPress={() => setAddSessionType(null)} hitSlop={8}>
                      <ThemedText type="small" themeColor="accent">
                        ‹ Geri
                      </ThemedText>
                    </Pressable>
                    <ThemedText type="small" themeColor="textSecondary">
                      {SESSION_TYPE_LABEL[addSessionType]} — kart seç
                    </ThemedText>
                  </View>
                  {getCardsForType(addSessionType).length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {SESSION_TYPE_LABEL[addSessionType]} için henüz kart yüklenmedi.
                    </ThemedText>
                  ) : (
                    <View style={styles.typePickerRow}>
                      {getCardsForType(addSessionType).map((card) => (
                        <Pressable
                          key={card.key}
                          disabled={creatingCardKey !== null}
                          onPress={() => addCardSession(addSessionType, card.key)}
                          style={{ ...styles.typePickerButton, backgroundColor: theme.backgroundSelected }}>
                          {creatingCardKey === card.key ? (
                            <ActivityIndicator size="small" />
                          ) : (
                            <ThemedText type="smallBold">{card.dayCode}</ThemedText>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          ) : null}

          {showDeletePicker ? (
            <View style={{ ...styles.typePickerCard, backgroundColor: theme.backgroundElement }}>
              <ThemedText type="small" themeColor="textSecondary">
                {format(parseISO(selectedDate), 'd MMMM yyyy, EEEE', { locale: tr })} için antrenman çıkar
              </ThemedText>
              {daySessions && daySessions.length > 0 ? (
                <View style={{ gap: Spacing.two }}>
                  {daySessions.map((session) => {
                    const card = session.card_key ? getCardByKey(session.card_key) : undefined;
                    const confirming = confirmDeleteId === session.id;
                    return (
                      <View key={session.id} style={{ ...styles.deleteRow, backgroundColor: theme.backgroundSelected }}>
                        <View style={{ flex: 1 }}>
                          <ThemedText type="smallBold">{SESSION_TYPE_LABEL[session.session_type]}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {card?.dayCode ?? session.card_key} · {session.attendedCount}/{totalPlayers} katıldı
                          </ThemedText>
                        </View>
                        {confirming ? (
                          <View style={styles.confirmRow}>
                            <Pressable onPress={() => confirmDeleteSession(session.id)} hitSlop={8}>
                              <ThemedText type="smallBold" themeColor="accent">
                                Evet, sil
                              </ThemedText>
                            </Pressable>
                            <Pressable onPress={() => setConfirmDeleteId(null)} hitSlop={8}>
                              <ThemedText type="small" themeColor="textSecondary">
                                Vazgeç
                              </ThemedText>
                            </Pressable>
                          </View>
                        ) : (
                          <Pressable onPress={() => setConfirmDeleteId(session.id)} hitSlop={8}>
                            <ThemedText type="smallBold" themeColor="accent">
                              Sil
                            </ThemedText>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  Bu tarihte silinecek antrenman kaydı yok.
                </ThemedText>
              )}
            </View>
          ) : null}

          {isWide ? (
            <View style={styles.wideRow}>
              {calendarBlock}
              <View style={styles.wideDayColumn}>{dayBlock}</View>
            </View>
          ) : (
            <View style={styles.narrowCentered}>
              {calendarBlock}
              {dayBlock}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  scrollContent: { paddingBottom: Spacing.six },
  narrowCentered: { width: '100%', maxWidth: CALENDAR_MAX_WIDTH, alignSelf: 'center' },
  wideRow: { flexDirection: 'row', gap: Spacing.five, alignItems: 'flex-start' },
  wideDayColumn: { flex: 1, maxWidth: DAY_COLUMN_MAX_WIDTH },
  title: { marginBottom: Spacing.three },
  // Sayfanın tam genişliğine göre ortalanır (kolon genişliğine göre değil) —
  // + / - butonları hem geniş hem dar ekranda sayfanın ortasında dursun diye.
  addRemoveGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  roundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonLabel: { lineHeight: 30, marginBottom: 0 },
  typePickerCard: {
    width: '100%',
    maxWidth: CALENDAR_MAX_WIDTH,
    alignSelf: 'center',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  typePickerHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  typePickerRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  typePickerButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  confirmRow: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
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
  dayCell: {
    alignItems: 'stretch',
    justifyContent: 'center',
    borderRadius: Spacing.one,
    paddingHorizontal: 3,
    gap: 1,
  },
  dayNumber: { fontSize: 12, lineHeight: 14, fontWeight: '600', textAlign: 'center' },
  dimmed: { opacity: 0.35 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  labelDot: { width: 5, height: 5, borderRadius: 3, flexShrink: 0 },
  cardLabel: { fontSize: 7, lineHeight: 8, fontWeight: '700', flexShrink: 1 },
  daySection: { marginTop: Spacing.four },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  checklistWrap: { marginTop: Spacing.two },
});
