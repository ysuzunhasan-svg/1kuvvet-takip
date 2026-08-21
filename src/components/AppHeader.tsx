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
          <View>
            <ThemedText type="smallBold" themeColor="headerText" style={styles.titleLine}>
              İSTANBULSPOR
            </ThemedText>
            <ThemedText type="small" themeColor="headerText" style={styles.subtitleLine}>
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
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  logo: {
    width: 40,
    height: 40,
  },
  titleLine: {
    letterSpacing: 0.5,
  },
  subtitleLine: {
    opacity: 0.85,
  },
});
