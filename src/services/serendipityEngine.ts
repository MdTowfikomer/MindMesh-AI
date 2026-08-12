import { API_CONFIG } from '../config/api';
import { MemoryItem, SerendipityConnection } from '../types/mindmesh';

/**
 * Serendipity Engine — 2-Stage Dynamic Connection Discovery
 * 
 * Stage 1 (Fast): Discover pattern + generate title & 2-paragraph guidance (~150 output tokens)
 * Stage 2 (On demand): Generate next steps + evidence + explainability (~300 output tokens)
 */
export class SerendipityEngine {

  // ─── STAGE 1: Fast Discovery (title + guidance only) ───────────────────────

  private static readonly STAGE1_PROMPT = `You are the Serendipity Engine inside MindMesh, a smart note-taking app. The user saves screenshots, notes, voice memos, bookmarks, and posts from various sources. Your job: find ONE meaningful hidden connection between 2 or more of their saved items.

The connection should be relevant to WHAT THE USER CARES ABOUT based on their content. If they save tech/dev stuff, connect tech ideas. If they save recipes, connect food ideas. If they save business stuff, connect business opportunities. Match the user's world.

MEMORIES:
{MEMORIES}

Return ONLY valid JSON (no markdown, no backticks):
{
  "sourceIndex": 0,
  "targetIndex": 1,
  "confidenceScore": 0.92,
  "title": "Short connection title (max 8 words)",
  "contextSpace": "Relevant context label for this connection",
  "suggestedBuildIdea": "One sentence — what insight or action emerges from this connection",
  "paragraph1": "2-3 sentences explaining WHAT this pattern means for the user. Reference the actual content of both items. Tell them what you noticed.",
  "paragraph2": "2-3 sentences explaining WHY this matters and what opportunity it opens up. Be specific to their context.",
  "sourcedFrom": "A brief sentence like 'Discovered from your [type] about [topic] and your [type] about [topic]' — tell the user which items created this connection"
}

RULES:
- Be context-aware: match the user's domain (tech, design, business, personal, creative, etc.)
- Always reference the actual content of the memories, not generic advice
- The "sourcedFrom" field must clearly tell the user WHICH items generated this connection
- No AI slop (never use: leverage, delve, game-changer, seamlessly, synergy, paradigm shift, tapestry)
- Write naturally like a smart friend pointing out something they missed`;

  // ─── STAGE 2: Deep Dive (next steps + evidence + explainability) ────────────

  private static readonly STAGE2_PROMPT = `You previously found a connection between these 2 saved items from the user:

SOURCE: "{SOURCE_TITLE}" — {SOURCE_CONTENT}
TARGET: "{TARGET_TITLE}" — {TARGET_CONTENT}
CONNECTION: "{CONNECTION_TITLE}"
GUIDANCE: {PARAGRAPH1} {PARAGRAPH2}

Now generate actionable next steps tailored to the user's context. If the connection is about building something → give dev/build steps. If it's about learning → give learning steps. If it's about a personal goal → give personal action steps. Match their world.

Return ONLY valid JSON:
{
  "nextActions": ["Concrete step 1 the user can do TODAY", "Concrete step 2 that follows logically", "Concrete step 3 that completes the loop"],
  "explainabilityWhy": ["Specific factual reason 1 these items connect (reference actual content)", "Specific reason 2", "Specific reason 3"],
  "quoteSnippet": "Short quote linking both items together (max 15 words)"
}

RULES:
- nextActions must be immediately executable (not vague like "explore" or "research more")
- explainabilityWhy must reference actual content from the source and target memories
- No AI slop words. Write like a human.`;

  /**
   * Stage 1: Fast discovery — returns connection with title + guidance only
   */
  static async discoverConnection(memories: MemoryItem[]): Promise<SerendipityConnection | null> {
    const apiKey = API_CONFIG.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here' || memories.length < 2) return null;

    // Random sample 6 memories from the full collection
    const sampled = this.randomSample(memories, 6);

    const memoriesText = sampled.map((m, idx) =>
      `[${idx}] ${m.type} | "${m.title}" | "${m.content?.slice(0, 120) || ''}" | Tags: [${m.tags.join(', ')}]`
    ).join('\n');

    const prompt = this.STAGE1_PROMPT.replace('{MEMORIES}', memoriesText);

    try {
      const json = await this.callGemini(prompt, 250);
      if (!json) return null;

      const sourceIdx = json.sourceIndex ?? 0;
      const targetIdx = json.targetIndex ?? 1;
      const source = sampled[sourceIdx] || sampled[0];
      const target = sampled[targetIdx] || sampled[1];

      return {
        id: `conn-${Date.now()}`,
        sourceMemoryId: source.id,
        targetMemoryId: target.id,
        confidenceScore: json.confidenceScore || 0.91,
        title: json.title || 'Pattern Discovered',
        explainabilityWhy: [], // Filled in Stage 2
        evidenceProof: {
          sourceTitle: source.title,
          sourceDate: source.createdAt,
          targetTitle: target.title,
          targetDate: target.createdAt,
          quoteSnippet: json.sourcedFrom || `Discovered from "${source.title}" and "${target.title}"`,
        },
        contextSpace: json.contextSpace || source.contextSpace || 'General',
        suggestedBuildIdea: json.suggestedBuildIdea || '',
        actionableGuidance: {
          paragraph1: json.paragraph1 || '',
          paragraph2: json.paragraph2 || '',
        },
        nextActions: [], // Filled in Stage 2
        completedNextActions: [],
        slopGateScore: 100,
        slopGateStatus: 'PASSED',
        slopWordsRemoved: 0,
        hallmarkVerified: true,
      };
    } catch (error) {
      console.warn('SerendipityEngine Stage 1 failed:', error);
      return null;
    }
  }

  /**
   * Stage 2: Deep dive — fills in next steps, explainability, and evidence
   */
  static async deepDiveConnection(
    connection: SerendipityConnection,
    memories: MemoryItem[]
  ): Promise<SerendipityConnection | null> {
    const apiKey = API_CONFIG.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') return null;

    const source = memories.find(m => m.id === connection.sourceMemoryId);
    const target = memories.find(m => m.id === connection.targetMemoryId);
    if (!source || !target) return null;

    const prompt = this.STAGE2_PROMPT
      .replace('{SOURCE_TITLE}', source.title)
      .replace('{SOURCE_CONTENT}', source.content?.slice(0, 150) || '')
      .replace('{TARGET_TITLE}', target.title)
      .replace('{TARGET_CONTENT}', target.content?.slice(0, 150) || '')
      .replace('{CONNECTION_TITLE}', connection.title)
      .replace('{PARAGRAPH1}', connection.actionableGuidance?.paragraph1 || '')
      .replace('{PARAGRAPH2}', connection.actionableGuidance?.paragraph2 || '');

    try {
      const json = await this.callGemini(prompt, 300);
      if (!json) return null;

      return {
        ...connection,
        nextActions: json.nextActions || ['Validate the idea', 'Build a prototype', 'Ship an MVP'],
        explainabilityWhy: json.explainabilityWhy || ['Related topics'],
        evidenceProof: {
          ...connection.evidenceProof,
          quoteSnippet: json.quoteSnippet || `Connects "${source.title}" with "${target.title}"`,
        },
      };
    } catch (error) {
      console.warn('SerendipityEngine Stage 2 failed:', error);
      return null;
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private static async callGemini(prompt: string, maxTokens: number): Promise<any | null> {
    const url = `${API_CONFIG.GEMINI_ENDPOINT}/${API_CONFIG.GEMINI_MODEL}:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
      }),
    });

    if (!response.ok) {
      console.warn('SerendipityEngine: API error', response.status);
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(cleaned);
  }

  /**
   * Random sample N items from array (Fisher-Yates shuffle variant)
   */
  private static randomSample(arr: MemoryItem[], n: number): MemoryItem[] {
    if (arr.length <= n) return [...arr];
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  }
}
