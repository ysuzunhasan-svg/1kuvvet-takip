import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MuscleGroupVolumeRow {
  muscle_group_name: string;
  session_count: number;
}

interface MuscleGroupBarChartProps {
  data: MuscleGroupVolumeRow[];
}

const BAR_HEIGHT = 20;
const LABEL_WIDTH = 130;

// Tek seri / tek hue: her çubuk bir kas grubu, kimlik zaten eksen etiketiyle
// taşınıyor, bu yüzden kategorik renk paleti yerine tutarlı bir sequential mavi kullanılıyor.
const BAR_COLOR_LIGHT = '#2a78d6';
const BAR_COLOR_DARK = '#3987e5';

export function MuscleGroupBarChart({ data }: MuscleGroupBarChartProps) {
  const scheme = useColorScheme();
  const barColor = scheme === 'dark' ? BAR_COLOR_DARK : BAR_COLOR_LIGHT;
  const maxCount = Math.max(1, ...data.map((d) => d.session_count));

  if (data.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        Bu aralıkta kayıtlı veri yok.
      </ThemedText>
    );
  }

  return (
    <View style={{ gap: Spacing.three }}>
      {data.map((row) => {
        const widthPercent = Math.max((row.session_count / maxCount) * 100, 3);
        return (
          <View key={row.muscle_group_name} style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label} numberOfLines={1}>
              {row.muscle_group_name}
            </ThemedText>
            <View style={styles.barTrack}>
              <View
                style={[styles.bar, { backgroundColor: barColor, width: `${widthPercent}%` as `${number}%` }]}
              />
            </View>
            <ThemedText type="smallBold" style={styles.value}>
              {row.session_count} antrenman
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    width: LABEL_WIDTH,
  },
  barTrack: {
    flex: 1,
    height: BAR_HEIGHT,
    justifyContent: 'center',
  },
  bar: {
    height: BAR_HEIGHT,
    minWidth: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  value: {
    width: 84,
    textAlign: 'right',
  },
});
