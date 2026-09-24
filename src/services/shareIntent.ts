import { Linking } from 'react-native';
import { copyAsync, cacheDirectory } from 'expo-file-system/legacy';

/**
 * Share Intent Receiver Service
 * Handles incoming Android share intents (images + text/URLs from Gallery, Instagram, etc.)
 */
export class ShareIntentService {
  private static lastProcessedUrl: string | null = null;
  private static lastProcessedTime: number = 0;

  /**
   * Safely parses deep link URLs into structured shared content
   */
  static parseUrl(url: string): { type: 'text' | 'image' | null; data: string | null; extraText?: string } {
    try {
      if (!url) return { type: null, data: null };

      // Parse as URL to handle multi-param deep links (e.g. sharedImage=...&sharedText=...)
      let imageParam: string | null = null;
      let textParam: string | null = null;

      if (url.includes('sharedImage=') || url.includes('sharedText=')) {
        try {
          const parsed = new URL(url);
          imageParam = parsed.searchParams.get('sharedImage');
          textParam = parsed.searchParams.get('sharedText');
        } catch {
          // Fallback: manual extraction
          if (url.includes('sharedImage=')) {
            const raw = url.substring(url.indexOf('sharedImage=') + 12).split('&')[0];
            imageParam = decodeURIComponent(raw);
          }
          if (url.includes('sharedText=')) {
            const raw = url.substring(url.indexOf('sharedText=') + 11).split('&')[0];
            textParam = decodeURIComponent(raw);
          }
        }
      }

      if (imageParam) {
        return { type: 'image', data: imageParam, extraText: textParam || undefined };
      }

      if (textParam) {
        return { type: 'text', data: textParam };
      }

      // Direct file:// or content:// or image URLs
      if (url.startsWith('file://') || url.startsWith('content://') || url.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
        return { type: 'image', data: url };
      }

      // Direct Web URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return { type: 'text', data: url };
      }

      return { type: null, data: null };
    } catch {
      return { type: null, data: null };
    }
  }

  /**
   * Check if the app was opened via a share intent and extract shared data
   */
  static async getSharedContent(): Promise<{ type: 'text' | 'image' | null; data: string | null; extraText?: string }> {
    try {
      const initialUrl = await Linking.getInitialURL();
      const now = Date.now();

      if (!initialUrl) {
        return { type: null, data: null };
      }

      // Only ignore if the exact same URL was processed in the last 1.2 seconds
      if (initialUrl === this.lastProcessedUrl && now - this.lastProcessedTime < 1200) {
        return { type: null, data: null };
      }

      this.lastProcessedUrl = initialUrl;
      this.lastProcessedTime = now;

      return this.parseUrl(initialUrl);
    } catch (error) {
      console.warn('[ShareIntentService] Error getting shared content:', error);
      return { type: null, data: null };
    }
  }

  /**
   * Copy a content:// URI to app cache so expo-file-system can read it as base64
   */
  static async copyToCache(contentUri: string): Promise<string> {
    try {
      // If already a local file path, return immediately
      if (contentUri.startsWith('file://') || !contentUri.startsWith('content://')) {
        return contentUri;
      }
      const filename = `shared_${Date.now()}.jpg`;
      const destination = `${cacheDirectory}${filename}`;
      await copyAsync({ from: contentUri, to: destination });
      return destination;
    } catch (error) {
      console.warn('[ShareIntentService] Failed to copy to cache:', error);
      return contentUri;
    }
  }

  /**
   * Listen for share intents while app is already open
   */
  static addListener(callback: (type: 'text' | 'image', data: string, extraText?: string) => void): () => void {
    const subscription = Linking.addEventListener('url', (event) => {
      const now = Date.now();
      if (!event.url) return;

      if (event.url === this.lastProcessedUrl && now - this.lastProcessedTime < 1200) {
        return;
      }

      this.lastProcessedUrl = event.url;
      this.lastProcessedTime = now;

      const parsed = this.parseUrl(event.url);
      if (parsed.type && parsed.data) {
        callback(parsed.type, parsed.data, parsed.extraText);
      }
    });

    return () => subscription.remove();
  }
}
