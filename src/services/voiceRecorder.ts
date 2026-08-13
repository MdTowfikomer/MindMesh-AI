import { Audio } from 'expo-av';

export interface RecordingResult {
  uri: string;
  durationSeconds: number;
}

/**
 * Voice Recorder Service — real audio recording with expo-av
 */
export class VoiceRecorderService {
  private static recording: Audio.Recording | null = null;
  private static startTime: number = 0;

  /**
   * Request permissions and start recording
   */
  static async startRecording(): Promise<boolean> {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.warn('[VoiceRecorder] Microphone permission denied');
        return false;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.startTime = Date.now();
      return true;
    } catch (error) {
      console.warn('[VoiceRecorder] Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Stop recording and return the audio file URI + duration
   */
  static async stopRecording(): Promise<RecordingResult | null> {
    try {
      if (!this.recording) return null;

      await this.recording.stopAndUnloadAsync();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = this.recording.getURI();
      const durationSeconds = Math.round((Date.now() - this.startTime) / 1000);

      this.recording = null;
      this.startTime = 0;

      if (!uri) return null;

      return { uri, durationSeconds };
    } catch (error) {
      console.warn('[VoiceRecorder] Failed to stop recording:', error);
      this.recording = null;
      return null;
    }
  }

  /**
   * Check if currently recording
   */
  static isRecording(): boolean {
    return this.recording !== null;
  }
}
