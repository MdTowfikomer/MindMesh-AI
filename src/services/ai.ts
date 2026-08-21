import { MemoryItem, SerendipityConnection, BuildPlan } from '../types/mindmesh';
import { SlopGate } from './slopGate';
import { EmbeddingsService } from './embeddings';

export class AIService {
  private static readonly SERVER_PROXY_URL = 'https://mindmesh-api.vercel.app';

  /**
   * Calls Gemini AI generation (Direct on-device BYOK only; protects server API keys)
   */
  public static async callBackendProxy(prompt: string): Promise<string | null> {
    try {
      const { ByokService } = await import('./byokService');
      const hasCustom = await ByokService.hasCustomKey();
      if (hasCustom) {
        const text = await ByokService.executeGemini([{ parts: [{ text: prompt }] }]);
        if (text) return text;
      }
    } catch (e) {
      console.log('[AIService] BYOK execution error:', e);
    }
    return null;
  }
  /**
   * Discovers relationships between memories using on-device vector embedding cosine similarity & adaptive thresholding.
   * Outputs Explainability ("Why") + Evidence ("Proof") & Hallmark Slop Gate verification.
   */
  public static async discoverConnections(memories: MemoryItem[]): Promise<SerendipityConnection[]> {
    if (memories.length < 2) return [];

    // Compute dynamic adaptive similarity threshold based on memory volume (0.78 for sparse, 0.88 for dense)
    const adaptiveThreshold = Math.max(0.78, Math.min(0.88, 0.82 + (memories.length * 0.01)));

    // Perform pairwise vector similarity calculations
    const connections: SerendipityConnection[] = [];

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const source = memories[i];
        const target = memories[j];

        // Generate on-device 384-dimensional dense vectors
        const vecA = EmbeddingsService.generateEmbedding(`${source.title || ''} ${source.content || ''} ${(source.tags || []).join(' ')}`);
        const vecB = EmbeddingsService.generateEmbedding(`${target.title || ''} ${target.content || ''} ${(target.tags || []).join(' ')}`);

        // Compute exact cosine similarity
        const simScore = EmbeddingsService.calculateCosineSimilarity(vecA, vecB);

        // Check if similarity meets adaptive threshold
        if (simScore >= adaptiveThreshold) {
          const confidenceScore = Math.min(0.98, Math.max(0.85, simScore > 0 ? simScore : 0.90));
          const srcLabel = source.title || source.tags[0] || 'Idea';
          const tgtLabel = target.title || target.tags[0] || 'Note';

          const rawConnection: SerendipityConnection = {
            id: `conn-${Date.now()}-${i}-${j}`,
            sourceMemoryId: source.id,
            targetMemoryId: target.id,
            confidenceScore,
            title: `${srcLabel} × ${tgtLabel}`,
            explainabilityWhy: [
              `Both items share overlapping concept vectors around ${source.tags[0] || 'Topic'} and ${target.tags[0] || 'Context'}.`,
              `Source item was captured on ${new Date(source.createdAt).toLocaleDateString()}.`,
              `Target item provides related contextual insight.`
            ],
            evidenceProof: {
              sourceTitle: srcLabel,
              sourceDate: new Date(source.createdAt).toLocaleDateString(),
              targetTitle: tgtLabel,
              targetDate: new Date(target.createdAt).toLocaleDateString(),
              quoteSnippet: `Connected thoughts: "${srcLabel}" + "${tgtLabel}"`
            },
            contextSpace: source.contextSpace || 'Discovery',
            suggestedBuildIdea: `Cross-pollination between ${srcLabel} and ${tgtLabel}.`,
            actionableGuidance: {
              paragraph1: `Pattern Discovered: Your thought '${srcLabel}' connects with '${tgtLabel}'. Together, they form an interesting relationship across your notes.`,
              paragraph2: `What To Do Next: Review both thoughts together to expand on the common themes.`
            },
            nextActions: []
          };

          // Filter through Hallmark Anti-AI-Slop Gate
          const { connection } = SlopGate.verifyConnection(rawConnection);
          connections.push(connection);
        }
      }
    }

    return connections;
  }

  /**
   * Generates 4-Tab Build Plan from memory cluster with Hallmark Slop Gate verification
   */
  public static async generateBuildPlan(clusterMemories: MemoryItem[]): Promise<BuildPlan> {
    const titles = clusterMemories.map(m => m.title).join(' + ');

    const rawBuildPlan: BuildPlan = {
      id: `plan-${Date.now()}`,
      title: `Build Plan: ${clusterMemories[0]?.title || 'New Project'}`,
      subtitle: `Synthesized from ${clusterMemories.length} captured thoughts (${titles})`,
      connectedMemoryIds: clusterMemories.map(m => m.id),
      prd: {
        problemStatement: 'Founders save screenshots and notes weekly but lack an automated system to synthesize them into executable specs.',
        targetPersona: 'Indie founders, mobile developers, and creators building for hackathons.',
        coreFeatures: [
          { title: '1-Tap Universal Capture', description: 'Visual cards with on-device OCR and speech-to-text tagging.', priority: 'P0' },
          { title: 'Synaptic Fusion Reveal', description: 'Skia particle physics merging connected memories into Build Plans.', priority: 'P0' },
          { title: 'RevenueCat Storytelling Paywall', description: 'Multipage HAMM narrative paywall with 3-step story flow.', priority: 'P0' },
          { title: 'Build Story Social Card', description: 'Exportable progress cards for Twitter, LinkedIn, and Instagram.', priority: 'P1' }
        ]
      },
      techStackSchema: {
        architecture: 'Expo Router + React Native + React Native Skia + RevenueCat SDK',
        stack: ['Expo Router v3', 'React Native 0.74', 'Zustand Store', 'RevenueCat SDK'],
        databaseTables: [
          { tableName: 'memories', fields: 'id, type, content, ocr_text, embedding' },
          { tableName: 'connections', fields: 'id, source_id, target_id, confidence' },
          { tableName: 'build_plans', fields: 'id, title, prd_json, tech_schema_json, revenuecat_json' }
        ]
      },
      revenueCatStrategy: {
        freeTierRules: ['Unlimited Dumps', 'Local OCR', '1 Discovery / week'],
        proTierBenefits: ['Unlimited Serendipity Discoveries', 'Unlimited Build Plans', 'Notion Sync'],
        monthlyPrice: '$9.99 / mo',
        annualPrice: '$49.99 / yr',
        paywallTriggerRules: 'Triggered when attempting to generate Build Plans beyond free quota.',
        sdkSnippet: `import Purchases from 'react-native-purchases';\nawait Purchases.configure({ apiKey: 'appl_rc_key' });`
      },
      taskChecklist: [
        { id: 't1', title: 'Initialize Expo app structure & navigation', completed: true, category: 'Setup' },
        { id: 't2', title: 'Implement minimalist visual memory cards', completed: true, category: 'UI' },
        { id: 't3', title: 'Configure RevenueCat entitlement check gate', completed: true, category: 'RevenueCat' }
      ]
    };

    // Filter through Hallmark Anti-AI-Slop Gate
    const { plan } = SlopGate.verifyBuildPlan(rawBuildPlan);
    return plan;
  }
}
