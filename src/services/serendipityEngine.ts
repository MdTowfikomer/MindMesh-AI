import { MemoryItem, SerendipityConnection } from '../types/mindmesh';
import { EmbeddingsService } from './embeddings';
import { KnowledgeGraphEngine, ScoredPair } from './knowledgeGraph';
import { SlopGate } from './slopGate';

export interface DiscoveryResult {
  connection: SerendipityConnection | null;
  isFallback: boolean;
  graphPair?: ScoredPair;
}

/**
 * Serendipity Engine — Deterministic Knowledge Graph + LLM Synthesis Pipeline
 * 
 * Step 1 (Deterministic): Multi-Signal Knowledge Graph ranks candidate pairs
 * using 40% Entity/Tag overlap, 35% BM25 text overlap, 15% Cross-modal bonus, and 10% Directory context.
 * 
 * Step 2 (Synthesis):
 * - If BYOK key present: Gemini synthesizes punchy bridge title, strategic opportunity, and executable steps.
 * - If offline / no key: Instant deterministic fallback synthesis with grounded graph evidence.
 */
export class SerendipityEngine {
  private static readonly SYNTHESIS_PROMPT = `You are the Serendipity Synthesis Engine inside MindMesh, a smart note-taking and idea synthesis app.
A deterministic knowledge graph has already discovered a high-confidence connection between these two specific thoughts saved by the user:

SOURCE ITEM:
Type: {SOURCE_TYPE}
Title: "{SOURCE_TITLE}"
Content: {SOURCE_CONTENT}
Tags: [{SOURCE_TAGS}]

TARGET ITEM:
Type: {TARGET_TYPE}
Title: "{TARGET_TITLE}"
Content: {TARGET_CONTENT}
Tags: [{TARGET_TAGS}]

DETERMINISTIC GRAPH EVIDENCE:
- Shared Tags: [{SHARED_TAGS}]
- Matched Keywords: [{MATCHED_KEYWORDS}]
- Shared Space: {CONTEXT_SPACE}
- Modality Bridge: {SOURCE_TYPE} + {TARGET_TYPE}

Your job: Synthesize the bridge between these two specific items. Match the user's world (tech, design, business, creative). Reference the actual content of both items. Do NOT guess different memories.

Return ONLY valid JSON (no markdown, no backticks):
{
  "title": "Short punchy connection title (max 8 words)",
  "contextSpace": "Relevant context label",
  "suggestedBuildIdea": "One sentence — what product feature, workflow, or insight emerges by combining them",
  "paragraph1": "2-3 sentences explaining WHAT pattern connects them. Reference actual details from both items.",
  "paragraph2": "2-3 sentences explaining WHY this matters and what specific execution opportunity it opens up.",
  "nextActions": [
    "Concrete actionable step 1",
    "Concrete actionable step 2",
    "Concrete actionable step 3"
  ],
  "explainabilityWhy": [
    "Specific factual reason 1 linking them",
    "Specific factual reason 2 linking them"
  ],
  "sourcedFrom": "Discovered from your {SOURCE_TYPE} on [Topic] and your {TARGET_TYPE} on [Topic]"
}

RULES:
- Be specific to the actual items, no generic advice.
- No AI slop words (never use: leverage, delve, game-changer, seamlessly, synergy, paradigm shift, tapestry, revolutionize).
- Write naturally like a smart founder pointing out an execution opportunity.`;

  /**
   * Discovers the next top deterministic connection between user memories
   */
  static async discoverConnection(
    memories: MemoryItem[],
    existingPairKeys: Set<string> = new Set()
  ): Promise<DiscoveryResult> {
    if (memories.length < 2) {
      return { connection: null, isFallback: false };
    }

    // Step 1: Deterministic Multi-Signal Knowledge Graph Candidate Selection
    const topPair = KnowledgeGraphEngine.findTopNovelPair(memories, existingPairKeys);
    if (!topPair) {
      return { connection: null, isFallback: false };
    }

    // Step 2: Check BYOK Key configuration
    let hasCustomKey = false;
    try {
      const { ByokService } = await import('./byokService');
      hasCustomKey = await ByokService.hasCustomKey();
    } catch (_) {}

    // If no custom BYOK key, execute deterministic fallback synthesis immediately
    if (!hasCustomKey) {
      const fallbackConn = KnowledgeGraphEngine.generateDeterministicFallbackSynthesis(topPair);
      return {
        connection: fallbackConn,
        isFallback: true,
        graphPair: topPair,
      };
    }

    // Step 3: LLM Synthesis with BYOK Key
    const { source, target, evidence, confidenceScore } = topPair;

    const prompt = this.SYNTHESIS_PROMPT
      .replace(/{SOURCE_TYPE}/g, source.type)
      .replace('{SOURCE_TITLE}', source.title || '')
      .replace('{SOURCE_CONTENT}', (source.content || source.ocrText || '').slice(0, 200))
      .replace('{SOURCE_TAGS}', (source.tags || []).join(', '))
      .replace(/{TARGET_TYPE}/g, target.type)
      .replace('{TARGET_TITLE}', target.title || '')
      .replace('{TARGET_CONTENT}', (target.content || target.ocrText || '').slice(0, 200))
      .replace('{TARGET_TAGS}', (target.tags || []).join(', '))
      .replace('{SHARED_TAGS}', evidence.sharedTags.join(', ') || 'None')
      .replace('{MATCHED_KEYWORDS}', evidence.matchedKeywords.join(', ') || 'Semantic alignment')
      .replace('{CONTEXT_SPACE}', evidence.contextMatch || source.contextSpace || 'Workspace');

    try {
      const json = await this.callGemini(prompt, 350);

      if (!json) {
        // Fallback gracefully to deterministic synthesis if LLM returns null
        const fallbackConn = KnowledgeGraphEngine.generateDeterministicFallbackSynthesis(topPair);
        return {
          connection: fallbackConn,
          isFallback: true,
          graphPair: topPair,
        };
      }

      const rawConnection: SerendipityConnection = {
        id: `conn-${Date.now()}-${source.id.slice(-4)}-${target.id.slice(-4)}`,
        sourceMemoryId: source.id,
        targetMemoryId: target.id,
        confidenceScore,
        title: json.title || `${source.title} × ${target.title}`,
        explainabilityWhy: Array.isArray(json.explainabilityWhy) && json.explainabilityWhy.length > 0
          ? json.explainabilityWhy
          : [
              `Direct contextual alignment in ${json.contextSpace || source.contextSpace}.`,
              `Shared concepts: ${evidence.sharedTags.join(', ') || evidence.matchedKeywords.join(', ')}.`,
            ],
        evidenceProof: {
          sourceTitle: source.title,
          sourceDate: source.createdAt,
          targetTitle: target.title,
          targetDate: target.createdAt,
          quoteSnippet: json.sourcedFrom || `Discovered from "${source.title}" and "${target.title}"`,
        },
        contextSpace: json.contextSpace || evidence.contextMatch || source.contextSpace || 'General',
        suggestedBuildIdea: json.suggestedBuildIdea || `Connect ${source.title} with ${target.title}`,
        actionableGuidance: {
          paragraph1: json.paragraph1 || '',
          paragraph2: json.paragraph2 || '',
        },
        nextActions: Array.isArray(json.nextActions) && json.nextActions.length > 0
          ? json.nextActions
          : [
              `1. Review "${source.title}" and "${target.title}".`,
              `2. Define the unified user experience.`,
              `3. Ship working feature prototype.`,
            ],
        completedNextActions: [],
        slopGateScore: 100,
        slopGateStatus: 'PASSED',
        slopWordsRemoved: 0,
        hallmarkVerified: true,
        npuInferenceMs: EmbeddingsService.measurePairInferenceMs(
          `${source.title} ${source.content || ''}`,
          `${target.title} ${target.content || ''}`
        ),
      };

      const { connection } = SlopGate.verifyConnection(rawConnection);
      return {
        connection,
        isFallback: false,
        graphPair: topPair,
      };
    } catch (error) {
      console.warn('[SerendipityEngine] LLM Synthesis error, using deterministic fallback:', error);
      const fallbackConn = KnowledgeGraphEngine.generateDeterministicFallbackSynthesis(topPair);
      return {
        connection: fallbackConn,
        isFallback: true,
        graphPair: topPair,
      };
    }
  }

  /**
   * Stage 2: Deep dive — fills in next steps and explainability if needed
   */
  static async deepDiveConnection(
    connection: SerendipityConnection,
    memories: MemoryItem[]
  ): Promise<SerendipityConnection | null> {
    if (connection.nextActions && connection.nextActions.length >= 3) {
      return connection;
    }

    const source = memories.find((m) => m.id === connection.sourceMemoryId);
    const target = memories.find((m) => m.id === connection.targetMemoryId);
    if (!source || !target) return connection;

    const pair = KnowledgeGraphEngine.evaluatePair(source, target);
    const fallback = KnowledgeGraphEngine.generateDeterministicFallbackSynthesis(pair);

    return {
      ...connection,
      nextActions: fallback.nextActions,
      explainabilityWhy: fallback.explainabilityWhy,
    };
  }

  private static async callGemini(prompt: string, maxTokens: number): Promise<any | null> {
    try {
      const { ByokService } = await import('./byokService');
      const hasCustom = await ByokService.hasCustomKey();
      if (!hasCustom) return null;

      const text = await ByokService.executeGemini([{ parts: [{ text: prompt }] }], {
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      });

      if (!text) return null;

      let cleaned = text.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('[SerendipityEngine] callGemini error:', e);
      return null;
    }
  }
}
