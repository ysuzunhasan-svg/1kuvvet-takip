import { Link, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getCardsForType } from '@/constants/cards';
import { SESSION_TYPE_LABEL } from '@/constants/sessionTypes';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

export default function SessionTypeCardsScreen() {
  const { sessionType, date } = useLocalSearchParams<{ sessionType: SessionType; date?: string }>();
  const theme = useTheme();
  const label = SESSION_TYPE_LABEL[sessionType] ?? sessionType;
  const cards = getCardsForType(sessionType);
  const cardHrefSuffix = date ? `?date=${date}` : '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="subtitle" style={styles.title}>
          {label}
        </ThemedText>

        {cards.length === 0 ? (
          <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four, textAlign: 'center' }}>
            {label} için henüz kart yüklenmedi.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {cards.map((card) => (
              <Link key={card.key} href={`/sessions/type/${sessionType}/card/${card.key}${cardHrefSuffix}`} asChild>
                <Pressable style={{ ...styles.card, backgroundColor: theme.backgroundElement }}>
                  <Image source={card.image} style={styles.thumb} resizeMode="cover" />
                  <View style={styles.cardTextBlock}>
                    <ThemedText type="smallBold">{card.dayCode}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {card.title}
                    </ThemedText>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  title: { marginBottom: Spacing.three },
  list: { gap: Spacing.three },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: Spacing.two,
  },
  cardTextBlock: {
    flex: 1,
    gap: 2,
  },
});
