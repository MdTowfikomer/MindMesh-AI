import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { RediscoverySwipeDeck } from '../../src/components/RediscoverySwipeDeck';

export default function SerendipityScreen() {
  const { memories, deleteMemory } = useMemoryStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rediscovery</Text>
        <Text style={styles.headerSub}>
          Review, curate, or clear thoughts from your mind vault one card at a time.
        </Text>
      </View>

      {/* Rediscovery Deck Canvas */}
      <View style={styles.deckCanvas}>
        <RediscoverySwipeDeck
          memories={memories}
          onKeepMemory={() => {}}
          onTrashMemory={(mem) => deleteMemory(mem.id)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101114',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  deckCanvas: {
    flex: 1,
  },
});
