import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BodyMuscleDiagram } from '@/components/charts/BodyMuscleDiagram';
import { MuscleGroupPieChart } from '@/components/charts/MuscleGroupPieChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { DATE_RANGE_PRESETS, type DateRangePreset, presetToRange } from '@/features/reports/dateRanges';
import { usePlayerMuscleGroupVolume } from '@/features/reports/hooks';
import { useTheme } from '@/hooks/use-theme';

const DESKTOP_BREAKPOINT = 760;

export default function PlayerReportScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const [preset, setPreset] = useState<DateRangePreset>('30d');
  const range = presetToRange(preset);
  const { data, isLoading } = usePlayerMuscleGroupVolume(playerId, range);
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= DESKTOP_BREAKPOINT;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: Spacing.four }} />
          ) : (
            <View style={isWide ? styles.reportRowWide : styles.reportRowNarrow}>
              <View style={[styles.chartCard, isWide && styles.chartCardWide]}>
                <ThemedText type="smallBold" style={{ marginBottom: Spacing.three }}>
                  Kas haritası — antrenman sayısı
                </ThemedText>
                <BodyMuscleDiagram data={data ?? []} />
              </View>

              <View style={[styles.chartCard, isWide && styles.chartCardWide]}>
                <ThemedText type="smallBold" style={{ marginBottom: Spacing.three }}>
                  Kümülatif dağılım
                </ThemedText>
                <MuscleGroupPieChart data={data ?? []} />
              </View>
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
  scrollContent: { gap: Spacing.four, paddingBottom: Spacing.six },
  presetRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  presetButton: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.two },
  reportRowNarrow: { gap: Spacing.five },
  reportRowWide: { flexDirection: 'row', gap: Spacing.five, alignItems: 'flex-start' },
  chartCard: {},
  chartCardWide: { flex: 1 },
});
