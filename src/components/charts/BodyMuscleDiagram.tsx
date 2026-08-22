import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';

import { ClubColors, Spacing } from '@/constants/theme';
import { muscleGroupLabel } from '@/constants/muscleGroups';

// Gerçek anatomik kas illüstrasyonu (Wikimedia Commons, "Muscular system" /
// "Muscular system-back", CC BY-SA 3.0, Termininja) — 700x980, oran 700/980.
const FRONT_IMAGE = require('@/assets/images/muscle-front.png');
const BACK_IMAGE = require('@/assets/images/muscle-back.png');
const IMAGE_ASPECT = 700 / 980;

export const BODY_DIAGRAM_WIDTH = 560;
const WIDTH = BODY_DIAGRAM_WIDTH;
const LEFT_LABEL_WIDTH = 122;
const RIGHT_LABEL_WIDTH = 122;
const GAP = 10;
const IMAGE_WIDTH = WIDTH - LEFT_LABEL_WIDTH - RIGHT_LABEL_WIDTH - GAP * 2;
const IMAGE_HEIGHT = IMAGE_WIDTH / IMAGE_ASPECT;
const HEIGHT = IMAGE_HEIGHT;
const IMAGE_LEFT = LEFT_LABEL_WIDTH + GAP;

interface MarkerConfig {
  side: 'left' | 'right';
  xPct: number;
  yPct: number;
}

// Yüzdelik konumlar kaynak görsel üzerinde ızgara ile elle kalibre edildi
// (görselin kendi genişlik/yüksekliğine göre 0-1 arası). Ön görünümden
// görünmeyen kaslar (sırt, kalça, arka bacak) arka görünüme kondu.
const FRONT_MARKERS: Record<string, MarkerConfig> = {
  chest: { side: 'left', xPct: 0.42, yPct: 0.28 },
  core: { side: 'left', xPct: 0.46, yPct: 0.41 },
  hip_adductors: { side: 'left', xPct: 0.46, yPct: 0.6 },
  shoulders: { side: 'right', xPct: 0.63, yPct: 0.21 },
  biceps: { side: 'right', xPct: 0.71, yPct: 0.36 },
  hip_flexors: { side: 'right', xPct: 0.54, yPct: 0.51 },
  quadriceps: { side: 'right', xPct: 0.59, yPct: 0.65 },
};

const BACK_MARKERS: Record<string, MarkerConfig> = {
  upper_back: { side: 'left', xPct: 0.39, yPct: 0.26 },
  lower_back: { side: 'left', xPct: 0.44, yPct: 0.45 },
  glutes: { side: 'left', xPct: 0.41, yPct: 0.52 },
  hamstrings: { side: 'left', xPct: 0.38, yPct: 0.64 },
  triceps: { side: 'right', xPct: 0.72, yPct: 0.37 },
  hip_abductors: { side: 'right', xPct: 0.67, yPct: 0.49 },
  calves: { side: 'right', xPct: 0.62, yPct: 0.8 },
};

export interface BodyMuscleDatum {
  muscle_group_name: string;
  session_count: number;
}

interface BodyMuscleDiagramProps {
  data: BodyMuscleDatum[];
  view: 'front' | 'back';
}

export function BodyMuscleDiagram({ data, view }: BodyMuscleDiagramProps) {
  const markers = view === 'front' ? FRONT_MARKERS : BACK_MARKERS;
  const image = view === 'front' ? FRONT_IMAGE : BACK_IMAGE;
  const activeRows = data.filter((d) => d.session_count > 0 && markers[d.muscle_group_name]);
  const [containerWidth, setContainerWidth] = useState(WIDTH);
  const scale = containerWidth / WIDTH;

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%', maxWidth: WIDTH, aspectRatio: WIDTH / HEIGHT }}>
      <View
        style={{
          position: 'absolute',
          left: IMAGE_LEFT * scale,
          top: 0,
          width: IMAGE_WIDTH * scale,
          height: IMAGE_HEIGHT * scale,
          borderRadius: 6 * scale,
          overflow: 'hidden',
          backgroundColor: '#fbf6f0',
        }}>
        <Image source={image} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      </View>

      <Svg width={WIDTH * scale} height={HEIGHT * scale} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: 'absolute', top: 0, left: 0 }}>
        {activeRows.map((row) => {
          const marker = markers[row.muscle_group_name];
          const dotX = IMAGE_LEFT + marker.xPct * IMAGE_WIDTH;
          const dotY = marker.yPct * IMAGE_HEIGHT;
          const lineEndX = marker.side === 'left' ? LEFT_LABEL_WIDTH : WIDTH - RIGHT_LABEL_WIDTH;
          return (
            <G key={row.muscle_group_name}>
              <Line x1={dotX} y1={dotY} x2={lineEndX} y2={dotY} stroke="rgba(20,20,20,0.85)" strokeWidth={1.5} />
              <Circle cx={lineEndX} cy={dotY} r={3} fill={ClubColors.black} />
              <Circle cx={dotX} cy={dotY} r={5} fill={ClubColors.yellow} stroke="#1a1a19" strokeWidth={1.5} />
            </G>
          );
        })}
      </Svg>

      {activeRows.map((row) => {
        const marker = markers[row.muscle_group_name];
        const isLeft = marker.side === 'left';
        const dotY = marker.yPct * IMAGE_HEIGHT;
        return (
          <View
            key={row.muscle_group_name}
            style={{
              position: 'absolute',
              top: (dotY - 16) * scale,
              left: (isLeft ? 0 : WIDTH - RIGHT_LABEL_WIDTH) * scale,
              width: (isLeft ? LEFT_LABEL_WIDTH : RIGHT_LABEL_WIDTH) * scale,
              alignItems: isLeft ? 'flex-end' : 'flex-start',
            }}>
            <View style={[styles.labelBacking, { alignItems: isLeft ? 'flex-end' : 'flex-start' }]}>
              <Text
                style={[styles.labelName, { textAlign: isLeft ? 'right' : 'left', fontSize: 11 * scale }]}
                numberOfLines={2}>
                {muscleGroupLabel(row.muscle_group_name)}
              </Text>
              <Text style={[styles.labelCount, { textAlign: isLeft ? 'right' : 'left', fontSize: 11 * scale }]}>
                {row.session_count} antrenman
              </Text>
            </View>
          </View>
        );
      })}

      {activeRows.length === 0 ? (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>Bu aralıkta kayıtlı veri yok.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelBacking: {
    backgroundColor: 'rgba(10,10,10,0.78)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  labelName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  labelCount: {
    color: ClubColors.yellow,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  emptyText: {
    color: '#B0B4BA',
    fontSize: 13,
    textAlign: 'center',
  },
});
