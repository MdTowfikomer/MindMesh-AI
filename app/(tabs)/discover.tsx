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
} from '../../src/components/Icons';

export default function DiscoverScreen() {
  const {
    memories,
    connections,
    isGeneratingConnections,
    isSynapticFusing,
    generateConnections,
  } = useMemoryStore();

  const userMemoriesCount = memories.filter((m) => /^mem-\d+$/.test(m.id)).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SynapticFusion isVisible={isSynapticFusing} />

      {/* Discovery Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Discovery</Text>
        </View>
        <Text style={styles.headerSub}>
          Cross-pollinate saved thoughts, discover patterns, and synthesize build plans.
        </Text>

        {/* Action Button: Trigger Pattern Discovery */}
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
                ? 'Discovering Patterns...'
                : userMemoriesCount < 2
                  ? 'Save 2+ memories to discover'
                  : 'Discover New Connections'}
            </Text>
            <Text style={styles.ctaSub}>
              {isGeneratingConnections
                ? 'Analyzing vector relationships across your thoughts...'
                : 'Synthesize hidden links between your captured memories'}
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
        {connections.length > 0 && (
          <Text style={styles.sectionHeader}>DISCOVERED PATTERNS ({connections.length})</Text>
        )}

        {connections.length === 0 && !isGeneratingConnections ? (
          <View style={styles.emptyStateContainer}>
            <Compass size={36} color="#64748B" />
            <Text style={styles.emptyStateTitle}>No Patterns Discovered Yet</Text>
            <Text style={styles.emptyStateSub}>
              {userMemoriesCount < 2
                ? 'Save 2 or more thoughts, screenshots, or links — then tap Discover.'
                : 'Tap "Discover New Connections" above to run similarity analysis across your vault.'}
            </Text>
          </View>
        ) : (
          connections.map((conn) => {
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
  actionsSection: {
    marginTop: 6,
    marginBottom: 10,
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
  deepDiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
  },
  deepDiveText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  buildPlanCta: {
    backgroundColor: '#252832',
    borderRadius: 10,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  buildPlanCtaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
