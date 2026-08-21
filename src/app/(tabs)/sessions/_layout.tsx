import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function SessionsStackLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBackground },
        headerTintColor: theme.headerText,
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="type/[sessionType]/index" options={{ title: 'Kartlar' }} />
      <Stack.Screen name="type/[sessionType]/card/[cardKey]" options={{ title: 'Antrenman Kartı' }} />
    </Stack>
  );
}
