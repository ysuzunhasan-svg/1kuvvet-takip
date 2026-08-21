import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function PlayersStackLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBackground },
        headerTintColor: theme.headerText,
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Yeni Oyuncu', presentation: 'modal' }} />
      <Stack.Screen name="[playerId]/index" options={{ title: 'Oyuncu' }} />
      <Stack.Screen name="[playerId]/report" options={{ title: 'Kümülatif Rapor' }} />
    </Stack>
  );
}
