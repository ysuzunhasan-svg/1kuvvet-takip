import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function PlayersScreen() {
  const { data: players, isLoading } = usePlayers();
  const [query, setQuery] = useState('');
  const theme = useTheme();

  const filtered = useMemo(() => {
    if (!players) return [];
    if (!query.trim()) return players;
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return players.filter((p) => p.full_name.toLocaleLowerCase('tr-TR').includes(q));
  }, [players, query]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Oyuncular</ThemedText>
          <Link href="/players/new" asChild>
            <Pressable style={{ ...styles.newButton, backgroundColor: theme.accent }}>
              <ThemedText themeColor="onAccent" type="smallBold">
                + Oyuncu Ekle
              </ThemedText>
            </Pressable>
          </Link>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Oyuncu ara..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.search, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        />

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: Spacing.four }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: Spacing.two, paddingBottom: Spacing.four }}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.four, textAlign: 'center' }}>
                Oyuncu bulunamadı.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <Link href={`/players/${item.id}`} asChild>
                <Pressable style={{ ...styles.row, backgroundColor: theme.backgroundElement }}>
                  <View>
                    <ThemedText type="smallBold">{item.full_name}</ThemedText>
                    {item.position ? (
                      <ThemedText type="small" themeColor="textSecondary">
                        {item.position}
                      </ThemedText>
                    ) : null}
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
  search: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.three,
  },
  row: { padding: Spacing.three, borderRadius: Spacing.three },
});
