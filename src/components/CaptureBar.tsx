import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { theme } from '../theme/tokens';
import { Mic, ImageIcon, StopCircle, FileText } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { VisionAIService } from '../services/visionAI';
import { VoiceRecorderService } from '../services/voiceRecorder';
import { AudioTranscriptionService } from '../services/audioTranscription';
import { FullThoughtEditorModal } from './FullThoughtEditorModal';

export const CaptureBar: React.FC = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const { addMemory, triggerSynapticFusion, setIsSaving } = useMemoryStore();

  // Recording timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;

        // Show skeleton loading state
        setIsSaving(true);

        // Call Gemini Vision AI for real image understanding
        const analysis = await VisionAIService.analyzeImage(uri);

        setIsSaving(false);

        addMemory({
          type: analysis.classification,
          title: analysis.title,
          content: analysis.tldr || analysis.ocrText,
          imageUrl: uri,
          ocrText: analysis.ocrText,
          tags: analysis.tags,
          contextSpace: 'Shipaton',
          confidenceScore: analysis.confidenceScore,
        });
        triggerSynapticFusion();
      }
    } catch (e) {
      setIsSaving(false);
      console.warn('Image picker error:', e);
    }
  };

  const handlePickPdf = async () => {
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
          contextSpace: 'Shipaton',
          fileSize,
          confidenceScore: 0.95,
        });
        triggerSynapticFusion();
      }
    } catch (e) {
      console.warn('PDF picker error:', e);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsSaving(true);

      const result = await VoiceRecorderService.stopRecording();
      if (result) {
        // Transcribe with Gemini
        const transcription = await AudioTranscriptionService.transcribe(result.uri);

        addMemory({
          type: 'voice',
          title: transcription.title,
          content: `[${transcription.category}] ${transcription.transcription}`,
          audioDuration: `${Math.floor(result.durationSeconds / 60)}:${(result.durationSeconds % 60).toString().padStart(2, '0')}`,
          audioWaveform: [20, 50, 90, 70, 100, 40, 80, 60, 95, 30],
          tags: [...transcription.tags, transcription.category],
          contextSpace: transcription.tags[0] || 'Idea',
        });
      }

      setRecordingSeconds(0);
      setIsSaving(false);
    } else {
      // Start recording
      const started = await VoiceRecorderService.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordingSeconds(1);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.floatingPill}>
        {isRecording ? (
          <View style={styles.recordingRow}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording Voice Thought... ({recordingSeconds}s)</Text>
            <TouchableOpacity style={styles.stopButton} onPress={toggleRecording}>
              <StopCircle size={20} color={theme.colors.auroraRose} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.actionIconButton} onPress={handlePickImage}>
              <ImageIcon size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionIconButton} onPress={toggleRecording}>
              <Mic size={18} color={theme.colors.auroraCyan} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.inputTouchable} onPress={() => setIsEditorOpen(true)}>
              <Text style={styles.placeholderText}>Dump a thought, idea, or link...</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionIconButton} onPress={handlePickPdf}>
              <FileText size={17} color={theme.colors.auroraAmber} />
            </TouchableOpacity>
          </View>
        )}
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
  },
  floatingPill: {
    backgroundColor: theme.colors.glassBg,
    borderColor: theme.colors.glassBorder,
    borderWidth: 1,
    borderRadius: theme.radii.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...theme.shadows.card,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputTouchable: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  placeholderText: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  actionIconButton: {
    width: 34,
    height: 34,
    borderRadius: theme.radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.auroraRose,
  },
  recordingText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.auroraRose,
  },
  stopButton: {
    padding: 4,
  },
});
