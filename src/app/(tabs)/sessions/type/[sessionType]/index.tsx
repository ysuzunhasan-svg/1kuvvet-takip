import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SESSION_TYPE_LABEL } from '@/constants/sessionTypes';
import { Spacing } from '@/constants/theme';
import { useSessions } from '@/features/sessions/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

export default function SessionTypeListScreen() {
  const { sessionType } = useLocalSearchParams<{ sessionType: SessionType }>();
  const { data: sessions, isLoading } = useSessions(sessionType);
  const theme = useTheme();
  const label = SESSION_TYPE_LABEL[sessionType] ?? sessionType;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">{label}</ThemedText>
          <Link href={`/sessions/type/${sessionType}/new`} asChild>
            <Pressable style={{ ...styles.newButton, backgroundColor: theme.accent }}>
              <ThemedText themeColor="onAccent" type="smallBold">
                + Yeni Antrenman
              </ThemedText>
            </Pressable>
          </Link>
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
                Henüz {label} antrenmanı yok.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <Link href={`/sessions/${item.id}`} asChild>
                <Pressable style={{ ...styles.row, backgroundColor: theme.backgroundElement }}>
                  <ThemedText type="smallBold">
                    {format(parseISO(item.session_date), 'd MMMM yyyy, EEEE', { locale: tr })}
                  </ThemedText>
                  {item.notes ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.notes}
                    </ThemedText>
                  ) : null}
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
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
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
