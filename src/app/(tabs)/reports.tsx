import { addDays, format, parseISO, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayerSelector } from '@/components/PlayerSelector';
import { MuscleGroupBarChart } from '@/components/charts/MuscleGroupBarChart';
import { MuscleGroupRadarChart } from '@/components/charts/MuscleGroupRadarChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  DATE_RANGE_PRESETS,
  type DateRangePreset,
  getWeekRange,
  presetToRange,
} from '@/features/reports/dateRanges';
import { usePlayerMuscleGroupVolume, useTeamMuscleGroupVolume } from '@/features/reports/hooks';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';

const DESKTOP_BREAKPOINT = 760;

type ReportScope = 'team' | 'player';
type Granularity = 'day' | 'week';

export default function ReportsScreen() {
  const theme = useTheme();
  const [scope, setScope] = useState<ReportScope>('player');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Raporlar</ThemedText>
          <View style={styles.scopeToggle}>
            <Pressable
              onPress={() => setScope('player')}
              style={{
                ...styles.scopeButton,
                backgroundColor: scope === 'player' ? theme.accent : theme.backgroundElement,
              }}>
              <ThemedText type="smallBold" themeColor={scope === 'player' ? 'onAccent' : 'text'}>
                Oyuncu
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setScope('team')}
              style={{
                ...styles.scopeButton,
                backgroundColor: scope === 'team' ? theme.accent : theme.backgroundElement,
              }}>
              <ThemedText type="smallBold" themeColor={scope === 'team' ? 'onAccent' : 'text'}>
                Takım
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {scope === 'team' ? <TeamReport /> : <PlayerReport />}
      </SafeAreaView>
    </ThemedView>
  );
}

function TeamReport() {
  const [preset, setPreset] = useState<DateRangePreset>('30d');
  const range = presetToRange(preset);
  const { data, isLoading } = useTeamMuscleGroupVolume(range);
  const theme = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedText themeColor="textSecondary" type="small">
        Tüm oyuncular birleşik — kas grubu başına kaç antrenmanda çalışıldı.
      </ThemedText>

      <View style={styles.presetRow}>
        {DATE_RANGE_PRESETS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setPreset(option.value)}
            style={[
              styles.presetButton,
              { backgroundColor: preset === option.value ? theme.backgroundSelected : theme.backgroundElement },
            ]}>
            <ThemedText type="small">{option.label}</ThemedText>
          </Pressable>
        ))}
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: Spacing.four }} /> : <MuscleGroupBarChart data={data ?? []} />}
    </ScrollView>
  );
}

function PlayerReport() {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= DESKTOP_BREAKPOINT;

  const { data: players } = usePlayers();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | undefined>(undefined);
  const [granularity, setGranularity] = useState<Granularity>('week');
  const [dayDate, setDayDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [weekAnchor, setWeekAnchor] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  const selectedPlayer = players?.find((p) => p.id === selectedPlayerId);
  const range = granularity === 'day' ? { start: dayDate, end: dayDate } : getWeekRange(weekAnchor);
  const { data, isLoading } = usePlayerMuscleGroupVolume(selectedPlayer?.id, range);

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const weekRange = getWeekRange(weekAnchor);
  const isThisWeek = weekRange.start === getWeekRange(today).start;
  const weekLabel = `${format(parseISO(weekRange.start as string), 'd MMM', { locale: tr })} – ${format(
    parseISO(weekRange.end as string),
    'd MMM yyyy',
    { locale: tr }
  )}`;

  return (
    <View style={isWide ? styles.bodyRow : styles.bodyColumn}>
      <PlayerSelector selectedPlayerId={selectedPlayerId} onSelectPlayer={setSelectedPlayerId} isWide={isWide} />

      <View style={{ ...styles.panel, backgroundColor: theme.backgroundElement }}>
        {!selectedPlayer ? (
          <ThemedText themeColor="textSecondary" style={styles.emptyPanelText}>
            Kas grubu raporunu görmek için {isWide ? 'soldan' : 'yukarıdan'} bir oyuncu seçin.
          </ThemedText>
        ) : (
          <ScrollView contentContainerStyle={{ gap: Spacing.four }}>
            <View style={styles.panelHeader}>
              <View>
                <ThemedText type="smallBold">{selectedPlayer.full_name}</ThemedText>
                {selectedPlayer.position ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {selectedPlayer.position}
                  </ThemedText>
                ) : null}
              </View>

              <View style={styles.granularityBlock}>
                <View style={styles.scopeToggle}>
                  <Pressable
                    onPress={() => setGranularity('day')}
                    style={{
                      ...styles.smallToggleButton,
                      backgroundColor: granularity === 'day' ? theme.accent : theme.background,
                    }}>
                    <ThemedText type="small" themeColor={granularity === 'day' ? 'onAccent' : 'textSecondary'}>
                      Günlük
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => setGranularity('week')}
                    style={{
                      ...styles.smallToggleButton,
                      backgroundColor: granularity === 'week' ? theme.accent : theme.background,
                    }}>
                    <ThemedText type="small" themeColor={granularity === 'week' ? 'onAccent' : 'textSecondary'}>
                      Haftalık
                    </ThemedText>
                  </Pressable>
                </View>

                {granularity === 'day' ? (
                  <View style={styles.quickDateRow}>
                    <Pressable onPress={() => setDayDate(today)} hitSlop={6}>
                      <ThemedText type="link" themeColor={dayDate === today ? 'accent' : 'textSecondary'}>
                        Bugün
                      </ThemedText>
                    </Pressable>
                    <Pressable onPress={() => setDayDate(yesterday)} hitSlop={6}>
                      <ThemedText type="link" themeColor={dayDate === yesterday ? 'accent' : 'textSecondary'}>
                        Dün
                      </ThemedText>
                    </Pressable>
                    <ThemedText type="small" themeColor="textSecondary">
                      {format(parseISO(dayDate), 'd MMMM yyyy', { locale: tr })}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.quickDateRow}>
                    <Pressable onPress={() => setWeekAnchor(format(subDays(parseISO(weekAnchor), 7), 'yyyy-MM-dd'))} hitSlop={6}>
                      <ThemedText type="link" themeColor="textSecondary">
                        ◀
                      </ThemedText>
                    </Pressable>
                    <Pressable onPress={() => setWeekAnchor(today)} hitSlop={6}>
                      <ThemedText type="link" themeColor={isThisWeek ? 'accent' : 'textSecondary'}>
                        Bu hafta
                      </ThemedText>
                    </Pressable>
                    <Pressable onPress={() => setWeekAnchor(format(addDays(parseISO(weekAnchor), 7), 'yyyy-MM-dd'))} hitSlop={6}>
                      <ThemedText type="link" themeColor="textSecondary">
                        ▶
                      </ThemedText>
                    </Pressable>
                    <ThemedText type="small" themeColor="textSecondary">
                      {weekLabel}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator style={{ marginTop: Spacing.four }} />
            ) : (
              <View style={{ backgroundColor: theme.backgroundElement, borderRadius: Spacing.three, padding: Spacing.three }}>
                <ThemedText type="smallBold" style={{ marginBottom: Spacing.two }}>
                  Kas grubu yük dağılımı (set × tekrar)
                </ThemedText>
                <View style={{ alignItems: 'center' }}>
                  <MuscleGroupRadarChart data={data ?? []} />
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
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
  scopeToggle: { flexDirection: 'row', gap: Spacing.one },
  scopeButton: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.two },
  smallToggleButton: { paddingHorizontal: Spacing.two, paddingVertical: 4, borderRadius: Spacing.one },
  scrollContent: { gap: Spacing.three, paddingBottom: Spacing.six },
  presetRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  presetButton: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.two },
  bodyRow: { flex: 1, flexDirection: 'row', gap: Spacing.three, paddingBottom: Spacing.four },
  bodyColumn: { flex: 1, flexDirection: 'column', gap: Spacing.three, paddingBottom: Spacing.four },
  panel: { flex: 1, borderRadius: Spacing.three, padding: Spacing.three },
  emptyPanelText: { paddingVertical: Spacing.six, textAlign: 'center' },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  granularityBlock: { alignItems: 'flex-end', gap: Spacing.two },
  quickDateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
});
