import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CyberTheme } from '../theme/cyberLuxury';
import { Mic, ImageIcon, StopCircle, FileText, Sparkles } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { VisionAIService } from '../services/visionAI';
import { VoiceRecorderService } from '../services/voiceRecorder';
import { AudioTranscriptionService } from '../services/audioTranscription';
import { FullThoughtEditorModal } from './FullThoughtEditorModal';
import { RemoteLogger } from '../services/logger';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CaptureBar: React.FC = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const { addMemory, triggerSynapticFusion, setIsSaving, showToast } = useMemoryStore();

  const pulse = useSharedValue(1);

  // Recording timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(withTiming(1.2, { duration: 600 }), -1, true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      pulse.value = 1;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const animatedRecordingPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handlePickImage = async () => {
    CyberTheme.haptics.light();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setIsSaving(true);

        const analysis = await VisionAIService.analyzeImage(uri);
        setIsSaving(false);

        console.log('[CaptureBar] 💾 Adding memory to store:', {
          title: analysis.title,
          tags: analysis.tags,
          classification: analysis.classification,
        });

        addMemory({
          type: analysis.classification,
          title: analysis.title,
          content: analysis.tldr || analysis.ocrText,
          imageUrl: uri,
          ocrText: analysis.ocrText,
          tags: analysis.tags,
          contextSpace: analysis.tags[0] || 'Visual',
          confidenceScore: analysis.confidenceScore,
        });
        triggerSynapticFusion();
        CyberTheme.haptics.success();
        showToast('✨ Visual memory analyzed & saved!', 'success');
      }
    } catch (e: any) {
      setIsSaving(false);
      console.error('[CaptureBar] Image picker error:', e);
      RemoteLogger.error('Image cannot be able to uploaded from in-app picker', {
        error: e?.message || String(e),
        stack: e?.stack,
      }, 'InAppImagePicker');
      showToast('Image cannot be able to uploaded', 'error');
    }
  };

  const handlePickPdf = async () => {
    CyberTheme.haptics.light();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.name || 'Document.pdf';
        const fileSize = asset.size ? `${(asset.size / (1024 * 1024)).toFixed(1)} MB` : undefined;

        addMemory({
          type: 'pdf',
          title: fileName.replace('.pdf', ''),
          content: `PDF document: ${fileName}`,
          tags: ['PDF', 'Document'],
          contextSpace: 'Documents',
          fileSize,
          confidenceScore: 0.95,
        });
        triggerSynapticFusion();
        CyberTheme.haptics.success();
      }
    } catch (e) {
      console.warn('PDF picker error:', e);
    }
  };

  const toggleRecording = async () => {
    CyberTheme.haptics.medium();
    if (isRecording) {
      setIsRecording(false);
      setIsSaving(true);

      const result = await VoiceRecorderService.stopRecording();
      if (result) {
        const transcription = await AudioTranscriptionService.transcribe(result.uri);

        addMemory({
          type: 'voice',
          title: transcription.title,
          content: `[${transcription.category}] ${transcription.transcription}`,
          audioDuration: `${Math.floor(result.durationSeconds / 60)}:${(result.durationSeconds % 60).toString().padStart(2, '0')}`,
          audioWaveform: [20, 50, 90, 70, 100, 40, 80, 60, 95, 30],
          tags: [...transcription.tags, transcription.category],
          contextSpace: transcription.tags[0] || 'Voice Idea',
        });
        triggerSynapticFusion();
        CyberTheme.haptics.success();
      }

      setRecordingSeconds(0);
      setIsSaving(false);
    } else {
      const started = await VoiceRecorderService.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordingSeconds(1);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dockWrapper}>
        <BlurView intensity={35} tint="dark" style={styles.glassDock}>
          {isRecording ? (
            <View style={styles.recordingRow}>
              <Animated.View style={[styles.recordingDot, animatedRecordingPulse]} />
              <Text style={styles.recordingText}>
                Recording... {recordingSeconds}s
              </Text>
              <TouchableOpacity style={styles.stopButton} onPress={toggleRecording}>
                <StopCircle size={22} color="#F43F5E" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.iconButton} onPress={handlePickImage}>
                <ImageIcon size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={toggleRecording}>
                <Mic size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.inputTouchable}
                onPress={() => {
                  CyberTheme.haptics.light();
                  setIsEditorOpen(true);
                }}
              >
                <Text style={styles.placeholderText}>Dump a thought, idea, or link...</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={handlePickPdf}>
                <FileText size={17} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}
        </BlurView>
      </View>

      <FullThoughtEditorModal visible={isEditorOpen} onClose={() => setIsEditorOpen(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  dockWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassDock: {
    backgroundColor: 'rgba(24, 26, 32, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  placeholderText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  recordingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: CyberTheme.colors.rose,
    shadowColor: CyberTheme.colors.rose,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '700',
    color: CyberTheme.colors.rose,
    letterSpacing: 0.3,
  },
  stopButton: {
    padding: 4,
  },
});
