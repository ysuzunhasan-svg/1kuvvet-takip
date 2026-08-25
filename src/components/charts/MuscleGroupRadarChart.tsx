import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ClubColors, Spacing } from '@/constants/theme';
import { muscleGroupLabel, MUSCLE_GROUP_ORDER } from '@/constants/muscleGroups';

interface MuscleGroupRadarDatum {
  muscle_group_name: string;
  total_sets: number;
  total_volume: number;
}

interface MuscleGroupRadarChartProps {
  data: MuscleGroupRadarDatum[];
}

const SIZE = 460;
const CENTER = SIZE / 2;
const RADIUS = 140;
const LABEL_RADIUS = 175;
const LABEL_BOX_WIDTH = 110;
const RING_STEPS = [0.25, 0.5, 0.75, 1];
const GRID_COLOR = 'rgba(255,255,255,0.14)';
const FILL_COLOR = 'rgba(255,209,0,0.32)';

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

// "Hangi kas grubu diğerlerine göre yüzde kaç çalışılmış" — set×tekrar
// hacmi (total_volume) toplam üzerinden orana çevrilip her ekseni bir kas
// grubuna sabitleyen bir örümcek grafiğe dönüştürülür. Eksen sırası
// MUSCLE_GROUP_ORDER ile sabit, böylece farklı gün/haftalarda şekil
// karşılaştırılabilir kalır. Ham set/tekrar sayıları grafiğin altındaki
// listede gösterilir (yüzde tek başına "ne kadar iş yapıldığını" değil,
// sadece dağılımı anlatır).
export function MuscleGroupRadarChart({ data }: MuscleGroupRadarChartProps) {
  const [containerWidth, setContainerWidth] = useState(SIZE);
  const scale = containerWidth / SIZE;

  const rowByGroup = new Map(data.map((d) => [d.muscle_group_name, d]));
  const total = data.reduce((sum, d) => sum + d.total_volume, 0);

  if (total === 0) {
    return <Text style={styles.emptyText}>Bu tarih aralığında kayıtlı hareket verisi yok.</Text>;
  }

  const N = MUSCLE_GROUP_ORDER.length;
  const angleStep = 360 / N;

  const axes = MUSCLE_GROUP_ORDER.map((name, i) => {
    const angle = i * angleStep;
    const row = rowByGroup.get(name);
    const volume = row?.total_volume ?? 0;
    const sets = row?.total_sets ?? 0;
    const fraction = volume / total;
    const dataPoint = polarToCartesian(CENTER, CENTER, RADIUS * fraction, angle);
    const axisEnd = polarToCartesian(CENTER, CENTER, RADIUS, angle);
    const labelPoint = polarToCartesian(CENTER, CENTER, LABEL_RADIUS, angle);
    return { name, angle, fraction, sets, volume, dataPoint, axisEnd, labelPoint };
  });

  const polygonPoints = axes.map((a) => `${a.dataPoint.x},${a.dataPoint.y}`).join(' ');
  const activeAxes = axes.filter((a) => a.fraction > 0);

  return (
    <View style={{ width: '100%', maxWidth: SIZE, gap: Spacing.four }}>
      <View
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        style={{ width: '100%', maxWidth: SIZE, aspectRatio: 1 }}>
        <Svg width={SIZE * scale} height={SIZE * scale} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {RING_STEPS.map((step) => {
            const ringPoints = MUSCLE_GROUP_ORDER.map((_, i) => {
              const p = polarToCartesian(CENTER, CENTER, RADIUS * step, i * angleStep);
              return `${p.x},${p.y}`;
            }).join(' ');
            return <Polygon key={step} points={ringPoints} fill="none" stroke={GRID_COLOR} strokeWidth={1} />;
          })}

          {axes.map((a) => (
            <Line
              key={`spoke-${a.name}`}
              x1={CENTER}
              y1={CENTER}
              x2={a.axisEnd.x}
              y2={a.axisEnd.y}
              stroke={GRID_COLOR}
              strokeWidth={1}
            />
          ))}

          <Polygon points={polygonPoints} fill={FILL_COLOR} stroke={ClubColors.yellow} strokeWidth={2} />

          {activeAxes.map((a) => (
            <Circle
              key={`dot-${a.name}`}
              cx={a.dataPoint.x}
              cy={a.dataPoint.y}
              r={4}
              fill={ClubColors.yellow}
              stroke="#1a1a19"
              strokeWidth={1}
            />
          ))}
        </Svg>

        {axes.map((a) => (
          <View
            key={`label-${a.name}`}
            style={{
              position: 'absolute',
              top: (a.labelPoint.y - 16) * scale,
              left: (a.labelPoint.x - LABEL_BOX_WIDTH / 2) * scale,
              width: LABEL_BOX_WIDTH * scale,
              alignItems: 'center',
            }}>
            <Text style={[styles.labelName, { fontSize: 11 * scale }]} numberOfLines={2}>
              {muscleGroupLabel(a.name)}
            </Text>
            {a.fraction > 0 ? (
              <Text style={[styles.labelPct, { fontSize: 11 * scale }]}>{Math.round(a.fraction * 100)}%</Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        {activeAxes
          .slice()
          .sort((a, b) => b.fraction - a.fraction)
          .map((a) => (
            <View key={`legend-${a.name}`} style={styles.legendRow}>
              <ThemedText type="small" style={styles.legendLabel} numberOfLines={1}>
                {muscleGroupLabel(a.name)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {a.sets} set · {a.volume} tekrar
              </ThemedText>
              <ThemedText type="smallBold" themeColor="accent" style={styles.legendPct}>
                {Math.round(a.fraction * 100)}%
              </ThemedText>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    color: '#A8A8A8',
    fontSize: 13,
  },
  labelName: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  labelPct: {
    color: ClubColors.yellow,
    fontWeight: '800',
    textAlign: 'center',
  },
  legend: { width: '100%', gap: Spacing.two },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  legendLabel: { flex: 1 },
  legendPct: { width: 44, textAlign: 'right' },
});
