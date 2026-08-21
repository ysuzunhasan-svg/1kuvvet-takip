import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePlayerEntries } from '@/features/entries/hooks';
import type { PlayerEntryWithSession } from '@/features/entries/api';
import { usePlayer } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

const SESSION_TYPE_LABEL: Record<SessionType, string> = {
  pre_activation: 'Salon Aktivasyonu',
  post_strength: 'Kuvvet Antrenmanı',
};

interface SessionGroup {
  sessionKey: string;
  date: string;
  type: SessionType;
  entries: PlayerEntryWithSession[];
}

function groupBySession(entries: PlayerEntryWithSession[]): SessionGroup[] {
  const map = new Map<string, SessionGroup>();
  for (const entry of entries) {
    const key = `${entry.session_id}`;
    const existing = map.get(key);
    if (existing) {
      existing.entries.push(entry);
    } else {
      map.set(key, {
        sessionKey: key,
        date: entry.training_sessions.session_date,
        type: entry.training_sessions.session_type as SessionType,
        entries: [entry],
      });
    }
  }
  return Array.from(map.values());
}

export default function PlayerDetailScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const { data: player } = usePlayer(playerId);
  const { data: entries, isLoading } = usePlayerEntries(playerId);
  const theme = useTheme();

  const groups = entries ? groupBySession(entries) : [];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {player ? (
          <View style={styles.header}>
            <ThemedText type="subtitle">{player.full_name}</ThemedText>
            {player.position ? <ThemedText themeColor="textSecondary">{player.position}</ThemedText> : null}
          </View>
        ) : null}

        <Link href={`/players/${playerId}/report`} asChild>
          <Pressable style={[styles.reportButton, { backgroundColor: theme.text }]}>
            <ThemedText themeColor="background" type="smallBold">
              Kümülatif Kas Grubu Raporu
            </ThemedText>
          </Pressable>
        </Link>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: Spacing.four }} />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.sessionKey}
            contentContainerStyle={{ gap: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.four }}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four, textAlign: 'center' }}>
                Bu oyuncu için henüz kayıt yok.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <View style={[styles.sessionCard, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="smallBold">{SESSION_TYPE_LABEL[item.type]}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ marginBottom: Spacing.two }}>
                  {format(parseISO(item.date), 'd MMMM yyyy, EEEE', { locale: tr })}
                </ThemedText>
                {item.entries.map((entry) => (
                  <ThemedText key={entry.id} type="small">
                    {entry.exercises.name} — {entry.sets}×{entry.reps_per_set}
                    {entry.load_kg ? ` @ ${entry.load_kg}kg` : ''}
                  </ThemedText>
                ))}
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
  reportButton: { paddingVertical: Spacing.three, borderRadius: Spacing.two, alignItems: 'center' },
  sessionCard: { padding: Spacing.three, borderRadius: Spacing.three, gap: 2 },
});
