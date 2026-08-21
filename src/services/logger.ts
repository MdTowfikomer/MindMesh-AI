import { API_CONFIG } from '../config/api';

/**
 * RemoteLogger Service
 * Sends client-side errors, diagnostic logs, and platform telemetry
 * to the backend proxy server so they appear directly in the server terminal logs.
 */
export class RemoteLogger {
  static async log(
    level: 'info' | 'warn' | 'error',
    message: string,
    details?: any,
    source?: string
  ): Promise<void> {
    try {
      const url = `${API_CONFIG.PROXY_BASE_URL}/api/v1/log`;
      const payload = {
        level,
        message,
        details: details ? (typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)) : undefined,
        source: source || 'MindMeshApp',
        timestamp: new Date().toISOString(),
      };

      // Non-blocking fire-and-forget request to backend
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-key': API_CONFIG.APP_SECRET || 'SHIPATHON',
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn('[RemoteLogger] Unable to reach backend logging server:', err?.message);
      });
    } catch {
      // Prevent any logging error from interrupting app execution
    }
  }

  static error(message: string, details?: any, source?: string) {
    console.error(`[RemoteLogger] ❌ ${message}`, details || '');
    return this.log('error', message, details, source);
  }

  static warn(message: string, details?: any, source?: string) {
    console.warn(`[RemoteLogger] ⚠️ ${message}`, details || '');
    return this.log('warn', message, details, source);
  }

  static info(message: string, details?: any, source?: string) {
    console.log(`[RemoteLogger] ℹ️ ${message}`, details || '');
    return this.log('info', message, details, source);
  }
}
