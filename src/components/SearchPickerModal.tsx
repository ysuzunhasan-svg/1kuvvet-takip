import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SearchPickerModalProps<T> {
  visible: boolean;
  title: string;
  items: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  getSubLabel?: (item: T) => string | undefined | null;
  onSelect: (item: T) => void;
  onClose: () => void;
}

export function SearchPickerModal<T>({
  visible,
  title,
  items,
  getKey,
  getLabel,
  getSubLabel,
  onSelect,
  onClose,
}: SearchPickerModalProps<T>) {
  const [query, setQuery] = useState('');
  const theme = useTheme();

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return items.filter((item) => getLabel(item).toLocaleLowerCase('tr-TR').includes(q));
  }, [items, query, getLabel]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="subtitle">{title}</ThemedText>
            <Pressable onPress={onClose} hitSlop={12}>
              <ThemedText type="linkPrimary">Kapat</ThemedText>
            </Pressable>
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ara..."
            placeholderTextColor={theme.textSecondary}
            autoFocus
            style={[styles.searchInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
          <FlatList
            data={filtered}
            keyExtractor={getKey}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
                ]}
                onPress={() => {
                  onSelect(item);
                  setQuery('');
                }}>
                <ThemedText>{getLabel(item)}</ThemedText>
                {getSubLabel?.(item) ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {getSubLabel(item)}
                  </ThemedText>
                ) : null}
              </Pressable>
            )}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                Sonuç yok
              </ThemedText>
            }
          />
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  searchInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
  row: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: 2,
  },
  empty: {
    paddingVertical: Spacing.four,
    textAlign: 'center',
  },
});
