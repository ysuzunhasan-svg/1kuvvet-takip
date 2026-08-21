import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { SearchPickerModal } from '@/components/SearchPickerModal';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Player } from '@/types/database';

interface PlayerPickerProps {
  players: Player[];
  value: string | null;
  onChange: (playerId: string) => void;
  placeholder?: string;
}

export function PlayerPicker({ players, value, onChange, placeholder = 'Oyuncu seç' }: PlayerPickerProps) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const selected = players.find((p) => p.id === value);

  return (
    <>
      <Pressable
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}
        onPress={() => setVisible(true)}>
        <ThemedText themeColor={selected ? 'text' : 'textSecondary'}>
          {selected ? selected.full_name : placeholder}
        </ThemedText>
      </Pressable>
      <SearchPickerModal
        visible={visible}
        title="Oyuncu seç"
        items={players}
        getKey={(p) => p.id}
        getLabel={(p) => p.full_name}
        getSubLabel={(p) => p.position}
        onSelect={(p) => {
          onChange(p.id);
          setVisible(false);
        }}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
});
