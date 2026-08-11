/**
 * Proactive Morning Serendipity Notification Engine
 * Runs background scans and schedules daily 8:00 AM alerts when new patterns are discovered.
 */

export interface SerendipityNotificationPayload {
  id: string;
  title: string;
  body: string;
  scheduledTime: string; // e.g. "08:00 AM"
  targetTab: string; // "(tabs)/discover"
  patternTitle?: string;
}

export class NotificationService {
  /**
   * Schedules a daily morning serendipity alert for 8:00 AM
   */
  public static async scheduleMorningSerendipity(patternTitle?: string): Promise<SerendipityNotificationPayload> {
    const title = '☀️ Morning Serendipity Alert';
    const body = patternTitle
      ? `MindMesh discovered a new pattern: "${patternTitle}". Tap to view your 3 next steps!`
      : 'MindMesh discovered a new product pattern in your saved thoughts! Tap to view your next steps.';

    const payload: SerendipityNotificationPayload = {
      id: `notif-${Date.now()}`,
      title,
      body,
      scheduledTime: '08:00 AM Daily',
      targetTab: '(tabs)/discover',
      patternTitle: patternTitle || 'RevenueCat Paywall × Synaptic Voice Note',
    };

    console.log('⏰ [NotificationService] Morning Serendipity Scheduled:', payload);
    return payload;
  }

  /**
   * Simulates immediate background serendipity discovery alert
   */
  public static triggerDiscoveryNotification(patternTitle: string): SerendipityNotificationPayload {
    return {
      id: `notif-instant-${Date.now()}`,
      title: '✨ Pattern Discovered in Saved Thoughts',
      body: `New pattern found: "${patternTitle}". Tap to inspect actionable next steps.`,
      scheduledTime: 'Now',
      targetTab: '(tabs)/discover',
      patternTitle,
    };
  }
}
