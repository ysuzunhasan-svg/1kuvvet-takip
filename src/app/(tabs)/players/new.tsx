import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCreatePlayer } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function NewPlayerScreen() {
  const theme = useTheme();
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createPlayer = useCreatePlayer();

  async function handleSubmit() {
    setError(null);
    try {
      await createPlayer.mutateAsync({ full_name: fullName.trim(), position: position.trim() });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Oyuncu eklenemedi');
    }
  }

  const disabled = createPlayer.isPending || !fullName.trim();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.field}>
          <ThemedText type="smallBold">İsim Soyisim</ThemedText>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="örn. Ahmet Yılmaz"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">Mevki (opsiyonel)</ThemedText>
          <TextInput
            value={position}
            onChangeText={setPosition}
            placeholder="örn. Orta Saha"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
        </View>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={disabled}
          style={{
            ...styles.button,
            backgroundColor: theme.text,
            opacity: disabled ? 0.5 : 1,
          }}>
          <ThemedText themeColor="background" type="smallBold">
            {createPlayer.isPending ? 'Ekleniyor...' : 'Oyuncuyu Ekle'}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three, gap: Spacing.four },
  field: { gap: Spacing.two },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  error: { color: '#e34948' },
  button: { borderRadius: Spacing.two, paddingVertical: Spacing.three, alignItems: 'center' },
});
