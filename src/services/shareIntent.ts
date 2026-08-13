import { Linking } from 'react-native';
import { copyAsync, cacheDirectory } from 'expo-file-system/legacy';

/**
 * Share Intent Receiver Service
 * Handles incoming Android share intents (images + text/URLs from Gallery, Instagram, etc.)
 */
export class ShareIntentService {
  private static lastProcessedUrl: string | null = null;

  /**
   * Check if the app was opened via a share intent and extract shared data
   */
  static async getSharedContent(): Promise<{ type: 'text' | 'image' | null; data: string | null }> {
    try {
      const initialUrl = await Linking.getInitialURL();

      if (!initialUrl) {
        return { type: null, data: null };
      }

      // Avoid processing the same URL twice
      if (initialUrl === this.lastProcessedUrl) {
        return { type: null, data: null };
      }
      this.lastProcessedUrl = initialUrl;

      // Parse deep link query params (e.g. mindmesh://feed?sharedImage=content%3A%2F%2F...)
      if (initialUrl.includes('sharedImage=')) {
        const match = initialUrl.match(/sharedImage=([^&]+)/);
        if (match) {
          const imageUri = decodeURIComponent(match[1]);
          return { type: 'image', data: imageUri };
        }
      }

      if (initialUrl.includes('sharedText=')) {
        const match = initialUrl.match(/sharedText=([^&]+)/);
        if (match) {
          const text = decodeURIComponent(match[1]);
          return { type: 'text', data: text };
        }
      }

      // Direct content:// URI (shared image directly)
      if (initialUrl.startsWith('content://') || initialUrl.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
        return { type: 'image', data: initialUrl };
      }

      // Direct URL (shared link)
      if (initialUrl.startsWith('http://') || initialUrl.startsWith('https://')) {
        return { type: 'text', data: initialUrl };
      }

      return { type: null, data: null };
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

      // Parse deep link params
      if (event.url.includes('sharedImage=')) {
        const match = event.url.match(/sharedImage=([^&]+)/);
        if (match) {
          callback('image', decodeURIComponent(match[1]));
          return;
        }
      }

      if (event.url.includes('sharedText=')) {
        const match = event.url.match(/sharedText=([^&]+)/);
        if (match) {
          callback('text', decodeURIComponent(match[1]));
          return;
        }
      }

      // Direct URIs
      if (event.url.startsWith('content://') || event.url.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
        callback('image', event.url);
      } else if (event.url.startsWith('http://') || event.url.startsWith('https://')) {
        callback('text', event.url);
      }
    });

    return () => subscription.remove();
  }
}
