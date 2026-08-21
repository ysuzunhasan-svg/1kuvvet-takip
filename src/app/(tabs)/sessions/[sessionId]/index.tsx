import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoleGate } from '@/components/RoleGate';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useSessionEntries } from '@/features/entries/hooks';
import { useSession } from '@/features/sessions/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  pre_activation: 'Salon Aktivasyonu',
  post_strength: 'Kuvvet Antrenmanı',
};

interface PlayerGroup {
  playerId: string;
  playerName: string;
  exerciseCount: number;
}

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: session } = useSession(sessionId);
  const { data: entries, isLoading } = useSessionEntries(sessionId);
  const theme = useTheme();

  const groups: PlayerGroup[] = [];
  if (entries) {
    const map = new Map<string, PlayerGroup>();
    for (const entry of entries) {
      const existing = map.get(entry.player_id);
      if (existing) {
        existing.exerciseCount += 1;
      } else {
        map.set(entry.player_id, {
          playerId: entry.player_id,
          playerName: entry.players.full_name,
          exerciseCount: 1,
        });
      }
    }
    groups.push(...map.values());
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {session ? (
          <View style={styles.header}>
            <ThemedText type="subtitle">{SESSION_TYPE_LABEL[session.session_type]}</ThemedText>
            <ThemedText themeColor="textSecondary">
              {format(parseISO(session.session_date), 'd MMMM yyyy, EEEE', { locale: tr })}
            </ThemedText>
            {session.notes ? <ThemedText type="small">{session.notes}</ThemedText> : null}
          </View>
        ) : null}

        <RoleGate>
          <Link href={`/sessions/${sessionId}/entry`} asChild>
            <Pressable style={[styles.addButton, { backgroundColor: theme.text }]}>
              <ThemedText themeColor="background" type="smallBold">
                + Oyuncu Kaydı Ekle
              </ThemedText>
            </Pressable>
          </Link>
        </RoleGate>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: Spacing.four }} />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.playerId}
            contentContainerStyle={{ gap: Spacing.two, paddingTop: Spacing.three, paddingBottom: Spacing.four }}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four, textAlign: 'center' }}>
                Bu antrenmanda henüz kayıt yok.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold">{item.playerName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.exerciseCount} hareket
                </ThemedText>
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
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  header: { gap: 4, marginBottom: Spacing.three },
  addButton: { paddingVertical: Spacing.three, borderRadius: Spacing.two, alignItems: 'center' },
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
