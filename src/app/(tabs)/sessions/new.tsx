import { format, subDays } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCreateSession } from '@/features/sessions/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { SessionType } from '@/types/database';

const TYPE_OPTIONS: { value: SessionType; label: string }[] = [
  { value: 'pre_activation', label: 'Salon Aktivasyonu (Antrenman Öncesi)' },
  { value: 'post_strength', label: 'Kuvvet Antrenmanı (Antrenman Sonrası)' },
];

export default function NewSessionScreen() {
  const theme = useTheme();
  const [sessionDate, setSessionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sessionType, setSessionType] = useState<SessionType>('post_strength');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createSession = useCreateSession();

  async function handleSubmit() {
    setError(null);
    try {
      const created = await createSession.mutateAsync({
        session_date: sessionDate,
        session_type: sessionType,
        notes: notes.trim() || undefined,
      });
      router.replace(`/sessions/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Antrenman oluşturulamadı');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.field}>
          <ThemedText type="smallBold">Tarih</ThemedText>
          <TextInput
            value={sessionDate}
            onChangeText={setSessionDate}
            placeholder="YYYY-AA-GG"
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
          <View style={styles.quickDateRow}>
            <Pressable onPress={() => setSessionDate(format(new Date(), 'yyyy-MM-dd'))}>
              <ThemedText type="link" themeColor="textSecondary">
                Bugün
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setSessionDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'))}>
              <ThemedText type="link" themeColor="textSecondary">
                Dün
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">Tip</ThemedText>
          {TYPE_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setSessionType(option.value)}
              style={[
                styles.typeOption,
                {
                  backgroundColor: sessionType === option.value ? theme.backgroundSelected : theme.backgroundElement,
                },
              ]}>
              <ThemedText>{option.label}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.field}>
          <ThemedText type="smallBold">Not (opsiyonel)</ThemedText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            style={[styles.input, styles.notesInput, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
        </View>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={createSession.isPending || !sessionDate}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.text, opacity: createSession.isPending ? 0.5 : pressed ? 0.8 : 1 },
          ]}>
          <ThemedText themeColor="background" type="smallBold">
            {createSession.isPending ? 'Oluşturuluyor...' : 'Antrenmanı Oluştur'}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, gap: Spacing.four, paddingTop: Spacing.three },
  field: { gap: Spacing.two },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  quickDateRow: { flexDirection: 'row', gap: Spacing.three },
  typeOption: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  error: { color: '#e34948' },
  button: {
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
