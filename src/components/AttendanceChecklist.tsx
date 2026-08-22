import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAttendance, useSaveAttendance } from '@/features/attendance/hooks';
import { usePlayers } from '@/features/players/hooks';
import { useTheme } from '@/hooks/use-theme';

interface AttendanceChecklistProps {
  sessionId: string;
}

export function AttendanceChecklist({ sessionId }: AttendanceChecklistProps) {
  const theme = useTheme();
  const { data: players } = usePlayers();
  const { data: attendance } = useAttendance(sessionId);
  const saveAttendance = useSaveAttendance(sessionId);
  const [localAttendance, setLocalAttendance] = useState<Map<string, boolean> | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Kart/tarih değişince (farklı bir session'a geçildiğinde) yerel seçim sıfırlanır.
  useEffect(() => {
    setLocalAttendance(null);
    setJustSaved(false);
  }, [sessionId]);

  useEffect(() => {
    if (attendance && localAttendance === null) {
      const map = new Map<string, boolean>();
      attendance.forEach((row) => map.set(row.player_id, row.attended));
      setLocalAttendance(map);
    }
  }, [attendance, localAttendance]);

  function toggleLocal(playerId: string) {
    setJustSaved(false);
    setLocalAttendance((prev) => {
      const next = new Map(prev ?? []);
      next.set(playerId, !(prev?.get(playerId) ?? false));
      return next;
    });
  }

  async function handleSave() {
    if (!players) return;
    const rows = players.map((p) => ({ playerId: p.id, attended: localAttendance?.get(p.id) ?? false }));
    await saveAttendance.mutateAsync(rows);
    setJustSaved(true);
  }

  if (localAttendance === null) {
    return <ActivityIndicator style={{ marginTop: Spacing.three }} />;
  }

  return (
    <View style={styles.list}>
      {(players ?? []).map((player) => {
        const attended = localAttendance.get(player.id) ?? false;
        return (
          <Pressable
            key={player.id}
            onPress={() => toggleLocal(player.id)}
            style={{ ...styles.playerRow, backgroundColor: theme.backgroundElement }}>
            <ThemedText>{player.full_name}</ThemedText>
            <View
              style={{
                ...styles.checkbox,
                backgroundColor: attended ? theme.accent : 'transparent',
                borderColor: attended ? theme.accent : theme.textSecondary,
              }}>
              {attended ? (
                <ThemedText themeColor="onAccent" type="smallBold">
                  ✓
                </ThemedText>
              ) : null}
            </View>
          </Pressable>
        );
      })}
      {players && players.length === 0 ? (
        <ThemedText themeColor="textSecondary" style={{ textAlign: 'center', marginTop: Spacing.three }}>
          Henüz oyuncu eklenmemiş.
        </ThemedText>
      ) : (
        <Pressable
          onPress={handleSave}
          disabled={saveAttendance.isPending}
          style={{
            ...styles.saveButton,
            backgroundColor: theme.accent,
            opacity: saveAttendance.isPending ? 0.6 : 1,
          }}>
          <ThemedText themeColor="onAccent" type="smallBold">
            {saveAttendance.isPending ? 'Kaydediliyor...' : justSaved ? 'Kaydedildi ✓' : 'Kaydet'}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
