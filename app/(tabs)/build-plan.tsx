import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { theme } from '../../src/theme/tokens';
import { FileCode, Sparkles, ArrowRight } from '../../src/components/Icons';
import { BuildPlanTabs } from '../../src/components/BuildPlanTabs';

export default function BuildPlanScreen() {
  const { activeBuildPlan, isBuildPlanModalVisible, openBuildPlanModal, closeBuildPlanModal, openPaywall } = useMemoryStore();

  if (!activeBuildPlan) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={styles.heroBadge}>
              <Sparkles size={12} color={theme.colors.auroraAmber} />
              <Text style={styles.heroBadgeText}>HERO SPEC OUTPUT</Text>
            </View>
            <Text style={styles.connectedCount}>3 Memories Synthesized</Text>
          </View>

          <Text style={styles.heroTitle}>{activeBuildPlan.title}</Text>
          <Text style={styles.heroSub}>{activeBuildPlan.subtitle}</Text>

          <TouchableOpacity style={styles.openPlanButton} onPress={openBuildPlanModal}>
            <FileCode size={16} color="#FFF" />
            <Text style={styles.openPlanText}>Open Full 4-Tab Executable Spec</Text>
            <ArrowRight size={14} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Executive Summary Cards */}
        <Text style={styles.sectionTitle}>SYNTHESIZED ARCHITECTURE SUMMARY</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.gridCard}>
            <Text style={styles.gridCardTitle}>PRD & Features</Text>
            <Text style={styles.gridCardSub}>4 P0/P1 Features Defined</Text>
          </View>

          <View style={styles.gridCard}>
            <Text style={styles.gridCardTitle}>Tech Stack Schema</Text>
            <Text style={styles.gridCardSub}>Expo + Skia + RevenueCat</Text>
          </View>

          <View style={styles.gridCard}>
            <Text style={styles.gridCardTitle}>RevenueCat Paywall</Text>
            <Text style={styles.gridCardSub}>3-Page HAMM Narrative Flow</Text>
          </View>

          <View style={styles.gridCard}>
            <Text style={styles.gridCardTitle}>Dev Checklist</Text>
            <Text style={styles.gridCardSub}>5 Actionable Milestones</Text>
          </View>
        </View>
      </ScrollView>

      <BuildPlanTabs
        plan={activeBuildPlan}
        visible={isBuildPlanModalVisible}
        onClose={closeBuildPlanModal}
        onOpenPaywall={openPaywall}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderColor: theme.colors.auroraAmber,
    borderWidth: 1.5,
    padding: 20,
    ...theme.shadows.card,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.xs,
  },
  heroBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraAmber,
  },
  connectedCount: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  heroTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 18,
    lineHeight: 16,
  },
  openPlanButton: {
    backgroundColor: theme.colors.auroraAmber,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
  },
  openPlanText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: '#000',
  },
  sectionTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: 12,
  },
  gridCardTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  gridCardSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
