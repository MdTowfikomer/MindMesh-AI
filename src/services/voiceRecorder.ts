import { Platform } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  type AudioRecorder,
} from 'expo-audio';

export interface RecordingResult {
  uri: string;
  durationSeconds: number;
}

function getPlatformRecordingOptions() {
  const options = RecordingPresets.HIGH_QUALITY;
  const commonOptions = {
    extension: options.extension,
    sampleRate: options.sampleRate,
    numberOfChannels: options.numberOfChannels,
    bitRate: options.bitRate,
    isMeteringEnabled: false,
  };
  if (Platform.OS === 'ios') {
    return { ...commonOptions, ...options.ios };
  } else if (Platform.OS === 'android') {
    return { ...commonOptions, ...options.android };
  } else {
    return { ...commonOptions, ...options.web };
  }
}

/**
 * Voice Recorder Service — audio recording with expo-audio
 */
export class VoiceRecorderService {
  private static recorder: AudioRecorder | null = null;
  private static startTime: number = 0;

  /**
   * Request permissions and start recording
   */
  static async startRecording(): Promise<boolean> {
    try {
      // Request permissions
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        console.warn('[VoiceRecorder] Microphone permission denied');
        return false;
      }

      // Set audio mode for recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      // Create and prepare recorder
      const platformOptions = getPlatformRecordingOptions();
      const recorder = new AudioModule.AudioRecorder(platformOptions);
      await recorder.prepareToRecordAsync();
      recorder.record();

      this.recorder = recorder;
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
      if (!this.recorder) return null;

      await this.recorder.stop();

      // Reset audio mode
      await setAudioModeAsync({
        allowsRecording: false,
      });

      const uri = this.recorder.uri;
      const durationSeconds = Math.max(
        1,
        Math.round(this.recorder.currentTime || (Date.now() - this.startTime) / 1000)
      );

      this.recorder = null;
      this.startTime = 0;

      if (!uri) return null;

      return { uri, durationSeconds };
    } catch (error) {
      console.warn('[VoiceRecorder] Failed to stop recording:', error);
      this.recorder = null;
      return null;
    }
  }

  /**
   * Check if currently recording
   */
  static isRecording(): boolean {
    return this.recorder !== null && (this.recorder.isRecording ?? false);
  }
}
