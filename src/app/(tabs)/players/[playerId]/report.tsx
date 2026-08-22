import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BODY_DIAGRAM_WIDTH, BodyMuscleDiagram } from '@/components/charts/BodyMuscleDiagram';
import { MuscleGroupPieChart } from '@/components/charts/MuscleGroupPieChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { DATE_RANGE_PRESETS, type DateRangePreset, presetToRange } from '@/features/reports/dateRanges';
import { usePlayerMuscleGroupVolume } from '@/features/reports/hooks';
import { useTheme } from '@/hooks/use-theme';

// Ön + arka vücut kartı yan yana yeterince geniş olmadan sıkışmasın diye
// genel DESKTOP_BREAKPOINT'ten daha yüksek bir eşik kullanılıyor.
const BODY_ROW_BREAKPOINT = 1100;

export default function PlayerReportScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const [preset, setPreset] = useState<DateRangePreset>('30d');
  const range = presetToRange(preset);
  const { data, isLoading } = usePlayerMuscleGroupVolume(playerId, range);
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isBodyRowWide = windowWidth >= BODY_ROW_BREAKPOINT;

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
            <>
              <View style={isBodyRowWide ? styles.bodyRowWide : styles.bodyRowNarrow}>
                <View
                  style={[styles.chartCard, isBodyRowWide && styles.chartCardBodyWide, styles.bodyCard]}>
                  <ThemedText type="smallBold" style={styles.bodyCardTitle}>
                    Kas haritası — ön görünüm
                  </ThemedText>
                  <View style={styles.bodyDiagramWrap}>
                    <BodyMuscleDiagram data={data ?? []} view="front" />
                  </View>
                </View>

                <View
                  style={[styles.chartCard, isBodyRowWide && styles.chartCardBodyWide, styles.bodyCard]}>
                  <ThemedText type="smallBold" style={styles.bodyCardTitle}>
                    Kas haritası — arka görünüm
                  </ThemedText>
                  <View style={styles.bodyDiagramWrap}>
                    <BodyMuscleDiagram data={data ?? []} view="back" />
                  </View>
                </View>
              </View>

              <ThemedText type="small" themeColor="textSecondary" style={styles.attribution}>
                Kas illüstrasyonu: Wikimedia Commons (CC BY-SA 3.0)
              </ThemedText>

              <View style={[styles.chartCard, styles.pieCard, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold" style={{ marginBottom: Spacing.three }}>
                  Kümülatif dağılım
                </ThemedText>
                <MuscleGroupPieChart data={data ?? []} />
              </View>
            </>
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
  bodyRowNarrow: { gap: Spacing.four },
  bodyRowWide: { flexDirection: 'row', gap: Spacing.four, alignItems: 'flex-start' },
  chartCard: { padding: Spacing.three, borderRadius: Spacing.three },
  chartCardBodyWide: { width: BODY_DIAGRAM_WIDTH + Spacing.three * 2 },
  bodyCard: { backgroundColor: '#f2ece3' },
  bodyCardTitle: { marginBottom: Spacing.three, color: '#1a1a19' },
  bodyDiagramWrap: { alignItems: 'center' },
  attribution: { marginTop: -Spacing.two, textAlign: 'right' },
  pieCard: { alignSelf: 'flex-start', minWidth: 320 },
});
