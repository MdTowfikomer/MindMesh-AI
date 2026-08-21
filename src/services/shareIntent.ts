import { Linking } from 'react-native';
import { copyAsync, cacheDirectory } from 'expo-file-system/legacy';

/**
 * Share Intent Receiver Service
 * Handles incoming Android share intents (images + text/URLs from Gallery, Instagram, etc.)
 */
export class ShareIntentService {
  private static lastProcessedUrl: string | null = null;

  /**
   * Safely parses deep link URLs into structured shared content
   */
  static parseUrl(url: string): { type: 'text' | 'image' | null; data: string | null } {
    try {
      if (!url) return { type: null, data: null };

      if (url.includes('sharedImage=')) {
        const raw = url.split('sharedImage=')[1]?.split('&')[0];
        if (raw) {
          let decoded = raw;
          try {
            decoded = decodeURIComponent(raw);
          } catch {
            decoded = raw;
          }
          return { type: 'image', data: decoded };
        }
      }

      if (url.includes('sharedText=')) {
        const raw = url.split('sharedText=')[1]?.split('&')[0];
        if (raw) {
          let decoded = raw;
          try {
            decoded = decodeURIComponent(raw);
          } catch {
            decoded = raw;
          }
          return { type: 'text', data: decoded };
        }
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
  static async getSharedContent(): Promise<{ type: 'text' | 'image' | null; data: string | null }> {
    try {
      const initialUrl = await Linking.getInitialURL();

      if (!initialUrl || initialUrl === this.lastProcessedUrl) {
        return { type: null, data: null };
      }
      this.lastProcessedUrl = initialUrl;

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
  static addListener(callback: (type: 'text' | 'image', data: string) => void): () => void {
    const subscription = Linking.addEventListener('url', (event) => {
      if (!event.url || event.url === this.lastProcessedUrl) return;
      this.lastProcessedUrl = event.url;

      const parsed = this.parseUrl(event.url);
      if (parsed.type && parsed.data) {
        callback(parsed.type, parsed.data);
      }
    });

    return () => subscription.remove();
  }
}
