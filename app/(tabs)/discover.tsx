import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { ConnectionCard } from '../../src/components/ConnectionCard';
import { theme } from '../../src/theme/tokens';
import { Sparkles, Wand2, ShieldCheck } from '../../src/components/Icons';
import { BuildPlanTabs } from '../../src/components/BuildPlanTabs';
import { SynapticFusion } from '../../src/components/SynapticFusion';

export default function DiscoverScreen() {
  const {
    memories,
    connections,
    generateConnections,
    isGeneratingConnections,
    isSynapticFusing,
    activeBuildPlan,
    isBuildPlanModalVisible,
    openBuildPlanModal,
    closeBuildPlanModal,
    openPaywall,
  } = useMemoryStore();

  // Only count user-uploaded memories (not seed data)
  const userMemoriesCount = memories.filter(m => /^mem-\d+$/.test(m.id)).length;

  return (
    <View style={styles.container}>
      {/* Clean Minimalist Header */}
      <View style={styles.headerArea}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.screenTitle}>Serendipity Engine</Text>
        </View>

        <TouchableOpacity
          style={[styles.discoverBtn, isGeneratingConnections && styles.discoverBtnDisabled]}
          onPress={generateConnections}
          disabled={isGeneratingConnections || userMemoriesCount < 2}
          activeOpacity={0.85}
        >
          {isGeneratingConnections ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Sparkles size={14} color="#FFF" />
          )}
          <Text style={styles.discoverBtnText}>
            {isGeneratingConnections
              ? 'Synthesizing Vectors...'
              : userMemoriesCount < 2
                ? 'Save 2+ memories to discover'
                : 'Discover New Connections'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {connections.length > 0 && (
          <Text style={styles.sectionHeader}>DISCOVERED CONNECTIONS ({connections.length})</Text>
        )}

        {connections.map((conn) => (
          <ConnectionCard
            key={conn.id}
            connection={conn}
            onGenerateBuildPlan={openBuildPlanModal}
          />
        ))}

        {connections.length === 0 && !isGeneratingConnections && (
          <View style={styles.emptyState}>
            <Wand2 size={28} color={theme.colors.textDim} />
            <Text style={styles.emptyTitle}>No connections yet</Text>
            <Text style={styles.emptySub}>
              {userMemoriesCount < 2
                ? 'Save 2+ screenshots, notes, or links — then tap Discover.'
                : 'Tap "Discover New Connections" above to find patterns.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Build Plan Modal */}
      <BuildPlanTabs
        plan={activeBuildPlan}
        visible={isBuildPlanModalVisible}
        onClose={closeBuildPlanModal}
        onOpenPaywall={openPaywall}
      />

      <SynapticFusion isVisible={isSynapticFusing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  headerArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    gap: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.textPrimary,
    letterSpacing: -0.3,
  },
  proTag: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proTagText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: '#D97706',
  },
  discoverBtn: {
    backgroundColor: theme.colors.auroraPurple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignSelf: 'flex-start',
  },
  discoverBtnDisabled: {
    opacity: 0.6,
  },
  discoverBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  emptySub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 17,
  },
});
