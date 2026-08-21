/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// İstanbulspor kulüp renkleri: siyah + sarı.
export const ClubColors = {
  black: '#0A0A0A',
  yellow: '#FFD100',
} as const;

// Marka kararı: uygulama her zaman siyah zeminde, sistem light/dark ayarından
// bağımsız (İstanbulspor kimliği sabit kalsın diye light/dark aynı paleti kullanır).
const clubTheme = {
  text: '#ffffff',
  background: ClubColors.black,
  backgroundElement: '#1A1A1A',
  backgroundSelected: '#3A3200',
  textSecondary: '#A8A8A8',
  accent: ClubColors.yellow,
  onAccent: ClubColors.black,
  headerBackground: ClubColors.black,
  headerText: ClubColors.yellow,
} as const;

export const Colors = {
  light: clubTheme,
  dark: clubTheme,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
