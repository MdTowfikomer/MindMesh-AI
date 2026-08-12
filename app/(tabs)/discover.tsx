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
      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIconRow}>
          <Wand2 size={18} color={theme.colors.auroraPurple} />
          <Text style={styles.bannerTitle}>Connection Engine</Text>
          <View style={styles.slopGateHeaderTag}>
            <ShieldCheck size={11} color={theme.colors.auroraEmerald} />
            <Text style={styles.slopGateHeaderTagText}>SLOP-GATE ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.bannerSub}>
          Discover hidden patterns across your saved thoughts, screenshots, and notes.
        </Text>

        <TouchableOpacity
          style={[styles.triggerFusionBtn, isGeneratingConnections && styles.triggerFusionBtnDisabled]}
          onPress={generateConnections}
          disabled={isGeneratingConnections || userMemoriesCount < 2}
          activeOpacity={0.8}
        >
          {isGeneratingConnections ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Sparkles size={14} color="#FFF" />
          )}
          <Text style={styles.triggerFusionText}>
            {isGeneratingConnections
              ? 'Discovering Patterns...'
              : userMemoriesCount < 2
                ? 'Save 2+ items first'
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
  banner: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderBottomWidth: 1,
    padding: 16,
    gap: 8,
  },
  bannerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  slopGateHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  slopGateHeaderTagText: {
    fontSize: 8,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraEmerald,
    letterSpacing: 0.5,
  },
  bannerSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  triggerFusionBtn: {
    backgroundColor: theme.colors.auroraPurple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radii.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  triggerFusionBtnDisabled: {
    opacity: 0.7,
  },
  triggerFusionText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#FFF',
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
