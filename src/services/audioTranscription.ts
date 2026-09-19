import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { API_CONFIG } from '../config/api';

export interface TranscriptionResult {
  transcription: string;
  title: string;
  category: 'Task' | 'Decision' | 'Idea' | 'Question' | 'Reminder' | 'Note';
  tags: string[];
}

/**
 * Audio Transcription Service — sends audio to proxy server for Gemini transcription
 * API key stays 100% server-side
 */
export class AudioTranscriptionService {
  private static readonly PROMPT = `You are a voice note transcription assistant. Transcribe this audio and analyze its content.

Return ONLY valid JSON (no markdown, no backticks):
{
  "transcription": "The full transcription of what was said",
  "title": "A short title (max 6 words) summarizing the voice note",
  "category": "One of: Task, Decision, Idea, Question, Reminder, Note",
  "tags": ["3-5 relevant tags based on what was discussed"]
}

CATEGORY RULES:
- "Task" — if the speaker mentions something they need to do, build, or finish
- "Decision" — if the speaker is weighing options or making a choice
- "Idea" — if the speaker is brainstorming, imagining, or exploring something new
- "Question" — if the speaker is asking or wondering about something
- "Reminder" — if the speaker wants to remember something for later
- "Note" — for general observations or thoughts that don't fit other categories

Write the transcription exactly as spoken. Don't clean up casual speech.`;

  static async transcribe(audioUri: string): Promise<TranscriptionResult> {
    try {
      const { ByokService } = await import('./byokService');
      const hasCustom = await ByokService.hasCustomKey();

      if (!hasCustom) {
        // Protect server key: instant local offline voice note for default users
        console.log('[AudioTranscription] 📱 Default mode (no BYOK key): saving instant offline voice note');
        return this.getFallback();
      }

      const base64 = await readAsStringAsync(audioUri, {
        encoding: EncodingType.Base64,
      });

      const mimeType = this.getMimeType(audioUri);
      const config = await ByokService.loadConfig();
      const customModel = config.model || 'gemini-3.5-flash';

      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${customModel}:generateContent?key=${config.apiKey}`;
      const response = await fetch(directUrl, {
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

      if (!response.ok) {
        console.warn('[AudioTranscription] Direct BYOK error:', response.status);
        return this.getFallback();
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return this.getFallback();

      return this.parseResponse(text);
    } catch (error) {
      console.warn('[AudioTranscription] Failed:', error);
      return this.getFallback();
    }
  }

  private static parseResponse(rawText: string): TranscriptionResult {
    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const json = JSON.parse(cleaned);

      return {
        transcription: json.transcription || 'Voice note recorded',
        title: json.title || 'Voice Thought',
        category: this.validateCategory(json.category),
        tags: Array.isArray(json.tags) ? json.tags.slice(0, 5) : ['VoiceMemo'],
      };
    } catch (e) {
      console.warn('[AudioTranscription] Parse error:', rawText);
      return this.getFallback();
    }
  }

  private static validateCategory(cat: string): TranscriptionResult['category'] {
    const valid: TranscriptionResult['category'][] = ['Task', 'Decision', 'Idea', 'Question', 'Reminder', 'Note'];
    if (valid.includes(cat as any)) return cat as TranscriptionResult['category'];
    return 'Note';
  }

  private static getMimeType(uri: string): string {
    const lower = uri.toLowerCase();
    if (lower.includes('.m4a')) return 'audio/mp4';
    if (lower.includes('.mp3')) return 'audio/mpeg';
    if (lower.includes('.wav')) return 'audio/wav';
    if (lower.includes('.ogg')) return 'audio/ogg';
    if (lower.includes('.aac')) return 'audio/aac';
    return 'audio/mp4';
  }

  private static getFallback(): TranscriptionResult {
    return {
      transcription: 'Voice note recorded (transcription unavailable)',
      title: 'Voice Thought',
      category: 'Note',
      tags: ['VoiceMemo'],
    };
  }
}
