import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoleGate } from '@/components/RoleGate';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSessions } from '@/features/sessions/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  pre_activation: 'Salon Aktivasyonu',
  post_strength: 'Kuvvet Antrenmanı',
};

export default function SessionsScreen() {
  const { data: sessions, isLoading } = useSessions();
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            Antrenmanlar
          </ThemedText>
          <RoleGate>
            <Link href="/sessions/new" asChild>
              <Pressable style={[styles.newButton, { backgroundColor: theme.text }]}>
                <ThemedText themeColor="background" type="smallBold">
                  + Yeni Antrenman
                </ThemedText>
              </Pressable>
            </Link>
          </RoleGate>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: Spacing.four }} />
        ) : (
          <FlatList
            data={sessions ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: Spacing.two, paddingBottom: Spacing.four }}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four, textAlign: 'center' }}>
                Henüz antrenman kaydı yok.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <Link href={`/sessions/${item.id}`} asChild>
                <Pressable style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                  <View>
                    <ThemedText type="smallBold">{SESSION_TYPE_LABEL[item.session_type]}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {format(parseISO(item.session_date), 'd MMMM yyyy, EEEE', { locale: tr })}
                    </ThemedText>
                  </View>
                </Pressable>
              </Link>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  title: {},
  newButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
