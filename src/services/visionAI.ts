import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { API_CONFIG } from '../config/api';
import { MemoryType } from '../types/mindmesh';

export interface VisionAnalysisResult {
  title: string;
  tldr: string;
  tags: string[];
  classification: MemoryType;
  ocrText: string;
  confidenceScore: number;
}

/**
 * Google Gemini Flash 2.0 Vision AI Service
 * Sends image to Gemini for OCR, title generation, and auto-tagging.
 * Free tier: 15 req/min, 1500 req/day
 */
export class VisionAIService {
  private static readonly PROMPT = `You are an AI assistant for a note-taking app similar to mymind. Analyze this image and return a JSON response with:

1. "title": A short, descriptive title (max 8 words) that captures what this image is about. Like a human would label it. Examples: "LinkedIn Post About Open Source Programs", "Smart Sensors Infographic", "RevenueCat Pricing Page"
2. "tldr": A 1-2 sentence summary of the content in the image.
3. "tags": An array of 3-6 relevant tags (single words or short phrases). Be specific - use proper nouns, topics, and categories. Examples: ["LinkedIn", "Open Source", "GSoC", "Engineering"]
4. "classification": One of: "image", "pricing", "code", "whiteboard", "text"
   - "pricing" if it shows pricing, subscriptions, paywalls, or money-related content
   - "code" if it shows code snippets, terminal, IDE, or programming content
   - "whiteboard" if it shows diagrams, flowcharts, architecture, or hand-drawn sketches
   - "text" if it's primarily a text post or note (like a tweet, LinkedIn post, Reddit post)
   - "image" for everything else (photos, screenshots of apps, UI designs, infographics)
5. "ocrText": Extract any readable text from the image (first 300 chars max). If no text, return empty string.

IMPORTANT: Return ONLY valid JSON, no markdown, no backticks, no explanation. Just the raw JSON object.`;

  /**
   * Analyze an image using Gemini Vision
   */
  static async analyzeImage(imageUri: string): Promise<VisionAnalysisResult> {
    const apiKey = API_CONFIG.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn('VisionAI: No Gemini API key configured. Using fallback.');
      return this.getFallbackResult();
    }

    try {
      // Read image as base64
      const base64 = await readAsStringAsync(imageUri, {
        encoding: EncodingType.Base64,
      });

      // Determine MIME type from URI
      const mimeType = this.getMimeType(imageUri);

      // Call Gemini API
      const url = `${API_CONFIG.GEMINI_ENDPOINT}/${API_CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: this.PROMPT },
                {
                  inlineData: {
                    mimeType,
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('VisionAI: API error', response.status, errorText);
        return this.getFallbackResult();
      }

      const data = await response.json();

      // Extract text from Gemini response
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = this.parseResponse(rawText);

      return parsed;
    } catch (error) {
      console.warn('VisionAI: Failed to analyze image', error);
      return this.getFallbackResult();
    }
  }

  /**
   * Parse Gemini's JSON response, handling edge cases
   */
  private static parseResponse(rawText: string): VisionAnalysisResult {
    try {
      // Strip markdown code fences if present
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const json = JSON.parse(cleaned);

      return {
        title: json.title || 'Saved Image',
        tldr: json.tldr || '',
        tags: Array.isArray(json.tags) ? json.tags.slice(0, 6) : ['Image'],
        classification: this.validateClassification(json.classification),
        ocrText: json.ocrText || '',
        confidenceScore: 0.95,
      };
    } catch (e) {
      console.warn('VisionAI: Failed to parse response:', rawText);
      return this.getFallbackResult();
    }
  }

  /**
   * Validate classification is one of our accepted types
   */
  private static validateClassification(cls: string): MemoryType {
    const valid: MemoryType[] = ['image', 'pricing', 'code', 'whiteboard', 'text'];
    if (valid.includes(cls as MemoryType)) {
      return cls as MemoryType;
    }
    return 'image';
  }

  /**
   * Determine MIME type from file URI
   */
  private static getMimeType(uri: string): string {
    const lower = uri.toLowerCase();
    if (lower.includes('.png')) return 'image/png';
    if (lower.includes('.gif')) return 'image/gif';
    if (lower.includes('.webp')) return 'image/webp';
    if (lower.includes('.heic') || lower.includes('.heif')) return 'image/heic';
    return 'image/jpeg';
  }

  /**
   * Fallback when API is unavailable
   */
  private static getFallbackResult(): VisionAnalysisResult {
    const now = new Date();
    const dateStr = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      title: `Saved ${dateStr} at ${timeStr}`,
      tldr: '',
      tags: ['Image'],
      classification: 'image',
      ocrText: '',
      confidenceScore: 0.90,
    };
  }
}
