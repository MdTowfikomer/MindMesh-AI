import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { theme } from '../theme/tokens';
import { Mic, ImageIcon, Share2, StopCircle, ArrowUp } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import * as ImagePicker from 'expo-image-picker';
import { OCRService } from '../services/ocr';
import { FullThoughtEditorModal } from './FullThoughtEditorModal';

export const CaptureBar: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const { addMemory, openShareSheet, triggerSynapticFusion } = useMemoryStore();

  const handleSendText = () => {
    if (!inputText.trim()) return;
    addMemory({
      type: 'text',
      title: inputText.length > 30 ? inputText.substring(0, 30) + '...' : inputText,
      content: inputText,
      tags: ['QuickCapture', 'Idea'],
      contextSpace: 'Shipaton',
    });
    setInputText('');
    triggerSynapticFusion();
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        const analysis = await OCRService.analyzeImage(uri);

        addMemory({
          type: analysis.classification,
          title: analysis.tldrTitle,
          content: analysis.ocrText,
          imageUrl: uri,
          ocrText: analysis.ocrText,
          tags: analysis.suggestedTags,
          contextSpace: 'Shipaton',
          confidenceScore: analysis.confidenceScore,
        });
        triggerSynapticFusion();
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      addMemory({
        type: 'voice',
        title: `Voice Thought (${recordingSeconds || 12}s)`,
        content: 'Transcribed: What if we convert captured fragments into automated Build Plans & RevenueCat paywalls?',
        audioDuration: `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds || 12}`,
        audioWaveform: [20, 50, 90, 70, 100, 40, 80, 60, 95, 30],
        tags: ['VoiceMemo', 'Idea', 'SynapticFusion'],
        contextSpace: 'Shipaton',
      });
      setRecordingSeconds(0);
      triggerSynapticFusion();
    } else {
      setIsRecording(true);
      setRecordingSeconds(1);
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

            <TouchableOpacity style={styles.shareIconButton} onPress={openShareSheet}>
              <Share2 size={16} color={theme.colors.textSecondary} />
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
  textInput: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textPrimary,
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.auroraIndigo,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIconButton: {
    width: 32,
    height: 32,
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
