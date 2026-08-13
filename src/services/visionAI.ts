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
 * Vision AI Service — sends image to proxy server for Gemini analysis
 * API key stays 100% server-side
 */
export class VisionAIService {
  private static readonly PROMPT = `You are an AI assistant for a note-taking app similar to mymind. Analyze this image and return a JSON response with:

1. "title": A short, descriptive title (max 8 words) that captures what this image is about. Like a human would label it.
2. "tldr": A 1-2 sentence summary of the content in the image.
3. "tags": An array of 3-6 relevant tags (single words or short phrases). Be specific - use proper nouns, topics, and categories.
4. "classification": One of: "image", "pricing", "code", "whiteboard", "text"
5. "ocrText": Extract any readable text from the image (first 300 chars max). If no text, return empty string.

IMPORTANT: Return ONLY valid JSON, no markdown, no backticks, no explanation. Just the raw JSON object.`;

  static async analyzeImage(imageUri: string): Promise<VisionAnalysisResult> {
    try {
      // Read image as base64
      const base64 = await readAsStringAsync(imageUri, {
        encoding: EncodingType.Base64,
      });

      const mimeType = this.getMimeType(imageUri);
      const url = `${API_CONFIG.PROXY_BASE_URL}${API_CONFIG.VISION_ENDPOINT}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-key': API_CONFIG.APP_SECRET,
        },
        body: JSON.stringify({
          prompt: this.PROMPT,
          imageBase64: base64,
          mimeType,
        }),
      });

      if (!response.ok) {
        console.warn('VisionAI: Proxy error', response.status);
        return this.getFallbackResult();
      }

      const data = await response.json();
      if (!data.success || !data.text) {
        return this.getFallbackResult();
      }

      return this.parseResponse(data.text);
    } catch (error) {
      console.warn('VisionAI: Failed to analyze image', error);
      return this.getFallbackResult();
    }
  }

  private static parseResponse(rawText: string): VisionAnalysisResult {
    try {
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

  private static validateClassification(cls: string): MemoryType {
    const valid: MemoryType[] = ['image', 'pricing', 'code', 'whiteboard', 'text'];
    if (valid.includes(cls as MemoryType)) return cls as MemoryType;
    return 'image';
  }

  private static getMimeType(uri: string): string {
    const lower = uri.toLowerCase();
    if (lower.includes('.png')) return 'image/png';
    if (lower.includes('.gif')) return 'image/gif';
    if (lower.includes('.webp')) return 'image/webp';
    if (lower.includes('.heic') || lower.includes('.heif')) return 'image/heic';
    return 'image/jpeg';
  }

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
