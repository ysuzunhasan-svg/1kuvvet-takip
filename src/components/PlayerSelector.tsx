import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';

interface PlayerSelectorProps {
  selectedPlayerId: string | undefined;
  onSelectPlayer: (playerId: string) => void;
  isWide: boolean;
}

// Oyuncular ve Raporlar sekmelerinde aynı görünüme sahip sol/üst oyuncu
// seçici — tek yerde tutulup her ikisinde de kullanılıyor.
export function PlayerSelector({ selectedPlayerId, onSelectPlayer, isWide }: PlayerSelectorProps) {
  const theme = useTheme();
  const { data: players, isLoading } = usePlayers();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!players) return [];
    if (!query.trim()) return players;
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return players.filter((p) => p.full_name.toLocaleLowerCase('tr-TR').includes(q));
  }, [players, query]);

  return (
    <View
      style={[
        styles.sidebar,
        isWide ? styles.sidebarWide : styles.sidebarNarrow,
        { backgroundColor: theme.backgroundElement },
      ]}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Oyuncu ara..."
        placeholderTextColor={theme.textSecondary}
        style={[styles.search, { color: theme.text, backgroundColor: theme.background }]}
      />
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: Spacing.three }} />
      ) : (
        <ScrollView style={isWide ? styles.playerListWide : styles.playerListNarrow}>
          <View style={{ gap: Spacing.one, paddingBottom: Spacing.two }}>
            {filtered.map((p) => {
              const selected = p.id === selectedPlayerId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => onSelectPlayer(p.id)}
                  style={{
                    ...styles.playerRow,
                    backgroundColor: selected ? theme.accent : theme.background,
                  }}>
                  <ThemedText type="small" themeColor={selected ? 'onAccent' : 'text'}>
                    {p.full_name}
                  </ThemedText>
                </Pressable>
              );
            })}
            {filtered.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={{ padding: Spacing.two }}>
                Oyuncu bulunamadı.
              </ThemedText>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { borderRadius: Spacing.three, padding: Spacing.three },
  sidebarWide: { width: 260 },
  sidebarNarrow: { width: '100%' },
  search: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    marginBottom: Spacing.two,
  },
  playerListWide: { flex: 1 },
  playerListNarrow: { maxHeight: 220 },
  playerRow: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, borderRadius: Spacing.two },
});
