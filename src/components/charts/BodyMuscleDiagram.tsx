import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { ClubColors, Spacing } from '@/constants/theme';
import { muscleGroupLabel } from '@/constants/muscleGroups';

export const BODY_DIAGRAM_WIDTH = 420;
const WIDTH = BODY_DIAGRAM_WIDTH;
const HEIGHT = 500;

interface MarkerConfig {
  side: 'left' | 'right';
  dotX: number;
  dotY: number;
  labelY: number;
}

// Ön-görünüm vücut üzerinde yaklaşık konumlar. Her grup kendi tarafında
// (merkez x=210'un solunda/sağında) kalacak şekilde seçildi ki işaret
// çizgileri birbirini çaprazlamasın; dotY sırası da labelY sırasıyla aynı
// yönde artıyor (aynı taraftaki çizgiler de kesişmesin diye).
const MARKERS: Record<string, MarkerConfig> = {
  upper_back: { side: 'left', dotX: 165, dotY: 95, labelY: 86 },
  biceps: { side: 'left', dotX: 95, dotY: 150, labelY: 148 },
  core: { side: 'left', dotX: 185, dotY: 175, labelY: 192 },
  hip_flexors: { side: 'left', dotX: 175, dotY: 208, labelY: 236 },
  hip_adductors: { side: 'left', dotX: 185, dotY: 260, labelY: 280 },
  quadriceps: { side: 'left', dotX: 165, dotY: 300, labelY: 328 },
  calves: { side: 'left', dotX: 150, dotY: 390, labelY: 400 },
  shoulders: { side: 'right', dotX: 275, dotY: 95, labelY: 90 },
  chest: { side: 'right', dotX: 245, dotY: 130, labelY: 138 },
  triceps: { side: 'right', dotX: 325, dotY: 150, labelY: 190 },
  lower_back: { side: 'right', dotX: 240, dotY: 185, labelY: 238 },
  glutes: { side: 'right', dotX: 245, dotY: 208, labelY: 284 },
  hip_abductors: { side: 'right', dotX: 262, dotY: 250, labelY: 330 },
  hamstrings: { side: 'right', dotX: 255, dotY: 300, labelY: 400 },
};

const LEFT_LABEL_X = 6;
const LEFT_LABEL_WIDTH = 118;
const RIGHT_LABEL_X = 300;
const RIGHT_LABEL_WIDTH = 118;

// Gövde silueti tek bir kapalı path — omuzdan (en geniş nokta) belе, oradan
// kalçaya kavisle daralıp genişleyen düz bir "kum saati" hattı (monoton
// eğriler, taşma/çentik yaratacak kontrol noktası yok).
const TORSO_PATH = `
  M182,58
  C160,62 130,74 130,96
  C130,126 150,141 168,156
  C160,171 152,191 148,206
  L272,206
  C268,191 260,171 252,156
  C270,141 290,126 290,96
  C290,74 260,62 238,58
  Z
`;

// Kollar ve bacaklar: düz daralan yamuklar (trapezoid) — eğrili versiyon
// pergel gibi dışa şişip görünüyordu, düz kenar çok daha doğal duruyor.
// Üst köşe torsonun omuz eğrisine bilerek fazla giriyor (aynı renk
// olduğundan görünmez) — böylece kol-gövde birleşiminde çentik kalmıyor.
const LEFT_ARM_PATH = 'M92,90 L84,256 L108,254 L148,82 Z';
const RIGHT_ARM_PATH = 'M328,90 L336,256 L312,254 L272,82 Z';

const LEFT_LEG_PATH = 'M148,206 L140,444 L172,444 L200,206 Z';
const RIGHT_LEG_PATH = 'M272,206 L280,444 L248,444 L220,206 Z';

export interface BodyMuscleDatum {
  muscle_group_name: string;
  session_count: number;
}

interface BodyMuscleDiagramProps {
  data: BodyMuscleDatum[];
}

export function BodyMuscleDiagram({ data }: BodyMuscleDiagramProps) {
  const activeRows = data.filter((d) => d.session_count > 0 && MARKERS[d.muscle_group_name]);
  const [containerWidth, setContainerWidth] = useState(WIDTH);
  const scale = containerWidth / WIDTH;

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%', maxWidth: WIDTH, aspectRatio: WIDTH / HEIGHT }}>
      <Svg width={WIDTH * scale} height={HEIGHT * scale} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* Vücut silueti */}
        <Circle cx={210} cy={36} r={26} fill={ClubColors.yellow} />
        <Path d="M190,56 L230,56 L230,70 L190,70 Z" fill={ClubColors.yellow} />
        <Path d={LEFT_ARM_PATH} fill={ClubColors.yellow} />
        <Path d={RIGHT_ARM_PATH} fill={ClubColors.yellow} />
        <Path d={LEFT_LEG_PATH} fill={ClubColors.yellow} />
        <Path d={RIGHT_LEG_PATH} fill={ClubColors.yellow} />
        <Path d={TORSO_PATH} fill={ClubColors.yellow} />

        {/* Aktif kas gruplarının işaret çizgileri + noktaları */}
        {activeRows.map((row) => {
          const marker = MARKERS[row.muscle_group_name];
          const lineEndX = marker.side === 'left' ? LEFT_LABEL_X + LEFT_LABEL_WIDTH : RIGHT_LABEL_X;
          return (
            <G key={row.muscle_group_name}>
              <Line
                x1={marker.dotX}
                y1={marker.dotY}
                x2={lineEndX}
                y2={marker.labelY}
                stroke="rgba(10,10,10,0.85)"
                strokeWidth={1.5}
              />
              <Circle cx={lineEndX} cy={marker.labelY} r={3} fill={ClubColors.black} />
              <Circle cx={marker.dotX} cy={marker.dotY} r={5} fill={ClubColors.black} stroke="#ffffff" strokeWidth={1.5} />
            </G>
          );
        })}
      </Svg>

      {/* Etiketler (metin sarmalama için SVG üstüne bindirilmiş normal View/Text) */}
      {activeRows.map((row) => {
        const marker = MARKERS[row.muscle_group_name];
        const isLeft = marker.side === 'left';
        const labelX = (isLeft ? LEFT_LABEL_X : RIGHT_LABEL_X) * scale;
        const labelWidth = (isLeft ? LEFT_LABEL_WIDTH : RIGHT_LABEL_WIDTH) * scale;
        return (
          <View
            key={row.muscle_group_name}
            style={{
              position: 'absolute',
              top: (marker.labelY - 16) * scale,
              left: labelX,
              width: labelWidth,
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
    backgroundColor: 'rgba(10,10,10,0.72)',
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
