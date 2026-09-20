import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Play, Pause, Mic, Volume2 } from './Icons';
import { CyberTheme } from '../theme/cyberLuxury';

interface VoiceMemoPlayerProps {
  mediaUrl?: string;
  audioUri?: string;
  duration?: string;
  waveform?: number[];
  title?: string;
  content?: string;
}

// Generates a speech-harmonic audio WAV base64 fallback for audible voice sound
function generateSyntheticVoiceWavBase64(durationSec: number = 8): string {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * Math.min(durationSec, 15));
  const dataSize = numSamples * 2;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // WAV Header
  view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46); // "RIFF"
  view.setUint32(4, fileSize - 8, true);
  view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45); // "WAVE"
  view.setUint8(12, 0x66); view.setUint8(13, 0x6D); view.setUint8(14, 0x74); view.setUint8(15, 0x20); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61); // "data"
  view.setUint32(40, dataSize, true);

  // Synthesize speech-like vocal formants (F0: ~140Hz, F1: ~500Hz, F2: ~1400Hz with syllabic modulation)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const syllable = Math.pow(Math.sin(2 * Math.PI * 3.2 * t), 2);
    const pitch = 145 + Math.sin(2 * Math.PI * 0.9 * t) * 18;

    const f0 = Math.sin(2 * Math.PI * pitch * t) * 0.45;
    const f1 = Math.sin(2 * Math.PI * 520 * t) * 0.25;
    const f2 = Math.sin(2 * Math.PI * 1380 * t) * 0.15;
    const voiceTone = (f0 + f1 + f2) * syllable * 0.5;

    const sample = Math.max(-0.75, Math.min(0.75, voiceTone));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(44 + i * 2, intSample, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

let cachedSyntheticAudioUri: string | null = null;

async function getSyntheticAudioUri(durationSec: number): Promise<string> {
  if (cachedSyntheticAudioUri) return cachedSyntheticAudioUri;
  const base64 = generateSyntheticVoiceWavBase64(durationSec);
  const path = `${FileSystem.cacheDirectory}synthetic_voice_sample_v1.wav`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  cachedSyntheticAudioUri = path;
  return path;
}

function setPlayerRate(player: AudioPlayer | null, rate: number) {
  if (!player) return;
  try {
    if (typeof (player as any).setPlaybackRate === 'function') {
      (player as any).setPlaybackRate(rate);
    }
  } catch {}
}

export const VoiceMemoPlayer: React.FC<VoiceMemoPlayerProps> = ({
  mediaUrl,
  audioUri,
  duration = '0:15',
  waveform = [35, 60, 85, 45, 90, 70, 50, 80, 95, 40, 65, 85, 50, 75, 90, 60, 45, 75, 85, 55, 65, 90, 40, 70, 80, 50, 60, 30],
  title,
  content,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [sliderWidth, setSliderWidth] = useState(180);

  const playerRef = useRef<AudioPlayer | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sliderWidthRef = useRef(180);

  const audioSource = mediaUrl || audioUri;
  const totalSeconds = useMemoDuration(duration);

  // High-density waveform (28 bars)
  const barHeights = useMemo(() => {
    if (waveform.length >= 24) return waveform;
    // Stretch to 28 items
    const expanded: number[] = [];
    for (let i = 0; i < 28; i++) {
      const origIdx = Math.floor((i / 28) * waveform.length);
      expanded.push(waveform[origIdx] || 40);
    }
    return expanded;
  }, [waveform]);

  useEffect(() => {
    sliderWidthRef.current = sliderWidth;
  }, [sliderWidth]);

  useEffect(() => {
    return () => {
      stopPlaybackTimer();
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch {}
      }
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopPlaybackTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const startPlaybackTimer = () => {
    stopPlaybackTimer();
    const intervalMs = 250 / playbackSpeed;

    progressTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 0.25 * playbackSpeed;
        if (next >= totalSeconds) {
          stopPlaybackTimer();
          setIsPlaying(false);
          setProgressPct(0);
          return 0;
        }
        setProgressPct((next / totalSeconds) * 100);
        return next;
      });
    }, intervalMs);
  };

  const togglePlay = async () => {
    CyberTheme.haptics.medium();

    if (isPlaying) {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
        } catch {}
      }
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
      stopPlaybackTimer();
      return;
    }

    try {
      // Configure audio session for out-loud playback
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      // 1. Play real audio if available
      if (audioSource) {
        if (!playerRef.current) {
          const player = createAudioPlayer({ uri: audioSource });
          playerRef.current = player;
        }
        setPlayerRate(playerRef.current, playbackSpeed);
        playerRef.current.play();
      } else {
        // 2. Fallback: Web Speech API for web OR Synthetic Vocal WAV Audio for mobile
        if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const spokenText = content?.replace(/\[.*?\]/g, '').trim() || title || 'Voice thought recording.';
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.rate = playbackSpeed;
          utterance.onend = () => {
            setIsPlaying(false);
            stopPlaybackTimer();
            setProgressPct(0);
            setElapsedSeconds(0);
          };
          window.speechSynthesis.speak(utterance);
        } else {
          // Synthetic Vocal WAV fallback
          const synthUri = await getSyntheticAudioUri(totalSeconds);
          if (!playerRef.current) {
            const player = createAudioPlayer({ uri: synthUri });
            playerRef.current = player;
          }
          setPlayerRate(playerRef.current, playbackSpeed);
          playerRef.current.play();
        }
      }

      setIsPlaying(true);
      startPlaybackTimer();
    } catch (error) {
      console.warn('[VoiceMemoPlayer] Audio engine playback fallback active:', error);
      setIsPlaying(true);
      startPlaybackTimer();
    }
  };

  const handleSpeedToggle = () => {
    CyberTheme.haptics.light();
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    setPlayerRate(playerRef.current, nextSpeed);
    if (isPlaying) {
      startPlaybackTimer();
    }
  };

  const handleScrub = (locationX: number) => {
    const width = sliderWidthRef.current || 180;
    const pct = Math.max(0, Math.min(1, locationX / width));
    const newSeconds = Math.round(pct * totalSeconds);

    setProgressPct(pct * 100);
    setElapsedSeconds(newSeconds);

    if (playerRef.current) {
      try {
        playerRef.current.seekTo(newSeconds);
      } catch {}
    }
  };

  // Interactive PanResponder for smooth sliding bar drag scrubbing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleScrub(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleScrub(evt.nativeEvent.locationX);
      },
    })
  ).current;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.topHeader}>
        <View style={styles.badgeRow}>
          <View style={styles.micBadgeIcon}>
            <Mic size={12} color="#38BDF8" />
          </View>
          <Text style={styles.badgeTitle}>Voice Thought</Text>
        </View>

        <View style={styles.topRightControls}>
          <TouchableOpacity
            style={styles.speedChip}
            onPress={handleSpeedToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.speedChipText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          <Text style={styles.timerText}>
            {formatTime(Math.floor(elapsedSeconds))} / {duration}
          </Text>
        </View>
      </View>

      {/* Main Controls + Interactive Slider Row */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={togglePlay}
          activeOpacity={0.85}
        >
          {isPlaying ? (
            <Pause size={16} color="#0F172A" />
          ) : (
            <Play size={16} color="#0F172A" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>

        {/* Interactive Waveform Track Slider */}
        <View
          style={styles.sliderTrackArea}
          onLayout={(e: LayoutChangeEvent) => setSliderWidth(e.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          <View style={styles.waveformContainer}>
            {barHeights.map((heightPct, idx) => {
              const barPct = (idx / barHeights.length) * 100;
              const isFilled = progressPct > 0 && barPct <= progressPct;

              return (
                <View
                  key={idx}
                  style={[
                    styles.waveBar,
                    { height: `${Math.max(20, heightPct)}%` },
                    isFilled && styles.waveBarFilled,
                  ]}
                />
              );
            })}
          </View>

          {/* Floating Scrub Handle Thumb */}
          <View
            style={[
              styles.scrubThumb,
              { left: `${Math.min(96, Math.max(0, progressPct))}%` },
            ]}
          />
        </View>

        <Volume2 size={16} color="#64748B" style={styles.volumeIcon} />
      </View>
    </View>
  );
};

function useMemoDuration(durationStr: string): number {
  if (!durationStr) return 15;
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  const secs = parseInt(durationStr, 10);
  return isNaN(secs) ? 15 : secs;
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#12141A',
    borderColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  micBadgeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    letterSpacing: 0.2,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
  },
  speedChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  timerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonActive: {
    backgroundColor: '#38BDF8',
  },
  sliderTrackArea: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    gap: 3,
  },
  waveBar: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 3,
  },
  waveBarFilled: {
    backgroundColor: '#38BDF8',
  },
  scrubThumb: {
    position: 'absolute',
    top: 13,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: -5,
  },
  volumeIcon: {
    opacity: 0.7,
  },
});
