import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import { ClubColors, Spacing } from '@/constants/theme';
import { muscleGroupLabel } from '@/constants/muscleGroups';

const WIDTH = 340;
const HEIGHT = 480;

interface MarkerConfig {
  side: 'left' | 'right';
  dotX: number;
  dotY: number;
  labelY: number;
}

// Ön-görünüm vücut üzerinde yaklaşık konumlar. Etiketler çakışmasın diye
// labelY değerleri her taraf için elle aralıklı seçildi (tam anatomik değil,
// okunaklı bir "kas haritası" için tasarım kararı).
const MARKERS: Record<string, MarkerConfig> = {
  upper_back: { side: 'left', dotX: 128, dotY: 92, labelY: 90 },
  biceps: { side: 'left', dotX: 92, dotY: 150, labelY: 150 },
  core: { side: 'left', dotX: 150, dotY: 190, labelY: 190 },
  hip_flexors: { side: 'left', dotX: 138, dotY: 226, labelY: 230 },
  hip_adductors: { side: 'left', dotX: 145, dotY: 268, labelY: 270 },
  quadriceps: { side: 'left', dotX: 138, dotY: 320, labelY: 320 },
  calves: { side: 'left', dotX: 140, dotY: 400, labelY: 400 },
  shoulders: { side: 'right', dotX: 212, dotY: 95, labelY: 100 },
  chest: { side: 'right', dotX: 182, dotY: 138, labelY: 140 },
  triceps: { side: 'right', dotX: 248, dotY: 150, labelY: 190 },
  lower_back: { side: 'right', dotX: 192, dotY: 215, labelY: 230 },
  glutes: { side: 'right', dotX: 196, dotY: 224, labelY: 270 },
  hip_abductors: { side: 'right', dotX: 200, dotY: 268, labelY: 310 },
  hamstrings: { side: 'right', dotX: 200, dotY: 320, labelY: 360 },
};

const LEFT_LABEL_X = 8;
const LEFT_LABEL_WIDTH = 96;
const RIGHT_LABEL_X = 236;
const RIGHT_LABEL_WIDTH = 96;

export interface BodyMuscleDatum {
  muscle_group_name: string;
  session_count: number;
}

interface BodyMuscleDiagramProps {
  data: BodyMuscleDatum[];
}

export function BodyMuscleDiagram({ data }: BodyMuscleDiagramProps) {
  const activeRows = data.filter((d) => d.session_count > 0 && MARKERS[d.muscle_group_name]);

  return (
    <View style={{ width: WIDTH, height: HEIGHT }}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* Vücut silueti */}
        <Circle cx={170} cy={45} r={26} fill={ClubColors.yellow} />
        <Path d="M158,70 L182,70 L182,86 L158,86 Z" fill={ClubColors.yellow} />
        <Path d="M115,86 L225,86 L210,218 L130,218 Z" fill={ClubColors.yellow} />
        <Line x1={118} y1={92} x2={70} y2={225} stroke={ClubColors.yellow} strokeWidth={22} strokeLinecap="round" />
        <Line x1={222} y1={92} x2={270} y2={225} stroke={ClubColors.yellow} strokeWidth={22} strokeLinecap="round" />
        <Line x1={150} y1={216} x2={135} y2={450} stroke={ClubColors.yellow} strokeWidth={30} strokeLinecap="round" />
        <Line x1={190} y1={216} x2={205} y2={450} stroke={ClubColors.yellow} strokeWidth={30} strokeLinecap="round" />

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
                stroke={ClubColors.black}
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
        return (
          <View
            key={row.muscle_group_name}
            style={{
              position: 'absolute',
              top: marker.labelY - 16,
              left: isLeft ? LEFT_LABEL_X : RIGHT_LABEL_X,
              width: isLeft ? LEFT_LABEL_WIDTH : RIGHT_LABEL_WIDTH,
              alignItems: isLeft ? 'flex-end' : 'flex-start',
            }}>
            <View style={[styles.labelBacking, { alignItems: isLeft ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.labelName, { textAlign: isLeft ? 'right' : 'left' }]} numberOfLines={2}>
                {muscleGroupLabel(row.muscle_group_name)}
              </Text>
              <Text style={[styles.labelCount, { textAlign: isLeft ? 'right' : 'left' }]}>
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
