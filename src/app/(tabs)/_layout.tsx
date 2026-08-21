import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
      }}>
      <Tabs.Screen name="sessions" options={{ title: 'Antrenmanlar', headerShown: false }} />
      <Tabs.Screen name="players" options={{ title: 'Oyuncular', headerShown: false }} />
      <Tabs.Screen name="reports" options={{ title: 'Raporlar' }} />
    </Tabs>
  );
}
