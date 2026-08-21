import { readAsStringAsync, copyAsync, cacheDirectory, EncodingType } from 'expo-file-system/legacy';
import { API_CONFIG } from '../config/api';
import { MemoryType } from '../types/mindmesh';
import { RemoteLogger } from './logger';

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
      let resolvedUri = imageUri;

      // If content:// URI, copy to local cache directory so base64 read never fails
      if (imageUri.startsWith('content://')) {
        try {
          const filename = `vision_${Date.now()}.jpg`;
          const cachePath = `${cacheDirectory}${filename}`;
          await copyAsync({ from: imageUri, to: cachePath });
          resolvedUri = cachePath;
        } catch (copyErr) {
          console.warn('[VisionAI] Failed to copy content URI to cache:', copyErr);
        }
      }

      // Read image as base64
      const base64 = await readAsStringAsync(resolvedUri, {
        encoding: EncodingType.Base64,
      });

      const mimeType = this.getMimeType(imageUri);

      // ─── Stage 1: BYOK (Bring Your Own Key) Direct On-Device Execution ───
      const { ByokService } = await import('./byokService');
      const hasCustom = await ByokService.hasCustomKey();
      if (hasCustom) {
        const config = await ByokService.loadConfig();
        const customModel = config.model || 'gemini-3.5-flash';
        console.log(`[VisionAI] 🚀 Executing direct on-device Gemini call with User BYOK Key (${customModel})`);
        RemoteLogger.info("🔑 Executing Vision AI request with User's BYOK Gemini API Key", {
          model: customModel,
          keyPrefix: config.apiKey ? config.apiKey.slice(0, 8) + '...' : '',
          imageSizeKb: Math.round(base64.length / 1024),
        }, 'VisionAI-BYOK');

        try {
          const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${customModel}:generateContent?key=${config.apiKey}`;
          const directRes = await fetch(directUrl, {
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
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            }),
          });

          if (directRes.ok) {
            const directJson = await directRes.json();
            const text = directJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              console.log(`[VisionAI] ✅ Direct BYOK Gemini Success (${customModel})`);
              RemoteLogger.info("✅ BYOK Gemini Vision analysis completed successfully", { model: customModel }, 'VisionAI-BYOK');
              return this.parseResponse(text);
            }
          } else {
            console.warn(`[VisionAI] BYOK direct call returned HTTP ${directRes.status}, falling back to proxy`);
            RemoteLogger.warn(`BYOK direct call returned HTTP ${directRes.status}, falling back to developer default key`, { status: directRes.status }, 'VisionAI-BYOK');
          }
        } catch (byokErr: any) {
          console.warn('[VisionAI] BYOK direct call error, falling back to proxy:', byokErr);
          RemoteLogger.warn('BYOK direct call failed, falling back to developer default key', { error: byokErr?.message }, 'VisionAI-BYOK');
        }
      }

      // ─── Stage 2: Central Developer / System Default Proxy Fallback ───
      const url = `${API_CONFIG.PROXY_BASE_URL}${API_CONFIG.VISION_ENDPOINT}`;

      console.log(`[VisionAI] ⚡ Executing image analysis with Developer's Default System Key (Vercel Proxy) (Size: ${Math.round(base64.length / 1024)} KB)`);
      RemoteLogger.info("⚡ Executing Vision AI request with Developer's Default System Key (Vercel Proxy)", {
        endpoint: url,
        imageSizeKb: Math.round(base64.length / 1024),
      }, 'VisionAI-DefaultProxy');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-key': API_CONFIG.APP_SECRET || 'SHIPATHON',
        },
        body: JSON.stringify({
          prompt: this.PROMPT,
          imageBase64: base64,
          mimeType,
        }),
      });

      console.log(`[VisionAI] 📥 Response Status: ${response.status}`);

      if (!response.ok) {
        console.warn(`[VisionAI] ⚠️ Proxy returned HTTP ${response.status}`);
        RemoteLogger.warn(`Vision AI proxy returned HTTP ${response.status}`, { imageUri: resolvedUri, status: response.status }, 'VisionAI');
        return this.getFallbackResult();
      }

      const data = await response.json();
      if (!data.success || !data.text) {
        console.warn('[VisionAI] ⚠️ Proxy returned unsuccessful or empty response:', data);
        RemoteLogger.warn('Vision AI proxy returned empty/unsuccessful response', { imageUri: resolvedUri, data }, 'VisionAI');
        return this.getFallbackResult();
      }

      console.log(`[VisionAI] 📄 Raw AI Response (${data.modelUsed}):`, data.text.replace(/\n/g, ' '));
      const parsed = this.parseResponse(data.text);
      console.log(`[VisionAI] ✅ Successfully Parsed Title: "${parsed.title}" | Tags: [${parsed.tags.join(', ')}]`);
      return parsed;
    } catch (error: any) {
      console.error('[VisionAI] ❌ Exception in analyzeImage:', error);
      RemoteLogger.error('Vision AI failed to read or upload image', {
        error: error?.message || String(error),
        stack: error?.stack,
        imageUri,
      }, 'VisionAI');
      throw error;
    }
  }

  private static parseResponse(rawText: string): VisionAnalysisResult {
    try {
      let cleaned = rawText.trim();
      
      // Match outermost JSON object { ... }
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        cleaned = match[0];
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const json = JSON.parse(cleaned);

      return {
        title: json.title || 'Saved Image',
        tldr: json.tldr || '',
        tags: Array.isArray(json.tags) && json.tags.length > 0 ? json.tags.slice(0, 6) : ['Image'],
        classification: this.validateClassification(json.classification),
        ocrText: json.ocrText || '',
        confidenceScore: 0.95,
      };
    } catch (e) {
      console.warn('[VisionAI] JSON parse exception, extracting regex fields from partial text:', rawText);
      
      // Regex extraction fallback for truncated responses
      const titleMatch = rawText.match(/"title"\s*:\s*"([^"\n\\]*)/);
      const tldrMatch = rawText.match(/"tldr"\s*:\s*"([^"\n\\]*)/);
      const tagsMatch = rawText.match(/"tags"\s*:\s*\[([\s\S]*?)\]/);
      let extractedTags: string[] = [];
      if (tagsMatch) {
        extractedTags = tagsMatch[1]
          .split(',')
          .map((t) => t.replace(/["'\s]/g, ''))
          .filter(Boolean);
      }

      if (titleMatch && titleMatch[1].trim().length > 0) {
        return {
          title: titleMatch[1].trim(),
          tldr: tldrMatch ? tldrMatch[1].trim() : '',
          tags: extractedTags.length > 0 ? extractedTags : ['Image', 'Visual'],
          classification: 'image',
          ocrText: '',
          confidenceScore: 0.9,
        };
      }

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
