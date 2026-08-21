import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ClubColors, Spacing } from '@/constants/theme';

// TODO: gerçek İstanbulspor logosu paylaşıldığında assets/images/club-logo.png
// olarak eklenip aşağıdaki placeholder yerine <Image source={require('@/assets/images/club-logo.png')} .../> kullanılacak.
export function AppHeader() {
  return (
    <View style={styles.wrapper}>
      <SafeAreaView edges={['top']}>
        <View style={styles.bar}>
          <View style={styles.logoPlaceholder}>
            <ThemedText type="smallBold" themeColor="onAccent" style={styles.logoText}>
              İS
            </ThemedText>
          </View>
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
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ClubColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 13,
  },
  titleLine: {
    letterSpacing: 0.5,
  },
  subtitleLine: {
    opacity: 0.85,
  },
});
