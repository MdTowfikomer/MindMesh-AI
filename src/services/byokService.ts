import { SQLiteDatabaseService } from './sqliteDatabase';

export interface BYOKConfig {
  apiKey: string | null;
  model: string;
  isVerified: boolean;
  lastTestedAt?: number;
  latencyMs?: number;
}

export interface ModelPreset {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

export const GEMINI_MODEL_PRESETS: ModelPreset[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Recommended • Fast, smart & multimodal', isDefault: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Next-gen multimodal speed & precision' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Economical, high-throughput & reliable' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Complex reasoning & deep synthesis' },
];

const STORAGE_KEY = 'byok_gemini_config';

export class ByokService {
  private static cachedConfig: BYOKConfig | null = null;

  /**
   * Resolves model names to valid Google AI Studio endpoints
   */
  public static resolveModel(modelName?: string | null): string {
    if (!modelName) return 'gemini-2.5-flash';
    // Map non-existent or legacy 3.x identifiers to official frontier 2.5 flash
    if (modelName.startsWith('gemini-3.')) {
      return 'gemini-2.5-flash';
    }
    return modelName.trim();
  }

  public static async loadConfig(): Promise<BYOKConfig> {
    if (this.cachedConfig) return this.cachedConfig;

    try {
      const raw = await SQLiteDatabaseService.getSetting(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.cachedConfig = {
          ...parsed,
          model: this.resolveModel(parsed.model),
        };
        return this.cachedConfig!;
      }
    } catch (e) {
      console.warn('[ByokService] Error reading config from storage:', e);
    }

    this.cachedConfig = {
      apiKey: null,
      model: 'gemini-2.5-flash',
      isVerified: false,
    };
    return this.cachedConfig;
  }

  public static async saveConfig(config: BYOKConfig): Promise<void> {
    this.cachedConfig = config;
    try {
      await SQLiteDatabaseService.saveSetting(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('[ByokService] Error saving config:', e);
    }
  }

  public static async clearConfig(): Promise<void> {
    this.cachedConfig = {
      apiKey: null,
      model: 'gemini-2.5-flash',
      isVerified: false,
    };
    try {
      await SQLiteDatabaseService.deleteSetting(STORAGE_KEY);
    } catch (e) {
      console.error('[ByokService] Error clearing config:', e);
    }
  }

  public static async hasCustomKey(): Promise<boolean> {
    const config = await this.loadConfig();
    return Boolean(config.apiKey && config.apiKey.trim().length > 10);
  }

  /**
   * Tests the Gemini API Key and Model directly on-device with latency measurement
   */
  public static async testConnection(
    apiKey: string,
    model: string = 'gemini-2.5-flash'
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      return { success: false, latencyMs: 0, error: 'API key cannot be empty' };
    }

    const resolvedModel = this.resolveModel(model);
    const t0 = Date.now();
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 5, temperature: 0.1 },
        }),
      });

      const latencyMs = Date.now() - t0;

      if (res.ok) {
        const json = await res.json();
        if (json.candidates && json.candidates.length > 0) {
          return { success: true, latencyMs };
        }
      }

      const errJson = await res.json().catch(() => ({}));
      const errorMsg = errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      return { success: false, latencyMs, error: errorMsg };
    } catch (e: any) {
      return {
        success: false,
        latencyMs: Date.now() - t0,
        error: e?.message || 'Network request failed. Check your connection.',
      };
    }
  }

  /**
   * Executes a direct on-device Gemini API request with custom credentials
   */
  public static async executeGemini(
    contents: any[],
    options: {
      temperature?: number;
      maxOutputTokens?: number;
      responseMimeType?: string;
    } = {}
  ): Promise<string | null> {
    const config = await this.loadConfig();
    if (!config.apiKey) return null;

    try {
      const model = this.resolveModel(config.model);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: options.maxOutputTokens || 2048,
            temperature: options.temperature ?? 0.2,
            ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn('[ByokService] Direct execution error:', e);
    }
    return null;
  }
}
