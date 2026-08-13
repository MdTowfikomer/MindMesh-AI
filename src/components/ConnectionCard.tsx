import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SerendipityConnection } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { Sparkles, CheckCircle2, FileCode, ArrowRight, ShieldCheck, ChevronDown } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';

interface ConnectionCardProps {
  connection: SerendipityConnection;
  onGenerateBuildPlan: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, onGenerateBuildPlan }) => {
  const { toggleNextAction, deepDiveConnection } = useMemoryStore();
  const [isExpanded, setIsExpanded] = useState(connection.isDeepDiveExpanded || false);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(false);

  const completedActions = connection.completedNextActions || [];
  const hasNextActions = connection.nextActions && connection.nextActions.length > 0;
  const totalActions = connection.nextActions?.length || 0;
  const progressRatio = totalActions > 0 ? completedActions.length / totalActions : 0;
  const isFullyCompleted = totalActions > 0 && completedActions.length === totalActions;

  const handleShowNextSteps = async () => {
    setIsLoadingDeepDive(true);
    await deepDiveConnection(connection.id);
    setIsLoadingDeepDive(false);
  };

  return (
    <View style={[styles.card, isFullyCompleted && styles.completedCard]}>
      {/* Editorial Title & Match Tag */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{(connection.confidenceScore * 100).toFixed(0)}% MATCH</Text>
        </View>

        <Text style={styles.contextSpaceText}>#{connection.contextSpace}</Text>
      </View>

      {/* Connection Title */}
      <Text style={styles.title}>{connection.title}</Text>
      <Text style={styles.buildIdea}>{connection.suggestedBuildIdea}</Text>

      {/* Pattern Discovered Synthesis */}
      {connection.actionableGuidance && (
        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceParagraph}>{connection.actionableGuidance.paragraph1}</Text>
          <Text style={styles.guidanceParagraph}>{connection.actionableGuidance.paragraph2}</Text>
        </View>
      )}

      {/* Sourced From Reference Text */}
      {connection.evidenceProof.quoteSnippet ? (
        <Text style={styles.sourcedFromText}>
          🔗 {connection.evidenceProof.quoteSnippet}
        </Text>
      ) : null}

      {/* Interactive Action Steps — Stage 2 loaded on demand */}
      {hasNextActions ? (
        <View style={styles.nextActionsBox}>
          <View style={styles.nextActionsHeader}>
            <Text style={styles.nextActionsLabel}>RECOMMENDED NEXT STEPS (TAP TO COMPLETE):</Text>
            {isFullyCompleted && <Text style={styles.shippedTag}>✓ READY TO SHIP</Text>}
          </View> 

          {connection.nextActions!.map((actionText, idx) => {
            const isChecked = completedActions.includes(actionText);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.nextActionItem, isChecked && styles.nextActionItemChecked]}
                onPress={() => toggleNextAction(connection.id, actionText)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <CheckCircle2 size={13} color="#FFFFFF" />}
                </View>
                <Text style={[styles.nextActionText, isChecked && styles.nextActionTextChecked]}>
                  {actionText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.showNextStepsBtn}
          onPress={handleShowNextSteps}
          disabled={isLoadingDeepDive}
          activeOpacity={0.8}
        >
          {isLoadingDeepDive ? (
            <ActivityIndicator size="small" color={theme.colors.auroraPurple} />
          ) : (
            <CheckCircle2 size={14} color={theme.colors.auroraPurple} />
          )}
          <Text style={styles.showNextStepsText}>
            {isLoadingDeepDive ? 'Generating Next Steps...' : 'Show 3 Actionable Next Steps'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Progressive Disclosure Toggle ("Deep Dive into Specs") */}
      <TouchableOpacity
        style={styles.deepDiveToggleBtn}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.deepDiveToggleText}>
          {isExpanded ? 'Hide Technical Proof & Evidence' : '🔍 Deep Dive into Technical Proof & Evidence'}
        </Text>
        <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
          <ChevronDown size={14} color={theme.colors.auroraIndigo} />
        </View>
      </TouchableOpacity>

      {/* Accordion Expanded Deep-Dive Content */}
      {isExpanded && (
        <View style={styles.expandedSection}>
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
        </View>
      )}

      {/* Hero Action: View Full 4-Tab Technical Build Spec */}
      <TouchableOpacity style={styles.buildPlanButton} activeOpacity={0.88} onPress={onGenerateBuildPlan}>
        <FileCode size={16} color="#FFF" />
        <Text style={styles.buildPlanButtonText}>View Complete 4-Tab Build Spec</Text>
        <ArrowRight size={14} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // Clean White Swiss Surface
    borderRadius: theme.radii.lg,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 16,
    ...theme.shadows.card,
  },
  completedCard: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: '#FAFDFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: theme.radii.xs,
  },
  slopBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.auroraEmerald,
    letterSpacing: 0.4,
  },
  contextSpaceText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  progressBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  progressBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  progressBadgeTextDone: {
    color: theme.colors.auroraEmerald,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 21,
    color: theme.colors.textPrimary,
    lineHeight: 25,
    letterSpacing: theme.tracking.tight,
    marginBottom: 4,
  },
  buildIdea: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 13,
    color: theme.colors.auroraCyan,
    marginBottom: 14,
  },
  guidanceBox: {
    backgroundColor: 'rgba(109, 40, 217, 0.04)',
    borderColor: 'rgba(109, 40, 217, 0.12)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    padding: 12,
    marginBottom: 14,
  },
  guidanceLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraPurple,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  guidanceParagraph: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  sourcedFromText: {
    fontFamily: theme.fonts.sans,
    fontSize: 10,
    fontStyle: 'italic',
    color: theme.colors.textMuted,
    marginBottom: 12,
    lineHeight: 14,
  },
  showNextStepsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(67, 56, 202, 0.06)',
    borderColor: 'rgba(67, 56, 202, 0.2)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    paddingVertical: 11,
    marginBottom: 14,
  },
  showNextStepsText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: theme.colors.auroraPurple,
  },
  nextActionsBox: {
    backgroundColor: 'rgba(67, 56, 202, 0.04)',
    borderColor: 'rgba(67, 56, 202, 0.15)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    padding: 12,
    marginBottom: 14,
  },
  nextActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nextActionsLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraIndigo,
    letterSpacing: 0.8,
  },
  shippedTag: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.auroraEmerald,
  },
  nextActionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: theme.radii.xs,
    marginBottom: 4,
  },
  nextActionItemChecked: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.colors.auroraIndigo,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.auroraEmerald,
    borderColor: theme.colors.auroraEmerald,
  },
  nextActionText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  nextActionTextChecked: {
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  deepDiveToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderRadius: theme.radii.xs,
    marginBottom: 12,
  },
  deepDiveToggleText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: theme.colors.auroraIndigo,
  },
  expandedSection: {
    marginTop: 4,
    marginBottom: 10,
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
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    borderRadius: theme.radii.sm,
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.auroraRose,
    marginBottom: 12,
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
