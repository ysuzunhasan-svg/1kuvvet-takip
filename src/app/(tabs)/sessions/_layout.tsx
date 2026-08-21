import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function SessionsStackLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
      }}>
      <Stack.Screen name="index" options={{ title: 'Antrenmanlar' }} />
      <Stack.Screen name="new" options={{ title: 'Yeni Antrenman', presentation: 'modal' }} />
      <Stack.Screen name="[sessionId]/index" options={{ title: 'Antrenman' }} />
      <Stack.Screen name="[sessionId]/entry" options={{ title: 'Kayıt Ekle', presentation: 'modal' }} />
    </Stack>
  );
}
