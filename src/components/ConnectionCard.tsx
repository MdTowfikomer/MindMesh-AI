import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SerendipityConnection } from '../types/mindmesh';
import { Sparkles, CheckCircle2, FileCode, ChevronDown } from './Icons';
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
  const isFullyCompleted = totalActions > 0 && completedActions.length === totalActions;

  const handleShowNextSteps = async () => {
    setIsLoadingDeepDive(true);
    await deepDiveConnection(connection.id);
    setIsLoadingDeepDive(false);
  };

  return (
    <View style={styles.card}>
      {/* Header: Fit Tag & Space */}
      <View style={styles.header}>
        <View style={styles.fitPill}>
          <Text style={styles.fitText}>{(connection.confidenceScore * 100).toFixed(0)}% Match</Text>
        </View>
        <Text style={styles.contextSpaceText}>#{connection.contextSpace}</Text>
      </View>

      {/* Connection Title & Suggested Idea */}
      <Text style={styles.title}>{connection.title}</Text>
      <Text style={styles.buildIdea}>{connection.suggestedBuildIdea}</Text>

      {/* Pattern Discovered Synthesis */}
      {connection.actionableGuidance && (
        <View style={styles.guidanceBox}>
          <Text style={styles.guidanceParagraph}>{connection.actionableGuidance.paragraph1}</Text>
          <Text style={styles.guidanceParagraph}>{connection.actionableGuidance.paragraph2}</Text>
        </View>
      )}

      {/* Sourced Reference Quote */}
      {connection.evidenceProof.quoteSnippet ? (
        <Text style={styles.sourcedFromText}>
          "{connection.evidenceProof.quoteSnippet}"
        </Text>
      ) : null}

      {/* Interactive Action Steps */}
      {hasNextActions ? (
        <View style={styles.nextActionsBox}>
          <Text style={styles.nextActionsLabel}>RECOMMENDED NEXT STEPS</Text>
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
                  {isChecked && <CheckCircle2 size={12} color="#FFFFFF" />}
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
            <ActivityIndicator size="small" color="#94A3B8" />
          ) : (
            <Sparkles size={13} color="#94A3B8" />
          )}
          <Text style={styles.showNextStepsText}>
            {isLoadingDeepDive ? 'Generating steps...' : 'Show Actionable Next Steps'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Deep-Dive Disclosure Toggle */}
      <TouchableOpacity
        style={styles.deepDiveToggleBtn}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.deepDiveToggleText}>
          {isExpanded ? 'Hide technical proof' : 'Show technical proof & evidence'}
        </Text>
        <View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
          <ChevronDown size={14} color="#64748B" />
        </View>
      </TouchableOpacity>

      {/* Accordion Expanded Deep-Dive Content */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONNECTED BECAUSE:</Text>
            {connection.explainabilityWhy.map((reason, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{reason}</Text>
              </View>
            ))}
          </View>

          <View style={styles.evidenceBox}>
            <Text style={styles.evidenceLabel}>EVIDENCE:</Text>
            <Text style={styles.evidenceSources}>• {connection.evidenceProof.sourceTitle}</Text>
            <Text style={styles.evidenceSources}>• {connection.evidenceProof.targetTitle}</Text>
          </View>
        </View>
      )}

      {/* Action: View 4-Tab Build Spec */}
      <TouchableOpacity style={styles.buildPlanButton} activeOpacity={0.88} onPress={onGenerateBuildPlan}>
        <FileCode size={15} color="#F8FAFC" />
        <Text style={styles.buildPlanButtonText}>View 4-Tab Build Spec</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fitPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  contextSpaceText: {
    fontSize: 11,
    color: '#64748B',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 21,
    marginBottom: 6,
  },
  buildIdea: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  guidanceBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 6,
  },
  guidanceParagraph: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  sourcedFromText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#64748B',
    marginBottom: 12,
    fontFamily: 'serif',
  },
  nextActionsBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 6,
  },
  nextActionsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nextActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    gap: 8,
  },
  nextActionItemChecked: {
    opacity: 0.6,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  nextActionText: {
    flex: 1,
    fontSize: 12,
    color: '#E2E8F0',
  },
  nextActionTextChecked: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  showNextStepsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 12,
  },
  showNextStepsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  deepDiveToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 10,
  },
  deepDiveToggleText: {
    fontSize: 11,
    color: '#64748B',
  },
  expandedSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    color: '#64748B',
    fontSize: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  evidenceBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 6,
    gap: 2,
  },
  evidenceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  evidenceSources: {
    fontSize: 11,
    color: '#94A3B8',
  },
  buildPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#222530',
    borderRadius: 10,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  buildPlanButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
});
