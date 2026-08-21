import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSetUserRole, useUsers } from '@/features/admin/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { Role } from '@/types/database';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'entry', label: 'Girici' },
  { value: 'viewer', label: 'İzleyici' },
];

export default function AdminUsersScreen() {
  const { session, loading, isEntry } = useAuth();
  const { data: users, isLoading } = useUsers();
  const setUserRole = useSetUserRole();
  const theme = useTheme();

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!session) return <Redirect href="/login" />;

  if (!isEntry) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Kullanıcı Yönetimi' }} />
        <SafeAreaView style={styles.safeArea}>
          <ThemedText themeColor="textSecondary">Bu sayfaya erişim yetkiniz yok.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Kullanıcı Yönetimi', headerStyle: { backgroundColor: theme.background }, headerTintColor: theme.text }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: Spacing.four }} />
        ) : (
          <FlatList
            data={users ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: Spacing.two, paddingTop: Spacing.three, paddingBottom: Spacing.four }}
            renderItem={({ item }) => (
              <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold">{item.full_name || item.email}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.email}
                  </ThemedText>
                </View>
                <View style={styles.roleButtons}>
                  {ROLE_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => setUserRole.mutate({ userId: item.id, role: option.value })}
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor:
                            item.role === option.value ? theme.text : theme.backgroundSelected,
                        },
                      ]}>
                      <ThemedText
                        type="small"
                        themeColor={item.role === option.value ? 'background' : 'text'}>
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  roleButtons: { flexDirection: 'row', gap: Spacing.two },
  roleButton: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, borderRadius: Spacing.two },
});
