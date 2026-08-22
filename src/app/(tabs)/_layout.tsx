import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBackground },
        headerTintColor: theme.headerText,
        tabBarStyle: { backgroundColor: theme.headerBackground },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: '#8A8A8A',
        tabBarIcon: () => null,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
      }}>
      <Tabs.Screen name="calendar" options={{ title: 'Takvim', headerShown: false }} />
      <Tabs.Screen name="sessions" options={{ title: 'Antrenmanlar', headerShown: false }} />
      <Tabs.Screen name="players" options={{ title: 'Oyuncular', headerShown: false }} />
      <Tabs.Screen name="reports" options={{ title: 'Raporlar' }} />
    </Tabs>
  );
}
