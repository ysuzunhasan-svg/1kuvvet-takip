import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ClubColors, Spacing } from '@/constants/theme';

export function AppHeader() {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={['top']}>
        <View style={styles.bar}>
          <Image
            source={require('@/assets/images/club-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.titleBlock}>
            <ThemedText themeColor="headerText" style={styles.titleLine}>
              İSTANBULSPOR
            </ThemedText>
            <ThemedText themeColor="headerText" style={styles.subtitleLine}>
              Salon Takip Sistemi
            </ThemedText>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: ClubColors.black,
    zIndex: 10,
    // "Katman" hissi: içeriğin tamamı siyah olduğu için header'ın öne çıkması
    // için hafif bir gölge/derinlik veriyoruz.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  logo: {
    width: 52,
    height: 52,
  },
  titleBlock: {
    gap: 2,
  },
  titleLine: {
    fontSize: 21,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitleLine: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '600',
    opacity: 0.9,
  },
});
