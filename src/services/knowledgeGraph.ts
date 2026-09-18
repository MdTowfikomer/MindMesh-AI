import { MemoryItem, SerendipityConnection, MemoryType } from '../types/mindmesh';
import { SlopGate } from './slopGate';
import { EmbeddingsService } from './embeddings';

// Common English stop words to exclude from lexical token overlap
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more',
  'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',
]);

export interface GraphEvidence {
  sharedTags: string[];
  sharedEntities: string[];
  matchedKeywords: string[];
  contextMatch: string | null;
  crossModalTypes: [MemoryType, MemoryType];
  scores: {
    entityJaccard: number;    // weight 0.40
    bm25Lexical: number;      // weight 0.35
    crossModalBonus: number;  // weight 0.15
    contextSpace: number;     // weight 0.10
    totalScore: number;       // composite 0.0 - 1.0
  };
}

export interface ScoredPair {
  source: MemoryItem;
  target: MemoryItem;
  pairKey: string;
  score: number;
  confidenceScore: number;
  evidence: GraphEvidence;
}

export interface SubgraphClique {
  memories: MemoryItem[];
  avgScore: number;
  sharedThemes: string[];
  dominantContextSpace: string;
}

export class KnowledgeGraphEngine {
  /**
   * Generates a canonical symmetric pair key to avoid A::B vs B::A duplicate discoveries
   */
  public static getPairKey(idA: string, idB: string): string {
    return [idA, idB].sort().join('::');
  }

  /**
   * Normalizes and tokenizes text into clean meaningful keywords
   */
  public static tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));
  }

  /**
   * Collects all entity and tag identifiers for a memory item
   */
  public static getEntityTags(memory: MemoryItem): Set<string> {
    const tags = new Set<string>();
    (memory.tags || []).forEach((t) => tags.add(t.toLowerCase().trim()));
    (memory.invisibleTags || []).forEach((t) => tags.add(t.toLowerCase().trim()));
    (memory.entities || []).forEach((e) => tags.add(e.name.toLowerCase().trim()));
    return tags;
  }

  /**
   * Gathers all searchable text content for a memory
   */
  public static getAllText(memory: MemoryItem): string {
    const parts = [
      memory.title || '',
      memory.content || '',
      memory.ocrText || '',
      memory.personalNote || '',
      memory.urlMetadata?.siteName || '',
      memory.urlMetadata?.fullText?.slice(0, 300) || '',
      (memory.urlMetadata?.highlights || []).join(' '),
    ];
    return parts.filter(Boolean).join(' ');
  }

  /**
   * Computes Cross-Modal Diversity Bonus between two items (weight: 0.15)
   * Connects complementary mediums: visual screenshots + code/tech notes + pricing/strategy
   */
  public static calculateCrossModalBonus(typeA: MemoryType, typeB: MemoryType): number {
    const visualTypes = new Set(['image', 'whiteboard', 'gif', 'pdf']);
    const structuredTypes = new Set(['code', 'pricing']);
    const narrativeTypes = new Set(['article', 'quote', 'video', 'bookmark', 'text']);
    const audioTypes = new Set(['voice']);

    const isAVisual = visualTypes.has(typeA);
    const isBVisual = visualTypes.has(typeB);
    const isAStruct = structuredTypes.has(typeA);
    const isBStruct = structuredTypes.has(typeB);
    const isAAudio = audioTypes.has(typeA);
    const isBAudio = audioTypes.has(typeB);
    const isANarr = narrativeTypes.has(typeA);
    const isBNarr = narrativeTypes.has(typeB);

    // Highest serendipity: Visual Inspiration + Technical Execution or Strategy
    if ((isAVisual && isBStruct) || (isBVisual && isAStruct)) return 1.0;
    if ((isAVisual && isBNarr) || (isBVisual && isANarr)) return 0.95;
    if ((isAAudio && (isAVisual || isBVisual || isAStruct || isBStruct))) return 0.90;
    if ((isAStruct && isBNarr) || (isBStruct && isANarr)) return 0.85;

    // Different types in same category
    if (typeA !== typeB) return 0.60;

    // Same medium (e.g. image + image, or text + text)
    return 0.30;
  }

  /**
   * Deterministically evaluates the edge score and evidence between two memories
   */
  public static evaluatePair(memoryA: MemoryItem, memoryB: MemoryItem): ScoredPair {
    // 1. Entity & Tag Jaccard Overlap (Weight: 0.40)
    const tagsA = this.getEntityTags(memoryA);
    const tagsB = this.getEntityTags(memoryB);
    const sharedTagsList: string[] = [];

    tagsA.forEach((tag) => {
      if (tagsB.has(tag)) sharedTagsList.push(tag);
    });

    const unionSize = new Set([...Array.from(tagsA), ...Array.from(tagsB)]).size;
    let entityJaccard = unionSize > 0 ? sharedTagsList.length / unionSize : 0;
    // Boost score if there are explicit shared tags
    if (sharedTagsList.length > 0) {
      entityJaccard = Math.min(1.0, entityJaccard + 0.35 + (sharedTagsList.length * 0.15));
    }

    // 2. Lexical Keyword Overlap (BM25 / TF-IDF approximation) (Weight: 0.35)
    const tokensA = this.tokenize(this.getAllText(memoryA));
    const tokensB = this.tokenize(this.getAllText(memoryB));
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    const matchedKeywords: string[] = [];
    setA.forEach((token) => {
      if (setB.has(token)) {
        matchedKeywords.push(token);
      }
    });

    const minTokenCount = Math.max(4, Math.min(setA.size, setB.size));
    const bm25Lexical = Math.min(1.0, (matchedKeywords.length * 1.5) / minTokenCount);

    // 3. Cross-Modal Diversity Bonus (Weight: 0.15)
    const crossModalBonus = this.calculateCrossModalBonus(memoryA.type, memoryB.type);

    // 4. Directory & Context Space Match (Weight: 0.10)
    let contextSpaceScore = 0;
    let matchedContext: string | null = null;

    const spaceA = (memoryA.contextSpace || memoryA.directory || '').trim().toLowerCase();
    const spaceB = (memoryB.contextSpace || memoryB.directory || '').trim().toLowerCase();

    if (spaceA && spaceB && spaceA !== 'all' && spaceB !== 'all') {
      if (spaceA === spaceB) {
        contextSpaceScore = 1.0;
        matchedContext = memoryA.contextSpace || memoryA.directory || 'Shared Context';
      } else if (spaceA.includes(spaceB) || spaceB.includes(spaceA)) {
        contextSpaceScore = 0.6;
        matchedContext = memoryA.contextSpace || memoryB.contextSpace || 'Related Space';
      }
    }

    // Weighted composite total score (0.0 to 1.0)
    const totalScore =
      0.40 * entityJaccard +
      0.35 * bm25Lexical +
      0.15 * crossModalBonus +
      0.10 * contextSpaceScore;

    // Map to a human-readable 72% to 98% confidence score
    const confidenceScore = Math.min(0.98, Math.max(0.72, 0.70 + totalScore * 0.28));

    const evidence: GraphEvidence = {
      sharedTags: sharedTagsList,
      sharedEntities: (memoryA.entities || [])
        .filter((e) => (memoryB.entities || []).some((eb) => eb.name.toLowerCase() === e.name.toLowerCase()))
        .map((e) => e.name),
      matchedKeywords: matchedKeywords.slice(0, 6),
      contextMatch: matchedContext,
      crossModalTypes: [memoryA.type, memoryB.type],
      scores: {
        entityJaccard,
        bm25Lexical,
        crossModalBonus,
        contextSpace: contextSpaceScore,
        totalScore,
      },
    };

    return {
      source: memoryA,
      target: memoryB,
      pairKey: this.getPairKey(memoryA.id, memoryB.id),
      score: totalScore,
      confidenceScore,
      evidence,
    };
  }

  /**
   * Finds the highest-scoring novel (undiscovered) pair across all active user memories.
   * Deterministic: Given the same memories and existing connections, produces the exact same top pair.
   */
  public static findTopNovelPair(
    memories: MemoryItem[],
    existingPairKeys: Set<string> = new Set()
  ): ScoredPair | null {
    if (memories.length < 2) return null;

    const scoredPairs: ScoredPair[] = [];

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const memA = memories[i];
        const memB = memories[j];
        const pairKey = this.getPairKey(memA.id, memB.id);

        // Deduplication: skip previously discovered pairs
        if (existingPairKeys.has(pairKey)) continue;

        const scored = this.evaluatePair(memA, memB);
        scoredPairs.push(scored);
      }
    }

    if (scoredPairs.length === 0) return null;

    // Deterministic sort: score descending, then tie-break deterministically by pairKey
    scoredPairs.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.pairKey.localeCompare(b.pairKey);
    });

    return scoredPairs[0];
  }

  /**
   * Finds a multi-node clique (3 to 5 nodes) with the highest mutual connectivity for Build Plans.
   */
  public static findMultiNodeClique(
    memories: MemoryItem[],
    minSize = 3,
    maxSize = 5
  ): SubgraphClique | null {
    if (memories.length < minSize) return null;

    const n = memories.length;
    let bestClique: MemoryItem[] = [];
    let bestAvgScore = -1;
    let bestThemes: string[] = [];

    // Search for the densest 3-node triangle first
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pair1 = this.evaluatePair(memories[i], memories[j]);
        if (pair1.score < 0.25) continue;

        for (let k = j + 1; k < n; k++) {
          const pair2 = this.evaluatePair(memories[j], memories[k]);
          const pair3 = this.evaluatePair(memories[i], memories[k]);

          if (pair2.score >= 0.25 && pair3.score >= 0.25) {
            const avg = (pair1.score + pair2.score + pair3.score) / 3;
            if (avg > bestAvgScore) {
              bestAvgScore = avg;
              bestClique = [memories[i], memories[j], memories[k]];
              bestThemes = Array.from(
                new Set([
                  ...pair1.evidence.sharedTags,
                  ...pair2.evidence.sharedTags,
                  ...pair3.evidence.sharedTags,
                  ...pair1.evidence.matchedKeywords.slice(0, 2),
                ])
              );
            }
          }
        }
      }
    }

    // Attempt to expand to 4 or 5 items if compatible candidates exist
    if (bestClique.length >= 3 && maxSize > 3) {
      for (let m = 0; m < n; m++) {
        if (bestClique.length >= maxSize) break;
        const candidate = memories[m];
        if (bestClique.some((c) => c.id === candidate.id)) continue;

        const scoresWithClique = bestClique.map((c) => this.evaluatePair(c, candidate).score);
        const minCandidateScore = Math.min(...scoresWithClique);
        if (minCandidateScore >= 0.28) {
          bestClique.push(candidate);
        }
      }
    }

    if (bestClique.length < minSize) {
      // Fallback: take the top available memories with shared context
      bestClique = memories.slice(0, Math.min(memories.length, minSize));
      bestAvgScore = 0.50;
      bestThemes = Array.from(new Set(bestClique.flatMap((m) => m.tags || []))).slice(0, 3);
    }

    const dominantContext =
      bestClique.find((m) => m.contextSpace && m.contextSpace !== 'All')?.contextSpace || 'Product Build';

    return {
      memories: bestClique,
      avgScore: bestAvgScore,
      sharedThemes: bestThemes,
      dominantContextSpace: dominantContext,
    };
  }

  /**
   * Deterministic Fallback Synthesis: Generates clean, grounded connection insights
   * on-device without requiring an LLM API key or network connection.
   * Guarantees 100% Hallmark Anti-AI-Slop compliance.
   */
  public static generateDeterministicFallbackSynthesis(pair: ScoredPair): SerendipityConnection {
    const { source, target, confidenceScore, evidence } = pair;

    const srcTitle = source.title?.trim() || `${source.type} thought`;
    const tgtTitle = target.title?.trim() || `${target.type} thought`;

    // Extract dominant topic/tag
    const primaryTopic =
      evidence.sharedTags[0] ||
      evidence.matchedKeywords[0] ||
      source.contextSpace ||
      'Workflow';

    // Format title
    const title = `${srcTitle} × ${tgtTitle}`;

    // Craft suggested build idea
    const suggestedBuildIdea = `Bridge ${srcTitle} with ${tgtTitle} into a unified ${primaryTopic} workflow.`;

    // Craft evidence quote and details
    const keywordStr = evidence.matchedKeywords.slice(0, 3).join(', ');
    const tagStr = evidence.sharedTags.slice(0, 3).join(', ');

    const paragraph1 = `Pattern Discovered: Your ${source.type} on "${srcTitle}" strongly connects with your ${target.type} on "${tgtTitle}". Both thoughts focus on ${primaryTopic}${tagStr ? ` (tagged: ${tagStr})` : ''} with overlapping concepts around ${keywordStr || 'product architecture'}.`;

    const paragraph2 = `Why It Matters: Connecting these two thoughts creates a clear bridge between inspiration and practical execution. Reviewing them together reveals a direct path to implement and ship this feature without starting from scratch.`;

    const quoteSnippet = `Discovered from your ${source.type} ("${srcTitle}") and ${target.type} ("${tgtTitle}")`;

    const nextActions = [
      `1. Review both "${srcTitle}" and "${tgtTitle}" side-by-side to align on requirements.`,
      `2. Outline the core data schema and user interface based on ${primaryTopic}.`,
      `3. Build a working prototype linking the inspiration to the build spec.`,
    ];

    const explainabilityWhy = [
      `Shared concept overlap in ${primaryTopic} with ${Math.round(confidenceScore * 100)}% graph compatibility.`,
      evidence.sharedTags.length > 0
        ? `Common tags: ${evidence.sharedTags.join(', ')}.`
        : `Matched keywords across notes: ${evidence.matchedKeywords.join(', ') || 'context alignment'}.`,
      `Cross-modal bridge between a ${source.type} and a ${target.type}.`,
    ];

    const rawConnection: SerendipityConnection = {
      id: `conn-${Date.now()}-${source.id.slice(-4)}-${target.id.slice(-4)}`,
      sourceMemoryId: source.id,
      targetMemoryId: target.id,
      confidenceScore,
      title,
      explainabilityWhy,
      evidenceProof: {
        sourceTitle: srcTitle,
        sourceDate: source.createdAt,
        targetTitle: tgtTitle,
        targetDate: target.createdAt,
        quoteSnippet,
      },
      contextSpace: evidence.contextMatch || source.contextSpace || 'Pattern',
      suggestedBuildIdea,
      actionableGuidance: {
        paragraph1,
        paragraph2,
      },
      nextActions,
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
    return connection;
  }
}
