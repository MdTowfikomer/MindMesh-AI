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
      const base64 = await readAsStringAsync(audioUri, {
        encoding: EncodingType.Base64,
      });

      const mimeType = this.getMimeType(audioUri);
      const url = `${API_CONFIG.PROXY_BASE_URL}${API_CONFIG.AUDIO_ENDPOINT}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-key': API_CONFIG.APP_SECRET,
        },
        body: JSON.stringify({
          prompt: this.PROMPT,
          audioBase64: base64,
          mimeType,
        }),
      });

      if (!response.ok) {
        console.warn('[AudioTranscription] Proxy error', response.status);
        return this.getFallback();
      }

      const data = await response.json();
      if (!data.success || !data.text) {
        return this.getFallback();
      }

      return this.parseResponse(data.text);
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
