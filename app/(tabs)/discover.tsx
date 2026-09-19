import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { SynapticFusion } from '../../src/components/SynapticFusion';
import {
  Sparkles,
  Compass,
  ChevronRight,
  Circle,
  CheckCircle2,
  Key,
  X,
} from '../../src/components/Icons';

import {
  isEligibleForDiscovery,
  isInvalidConnection,
} from '../../src/services/knowledgeGraph';

export default function DiscoverScreen() {
  const {
    memories,
    connections,
    isGeneratingConnections,
    isSynapticFusing,
    generateConnections,
    toggleNextAction,
    isByokNudgeDismissed,
    dismissByokNudge,
    openByokPrompt,
    byokConfig,
  } = useMemoryStore();

  const eligibleMemories = memories.filter((m) => isEligibleForDiscovery(m));
  const userMemoriesCount = eligibleMemories.length;
  const isByokConfigured = !!(byokConfig.apiKey && byokConfig.apiKey.trim().length > 10);
  const validConnections = connections.filter((conn) => !isInvalidConnection(conn, memories));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SynapticFusion isVisible={isSynapticFusing} />

      {/* Discovery Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Discovery</Text>
        </View>
        <Text style={styles.headerSub}>
          Cross-pollinate saved thoughts, discover deterministic patterns, and synthesize build plans.
        </Text>

        {/* Action Button: Trigger Deterministic Pattern Discovery */}
        <TouchableOpacity
          style={[
            styles.triggerCta,
            (isGeneratingConnections || userMemoriesCount < 2) && styles.triggerCtaDisabled,
          ]}
          onPress={generateConnections}
          disabled={isGeneratingConnections || userMemoriesCount < 2}
          activeOpacity={0.88}
        >
          <View style={styles.ctaIconBadge}>
            {isGeneratingConnections ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Sparkles size={16} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.ctaTextCol}>
            <Text style={styles.ctaTitle}>
              {isGeneratingConnections
                ? 'Synthesizing Graph Connections...'
                : userMemoriesCount < 2
                  ? 'Save 2+ memories to discover'
                  : 'Discover New Connections'}
            </Text>
            <Text style={styles.ctaSub}>
              {isGeneratingConnections
                ? 'Evaluating entities, BM25 tokens, & cross-modal synergy...'
                : 'Deterministic multi-signal knowledge graph across your vault'}
            </Text>
          </View>
          <ChevronRight size={16} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* On-Device Graph & BYOK Benefit Nudge Banner */}
        {!isByokConfigured && !isByokNudgeDismissed && (
          <View style={styles.byokBanner}>
            <View style={styles.byokBannerHeader}>
              <View style={styles.byokBadgeRow}>
                <Sparkles size={14} color="#38BDF8" />
                <Text style={styles.byokBadgeText}>Deterministic Knowledge Graph</Text>
              </View>
              <TouchableOpacity
                onPress={dismissByokNudge}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={14} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.byokBannerTitle}>Supercharge with Gemini AI</Text>
            <Text style={styles.byokBannerSub}>
              Connections are selected 100% on-device. Add your free Gemini API key to unlock personalized bridge insights and custom execution steps.
            </Text>
            <TouchableOpacity
              style={styles.byokBannerButton}
              onPress={openByokPrompt}
              activeOpacity={0.85}
            >
              <Key size={14} color="#0F172A" />
              <Text style={styles.byokBannerBtnText}>Connect Free Gemini Key</Text>
            </TouchableOpacity>
          </View>
        )}

        {validConnections.length > 0 && (
          <Text style={styles.sectionHeader}>DISCOVERED PATTERNS ({validConnections.length})</Text>
        )}

        {validConnections.length === 0 && !isGeneratingConnections ? (
          <View style={styles.emptyStateContainer}>
            <Compass size={36} color="#64748B" />
            <Text style={styles.emptyStateTitle}>No Patterns Discovered Yet</Text>
            <Text style={styles.emptyStateSub}>
              {userMemoriesCount < 2
                ? 'Save 2 or more thoughts with real titles or notes — then tap Discover.'
                : 'Tap "Discover New Connections" above to run knowledge graph matching across your vault.'}
            </Text>
          </View>
        ) : (
          validConnections.map((conn) => {
            const sourceMem = memories.find((m) => m.id === conn.sourceMemoryId);
            const targetMem = memories.find((m) => m.id === conn.targetMemoryId);

            return (
              <View key={conn.id} style={styles.connectionCard}>
                {/* Card Header Badge */}
                <View style={styles.connHeaderRow}>
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>
                      {Math.round((conn.confidenceScore || 0.92) * 100)}% Fit
                    </Text>
                  </View>
                  <Text style={styles.spaceTag}>#{conn.contextSpace || 'Pattern'}</Text>
                </View>

                {/* Connection Title */}
                <Text style={styles.connTitle}>{conn.title}</Text>
                <Text style={styles.buildIdea}>{conn.suggestedBuildIdea}</Text>

                {/* Guidance Paragraphs */}
                {conn.actionableGuidance?.paragraph1 ? (
                  <View style={styles.guidanceBox}>
                    <Text style={styles.connParagraph}>{conn.actionableGuidance.paragraph1}</Text>
                    {conn.actionableGuidance?.paragraph2 ? (
                      <Text style={styles.connParagraph}>{conn.actionableGuidance.paragraph2}</Text>
                    ) : null}
                  </View>
                ) : null}

                {/* Connected Memories Side-by-Side Preview */}
                {(sourceMem || targetMem) && (
                  <View style={styles.memoriesBridgeContainer}>
                    <Text style={styles.bridgeLabel}>CONNECTED THOUGHTS</Text>

                    <View style={styles.bridgeRow}>
                      {sourceMem && (
                        <View style={styles.bridgeCard}>
                          {sourceMem.imageUrl && (
                            <Image source={{ uri: sourceMem.imageUrl }} style={styles.bridgeImage} />
                          )}
                          <Text style={styles.bridgeCardTitle} numberOfLines={2}>
                            {sourceMem.title}
                          </Text>
                        </View>
                      )}

                      <Text style={styles.bridgeConnector}>+</Text>

                      {targetMem && (
                        <View style={styles.bridgeCard}>
                          {targetMem.imageUrl && (
                            <Image source={{ uri: targetMem.imageUrl }} style={styles.bridgeImage} />
                          )}
                          <Text style={styles.bridgeCardTitle} numberOfLines={2}>
                            {targetMem.title}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Graph Evidence Why */}
                {conn.explainabilityWhy && conn.explainabilityWhy.length > 0 && (
                  <View style={styles.evidenceSection}>
                    <Text style={styles.evidenceHeader}>GRAPH EVIDENCE</Text>
                    {conn.explainabilityWhy.map((reason, idx) => (
                      <View key={idx} style={styles.evidenceRow}>
                        <View style={styles.evidenceDot} />
                        <Text style={styles.evidenceText}>{reason}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Actionable Next Steps Checklist */}
                {conn.nextActions && conn.nextActions.length > 0 && (
                  <View style={styles.actionsSection}>
                    <Text style={styles.actionsSectionTitle}>ACTIONABLE NEXT STEPS</Text>
                    {conn.nextActions.map((action, idx) => {
                      const isCompleted = (conn.completedNextActions || []).includes(action);
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={styles.actionCheckRow}
                          onPress={() => toggleNextAction(conn.id, action)}
                          activeOpacity={0.7}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={16} color="#34D399" />
                          ) : (
                            <Circle size={16} color="#64748B" />
                          )}
                          <Text style={[styles.actionText, isCompleted && styles.actionTextCompleted]}>
                            {action}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  triggerCta: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  triggerCtaDisabled: {
    opacity: 0.6,
  },
  ctaIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#252832',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTextCol: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  ctaSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  byokBanner: {
    backgroundColor: '#161922',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  byokBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  byokBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  byokBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38BDF8',
    letterSpacing: 0.2,
  },
  byokBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  byokBannerSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 10,
  },
  byokBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  byokBannerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  emptyStateContainer: {
    paddingVertical: 70,
    alignItems: 'center',
    gap: 10,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  emptyStateSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  connectionCard: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  connHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  spaceTag: {
    fontSize: 11,
    color: '#64748B',
  },
  connTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
    lineHeight: 21,
  },
  buildIdea: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 10,
  },
  guidanceBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    gap: 4,
  },
  connParagraph: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  memoriesBridgeContainer: {
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: '#131418',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  bridgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bridgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bridgeCard: {
    flex: 1,
    backgroundColor: '#181A20',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  bridgeImage: {
    width: '100%',
    height: 55,
    borderRadius: 6,
    marginBottom: 4,
  },
  bridgeCardTitle: {
    fontSize: 10,
    color: '#94A3B8',
  },
  bridgeConnector: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  evidenceSection: {
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  evidenceHeader: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  evidenceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
    marginTop: 6,
  },
  evidenceText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    flex: 1,
  },
  actionsSection: {
    marginTop: 6,
    marginBottom: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    paddingTop: 8,
  },
  actionsSectionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  actionCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
  },
  actionTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
});
