import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { RediscoverySwipeDeck } from '../../src/components/RediscoverySwipeDeck';
import { theme } from '../../src/theme/tokens';
import { Sparkles } from '../../src/components/Icons';

export default function SerendipityScreen() {
  const { memories, deleteMemory } = useMemoryStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Sparkles size={18} color={theme.colors.auroraPurple} />
        <Text style={styles.headerTitle}>Serendipity</Text>
      </View>
      <Text style={styles.headerSub}>
        Rediscover forgotten gems. Swipe right to keep, left to discard.
      </Text>

      {/* Swipe Deck */}
      <RediscoverySwipeDeck
        memories={memories}
        onKeepMemory={() => {}}
        onTrashMemory={(mem) => deleteMemory(mem.id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  headerSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textMuted,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
});
