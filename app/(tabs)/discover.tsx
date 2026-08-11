import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { ConnectionCard } from '../../src/components/ConnectionCard';
import { theme } from '../../src/theme/tokens';
import { Sparkles, Wand2, ShieldCheck } from '../../src/components/Icons';
import { BuildPlanTabs } from '../../src/components/BuildPlanTabs';
import { SynapticFusion } from '../../src/components/SynapticFusion';

export default function DiscoverScreen() {
  const {
    connections,
    triggerSynapticFusion,
    isSynapticFusing,
    activeBuildPlan,
    isBuildPlanModalVisible,
    openBuildPlanModal,
    closeBuildPlanModal,
    openPaywall,
  } = useMemoryStore();

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerIconRow}>
          <Wand2 size={20} color={theme.colors.auroraPurple} />
          <Text style={styles.bannerTitle}>Serendipity Discovery Engine</Text>
          <View style={styles.slopGateHeaderTag}>
            <ShieldCheck size={11} color={theme.colors.auroraEmerald} />
            <Text style={styles.slopGateHeaderTagText}>HALLMARK SLOP-GATE ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.bannerSub}>
          MindMesh AI continuously vector-clusters your captured screenshots, notes, and voice clips to reveal product opportunities.
        </Text>

        <TouchableOpacity style={styles.triggerFusionBtn} onPress={triggerSynapticFusion}>
          <Sparkles size={14} color="#FFF" />
          <Text style={styles.triggerFusionText}>Trigger Synaptic Particle Fusion</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>ACTIVE DISCOVERED CONNECTIONS ({connections.length})</Text>

        {connections.map((conn) => (
          <ConnectionCard
            key={conn.id}
            connection={conn}
            onGenerateBuildPlan={openBuildPlanModal}
          />
        ))}
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  triggerFusionText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: '#FFF',
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
});
