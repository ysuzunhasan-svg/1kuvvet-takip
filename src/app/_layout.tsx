import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <AppHeader />
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
