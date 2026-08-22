import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { muscleGroupLabel, MUSCLE_GROUP_ORDER } from '@/constants/muscleGroups';

interface MuscleGroupVolumeRow {
  muscle_group_name: string;
  session_count: number;
}

interface MuscleGroupPieChartProps {
  data: MuscleGroupVolumeRow[];
}

const SIZE = 260;
const RADIUS = 122;
const INNER_RADIUS = 66;
const CENTER = SIZE / 2;
const MAX_SLOTS = 8;
const CARD_BACKGROUND = Colors.dark.backgroundElement;

// Dataviz skill: kategorik renkler sabit sırayla, hiç döngüye girmeden atanır (dark mod).
const CATEGORICAL_DARK = [
  '#3987e5', // blue
  '#d95926', // orange
  '#199e70', // aqua
  '#c98500', // yellow
  '#d55181', // magenta
  '#008300', // green
  '#9085e9', // violet
  '#e66767', // red
];
const OTHER_COLOR = '#5a5a56';

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeSlice(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 359.999) {
    // Tam daire: SVG arc iki nokta üst üste geldiğinde çizilemez, iki yarımla çiziyoruz.
    const mid = startAngle + 180;
    const p1 = polarToCartesian(cx, cy, r, startAngle);
    const pMid = polarToCartesian(cx, cy, r, mid);
    const p2 = polarToCartesian(cx, cy, r, endAngle);
    return `M ${cx},${cy} L ${p1.x},${p1.y} A ${r},${r} 0 1 1 ${pMid.x},${pMid.y} A ${r},${r} 0 1 1 ${p2.x},${p2.y} Z`;
  }
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx},${cy} L ${start.x},${start.y} A ${r},${r} 0 ${largeArcFlag} 1 ${end.x},${end.y} Z`;
}

export function MuscleGroupPieChart({ data }: MuscleGroupPieChartProps) {
  const total = data.reduce((sum, row) => sum + row.session_count, 0);

  if (total === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        Bu aralıkta kayıtlı veri yok.
      </ThemedText>
    );
  }

  const ordered = [...data]
    .filter((row) => row.session_count > 0)
    .sort((a, b) => MUSCLE_GROUP_ORDER.indexOf(a.muscle_group_name) - MUSCLE_GROUP_ORDER.indexOf(b.muscle_group_name));

  // Renk, MUSCLE_GROUP_ORDER içindeki sabit konumundan gelir (o an ekranda
  // görünen diğer gruplara göre değil) — böylece aynı kas grubu her raporda
  // hep aynı renkte kalır. İlk 8 sabit sırada kendi rengini alır, MAX_SLOTS'un
  // ötesindeki (nadir görülen) gruplar her zaman "Diğer"e katlanır.
  const slotOf = (name: string) => MUSCLE_GROUP_ORDER.indexOf(name);
  const primary = ordered.filter((row) => slotOf(row.muscle_group_name) >= 0 && slotOf(row.muscle_group_name) < MAX_SLOTS);
  const rest = ordered.filter((row) => slotOf(row.muscle_group_name) < 0 || slotOf(row.muscle_group_name) >= MAX_SLOTS);
  const otherCount = rest.reduce((sum, row) => sum + row.session_count, 0);

  const slices = primary.map((row) => ({
    name: row.muscle_group_name,
    label: muscleGroupLabel(row.muscle_group_name),
    count: row.session_count,
    color: CATEGORICAL_DARK[MUSCLE_GROUP_ORDER.indexOf(row.muscle_group_name)],
  }));
  if (otherCount > 0) {
    slices.push({ name: '__other__', label: 'Diğer', count: otherCount, color: OTHER_COLOR });
  }

  let cursor = 0;
  const arcs = slices.map((slice) => {
    const fraction = slice.count / total;
    const startAngle = cursor * 360;
    const endAngle = (cursor + fraction) * 360;
    cursor += fraction;
    return { ...slice, startAngle, endAngle, fraction };
  });

  return (
    <View style={styles.container}>
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {arcs.length === 1 ? (
            <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill={arcs[0].color} />
          ) : (
            arcs.map((arc) => (
              <Path
                key={arc.name}
                d={describeSlice(CENTER, CENTER, RADIUS, arc.startAngle, arc.endAngle)}
                fill={arc.color}
                stroke={CARD_BACKGROUND}
                strokeWidth={2}
              />
            ))
          )}
          <Circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill={CARD_BACKGROUND} />
        </Svg>
        <View style={styles.centerLabel} pointerEvents="none">
          <Text style={styles.centerCount}>{total}</Text>
          <Text style={styles.centerCaption}>antrenman</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {arcs.map((arc) => (
          <View key={arc.name} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: arc.color }]} />
            <ThemedText type="small" style={styles.legendLabel} numberOfLines={1}>
              {arc.label}
            </ThemedText>
            <ThemedText type="smallBold">{Math.round(arc.fraction * 100)}%</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  centerCaption: {
    color: '#A8A8A8',
    fontSize: 12,
  },
  legend: {
    width: '100%',
    gap: Spacing.two,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendLabel: {
    flex: 1,
  },
});
