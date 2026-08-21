import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SESSION_TYPE_LABEL, SESSION_TYPES } from '@/constants/sessionTypes';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SessionsScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="subtitle" style={styles.title}>
          Antrenmanlar
        </ThemedText>

        <View style={styles.list}>
          {SESSION_TYPES.map((type) => (
            <Link key={type} href={`/sessions/type/${type}`} asChild>
              <Pressable style={{ ...styles.card, backgroundColor: theme.backgroundElement }}>
                <ThemedText type="smallBold" style={styles.cardLabel}>
                  {SESSION_TYPE_LABEL[type]}
                </ThemedText>
              </Pressable>
            </Link>
          ))}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  title: { marginBottom: Spacing.three },
  list: { gap: Spacing.three },
  card: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  cardLabel: {
    fontSize: 18,
  },
});
