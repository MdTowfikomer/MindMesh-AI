import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SerendipityConnection } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { Sparkles, CheckCircle2, FileCode, ArrowRight, ShieldCheck } from './Icons';

interface ConnectionCardProps {
  connection: SerendipityConnection;
  onGenerateBuildPlan: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, onGenerateBuildPlan }) => {
  return (
    <View style={styles.card}>
      {/* Aurora Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Sparkles size={12} color={theme.colors.auroraPurple} />
            <Text style={styles.badgeText}>{(connection.confidenceScore * 100).toFixed(0)}% SYNAPTIC MATCH</Text>
          </View>
          <View style={styles.slopBadge}>
            <ShieldCheck size={11} color={theme.colors.auroraEmerald} />
            <Text style={styles.slopBadgeText}>HALLMARK: {connection.slopGateScore ?? 100}% CLEAN</Text>
          </View>
        </View>

        <Text style={styles.contextSpace}>#{connection.contextSpace}</Text>
      </View>

      {/* Connection Title */}
      <Text style={styles.title}>{connection.title}</Text>
      <Text style={styles.buildIdea}>{connection.suggestedBuildIdea}</Text>

      {/* Actionable Founder Guidance (2 Paragraphs) */}
      {connection.actionableGuidance && (
        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceLabel}>PATTERN DISCOVERED (WHAT THIS MEANS):</Text>
          <Text style={styles.guidanceParagraph}>{connection.actionableGuidance.paragraph1}</Text>
          <Text style={styles.guidanceParagraph}>{connection.actionableGuidance.paragraph2}</Text>
        </View>
      )}

      {/* 3 Concrete Next Actions */}
      {connection.nextActions && (
        <View style={styles.nextActionsBox}>
          <Text style={styles.nextActionsLabel}>RECOMMENDED NEXT STEPS:</Text>
          {connection.nextActions.map((action, idx) => (
            <View key={idx} style={styles.nextActionItem}>
              <CheckCircle2 size={13} color={theme.colors.auroraIndigo} style={{ marginTop: 2 }} />
              <Text style={styles.nextActionText}>{action}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Explainability Section: WHY */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONNECTED BECAUSE (EXPLAINABILITY):</Text>
        {connection.explainabilityWhy.map((reason, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <CheckCircle2 size={12} color={theme.colors.auroraEmerald} style={{ marginTop: 2 }} />
            <Text style={styles.bulletText}>{reason}</Text>
          </View>
        ))}
      </View>

      {/* Evidence Section: PROOF */}
      <View style={styles.evidenceBox}>
        <Text style={styles.evidenceLabel}>VERIFIED EVIDENCE PROOF:</Text>
        <Text style={styles.evidenceSources}>
          • {connection.evidenceProof.sourceTitle} ({connection.evidenceProof.sourceDate})
        </Text>
        <Text style={styles.evidenceSources}>
          • {connection.evidenceProof.targetTitle} ({connection.evidenceProof.targetDate})
        </Text>
        <Text style={styles.quoteSnippet}>"{connection.evidenceProof.quoteSnippet}"</Text>
      </View>

      {/* Hero Action: View Full PRD Spec */}
      <TouchableOpacity style={styles.buildPlanButton} activeOpacity={0.85} onPress={onGenerateBuildPlan}>
        <FileCode size={16} color="#FFF" />
        <Text style={styles.buildPlanButtonText}>View Complete Technical Build Spec</Text>
        <ArrowRight size={14} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderColor: theme.colors.auroraIndigo,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.auroraGlow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.xs,
  },
  badgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraPurple,
  },
  slopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.radii.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  slopBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.auroraEmerald,
    letterSpacing: 0.4,
  },
  contextSpace: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    letterSpacing: theme.tracking.tight,
    marginBottom: theme.spacing.xxs,
  },
  buildIdea: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 13,
    color: theme.colors.auroraCyan,
    letterSpacing: theme.tracking.normal,
    marginBottom: theme.spacing.md,
  },
  guidanceBox: {
    backgroundColor: 'rgba(109, 40, 217, 0.04)',
    borderColor: 'rgba(109, 40, 217, 0.12)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  guidanceLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraPurple,
    letterSpacing: theme.tracking.wide,
    marginBottom: theme.spacing.xxs,
  },
  guidanceParagraph: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    letterSpacing: theme.tracking.normal,
    marginBottom: theme.spacing.xxs,
  },
  nextActionsBox: {
    backgroundColor: 'rgba(67, 56, 202, 0.04)',
    borderColor: 'rgba(67, 56, 202, 0.12)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  nextActionsLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraIndigo,
    letterSpacing: theme.tracking.wide,
    marginBottom: theme.spacing.xxs,
  },
  nextActionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xxs,
  },
  nextActionText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 17,
    letterSpacing: theme.tracking.normal,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  bulletText: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  evidenceBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radii.sm,
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.auroraRose,
    marginBottom: 14,
  },
  evidenceLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.auroraRose,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  evidenceSources: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  quoteSnippet: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  buildPlanButton: {
    backgroundColor: theme.colors.auroraIndigo,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
  },
  buildPlanButtonText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
