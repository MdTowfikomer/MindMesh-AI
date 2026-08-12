import { MemoryType } from '../types/mindmesh';

export interface OCRAnalysisResult {
  tldrTitle: string;
  ocrText: string;
  classification: MemoryType;
  suggestedTags: string[];
  confidenceScore: number;
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'in', 'on', 'at', 'to', 'for', 'from', 'by', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while', 'of', 'at',
  'by', 'for', 'with', 'about', 'this', 'that', 'these', 'those', 'my', 'your',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each'
]);

export class OCRService {
  /**
   * Analyzes an image for classification and tagging.
   * If no real OCR text is available, returns a clean minimal result
   * (like mymind — show the image, auto-organize silently).
   */
  public static async analyzeImage(uri: string, rawOcrInput?: string): Promise<OCRAnalysisResult> {
    // If we have actual OCR text (from a real OCR API), process it
    if (rawOcrInput && rawOcrInput.trim().length > 10) {
      return this.processWithText(rawOcrInput, uri);
    }

    // Check if URI contains meaningful context clues
    const contextFromUri = this.extractContextFromUri(uri);
    if (contextFromUri) {
      return this.processWithText(contextFromUri, uri);
    }

    // No OCR available — return clean minimal result (like mymind)
    return this.createCleanImageResult();
  }

  /**
   * Process image when we have meaningful text to work with
   */
  private static processWithText(sourceText: string, uri: string): OCRAnalysisResult {
    const tokens = this.tokenize(sourceText);
    const entities = this.extractEntities(sourceText);
    const classification = this.determineClassification(sourceText, tokens);
    const suggestedTags = this.generateDynamicTags(sourceText, tokens, entities, classification);
    const tldrTitle = this.synthesizeTLDR(sourceText, entities, classification);

    return {
      tldrTitle,
      ocrText: sourceText,
      classification,
      suggestedTags,
      confidenceScore: Math.min(0.99, Math.max(0.85, 0.88 + entities.length * 0.02)),
    };
  }

  /**
   * Returns a clean minimal result for user-uploaded images without OCR.
   * Mimics mymind behavior: save the image, show it beautifully, minimal metadata.
   */
  private static createCleanImageResult(): OCRAnalysisResult {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return {
      tldrTitle: `Saved ${dateStr} at ${timeStr}`,
      ocrText: '',
      classification: 'image',
      suggestedTags: ['Image'],
      confidenceScore: 0.90,
    };
  }

  /**
   * Tries to extract meaningful context from the URI path.
   * Returns null if the URI is just a UUID or hash (no useful info).
   */
  private static extractContextFromUri(uri: string): string | null {
    if (!uri) return null;
    const lower = uri.toLowerCase();

    // Known context patterns
    if (lower.includes('linkedin')) {
      return 'A LinkedIn post with professional content and networking insights.';
    }
    if (lower.includes('twitter') || lower.includes('x.com')) {
      return 'A tweet or X post with social media content.';
    }
    if (lower.includes('pricing') || lower.includes('paywall') || lower.includes('revenuecat')) {
      return 'RevenueCat pricing or paywall strategy screenshot.';
    }
    if (lower.includes('figma') || lower.includes('design')) {
      return 'A design file or UI mockup screenshot.';
    }
    if (lower.includes('github') || lower.includes('code')) {
      return 'A code snippet or GitHub repository screenshot.';
    }

    // Extract filename and check if it's meaningful (not a UUID/hash)
    const filename = uri.split('/').pop()?.split('?')[0] || '';
    const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp|gif|heic|bmp)$/i, '');

    // Detect UUID/hash filenames — these have no useful info
    if (this.isUuidOrHash(nameWithoutExt)) {
      return null;
    }

    // If filename has readable words (not just numbers/hashes), use it
    const cleaned = nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\d{10,}/g, '') // remove long number sequences (timestamps)
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned.length >= 8 && /[a-zA-Z]{3,}/.test(cleaned)) {
      return cleaned;
    }

    return null;
  }

  /**
   * Detects if a string is a UUID, hash, or random ID (not human-readable)
   */
  private static isUuidOrHash(str: string): boolean {
    if (!str) return true;
    // UUID pattern
    if (/^[0-9a-f]{8}[-]?[0-9a-f]{4}[-]?[0-9a-f]{4}[-]?[0-9a-f]{4}[-]?[0-9a-f]{12}$/i.test(str)) return true;
    // Hex hash (16+ chars of just hex)
    if (/^[0-9a-f]{16,}$/i.test(str)) return true;
    // Mostly numbers and hex chars with dashes
    if (/^[0-9a-f\-]{20,}$/i.test(str)) return true;
    // IMG_ or photo_ with just numbers
    if (/^(img|image|photo|pic|screenshot)[-_]?\d+$/i.test(str)) return true;
    return false;
  }

  private static tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));
  }

  private static extractEntities(text: string): string[] {
    if (!text) return [];
    const matches = text.match(/\b[A-Z][a-zA-Z0-9_-]{2,}\b/g) || [];
    const unique = Array.from(new Set(matches));
    return unique.filter(e => !['The', 'And', 'For', 'With', 'From', 'This', 'That', 'Your', 'Image', 'Saved'].includes(e));
  }

  private static determineClassification(text: string, tokens: string[]): MemoryType {
    const lower = text.toLowerCase();

    if (lower.includes('price') || lower.includes('paywall') || lower.includes('dollar') || lower.includes('subscription') || lower.includes('revenuecat') || lower.includes('$')) {
      return 'pricing';
    }
    if (lower.includes('import') || lower.includes('const') || lower.includes('function') || lower.includes('code') || lower.includes('sdk') || lower.includes('api')) {
      return 'code';
    }
    if (lower.includes('diagram') || lower.includes('schema') || lower.includes('flowchart') || lower.includes('whiteboard') || lower.includes('architecture')) {
      return 'whiteboard';
    }
    return 'image';
  }

  private static synthesizeTLDR(text: string, entities: string[], type: MemoryType): string {
    const cleanText = text.replace(/\s+/g, ' ').trim();

    // If first sentence is clean and descriptive, use it
    const firstSentence = cleanText.split(/[.!?\n]/)[0]?.trim();
    if (firstSentence && firstSentence.length >= 10 && firstSentence.length <= 110) {
      return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
    }

    // Synthesize from entities
    const platform = entities.find(e => ['LinkedIn', 'Twitter', 'GitHub', 'RevenueCat', 'Stripe', 'Figma'].includes(e));
    const topics = entities.filter(e => e !== platform).slice(0, 3).join(', ');

    if (platform && topics) {
      return `${platform} — ${topics}`;
    }
    if (platform) {
      return `${platform} screenshot`;
    }
    if (topics) {
      return topics;
    }

    // Fallback
    const now = new Date();
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `Saved ${dateStr}`;
  }

  private static generateDynamicTags(text: string, tokens: string[], entities: string[], type: MemoryType): string[] {
    const tagSet = new Set<string>();

    // Add proper noun entities
    entities.forEach(e => {
      if (e.length >= 3 && e.length <= 20) tagSet.add(e);
    });

    // Semantic category tags
    if (type === 'pricing') tagSet.add('Pricing');
    if (type === 'code') tagSet.add('Code');
    if (type === 'whiteboard') tagSet.add('Architecture');

    // Top frequency tokens (only if they're real words)
    const counts: Record<string, number> = {};
    tokens.forEach(t => { counts[t] = (counts[t] || 0) + 1; });

    Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 4)
      .forEach(t => {
        const capitalized = t.charAt(0).toUpperCase() + t.slice(1);
        if (capitalized.length >= 3 && /^[a-zA-Z]+$/.test(capitalized)) {
          tagSet.add(capitalized);
        }
      });

    // Only add 'Image' tag if nothing else was generated
    if (tagSet.size === 0) {
      tagSet.add('Image');
    }

    return Array.from(tagSet).slice(0, 6);
  }
}
