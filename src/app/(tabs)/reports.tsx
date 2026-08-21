import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MuscleGroupBarChart } from '@/components/charts/MuscleGroupBarChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { DATE_RANGE_PRESETS, type DateRangePreset, presetToRange } from '@/features/reports/dateRanges';
import { useTeamMuscleGroupVolume } from '@/features/reports/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function TeamReportsScreen() {
  const [preset, setPreset] = useState<DateRangePreset>('30d');
  const range = presetToRange(preset);
  const { data, isLoading } = useTeamMuscleGroupVolume(range);
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText themeColor="textSecondary" type="small">
            Tüm oyuncular birleşik — kas grubu başına toplam hacim.
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
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  scrollContent: { gap: Spacing.three, paddingBottom: Spacing.six },
  presetRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  presetButton: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.two },
});
