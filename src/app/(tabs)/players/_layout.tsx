import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function PlayersStackLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
      }}>
      <Stack.Screen name="index" options={{ title: 'Oyuncular' }} />
      <Stack.Screen name="[playerId]/index" options={{ title: 'Oyuncu' }} />
      <Stack.Screen name="[playerId]/report" options={{ title: 'Kümülatif Rapor' }} />
    </Stack>
  );
}
