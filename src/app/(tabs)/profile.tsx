import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoleGate } from '@/components/RoleGate';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { signOut } from '@/features/auth/api';
import { useAuth } from '@/features/auth/AuthProvider';
import { useTheme } from '@/hooks/use-theme';

const ROLE_LABEL: Record<string, string> = {
  entry: 'Atletik Performans (veri girişi)',
  viewer: 'İzleyici',
};

export default function ProfileScreen() {
  const { profile } = useAuth();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.card}>
          <ThemedText type="smallBold">{profile?.full_name || 'İsim belirtilmemiş'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {profile ? ROLE_LABEL[profile.role] : ''}
          </ThemedText>
        </View>

        <RoleGate>
          <Link href="/admin/users" asChild>
            <Pressable style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText>Kullanıcı Yönetimi</ThemedText>
            </Pressable>
          </Link>
        </RoleGate>

        <Pressable onPress={() => signOut()} style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText>Çıkış Yap</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three, gap: Spacing.three },
  card: { padding: Spacing.three, gap: 4 },
  row: { padding: Spacing.three, borderRadius: Spacing.three },
});
