import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/tokens';
import { ChevronDown, CheckSquare, PenTool } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import { URLEnrichmentService } from '../services/urlEnrichment';

interface FullThoughtEditorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FullThoughtEditorModal: React.FC<FullThoughtEditorModalProps> = ({ visible, onClose }) => {
  const [text, setText] = useState('');
  const { addMemory, triggerSynapticFusion } = useMemoryStore();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleSave = () => {
    if (!text.trim()) return;

    const enriched = URLEnrichmentService.enrichInput(text.trim());
    addMemory(enriched);

    setText('');
    onClose();
    triggerSynapticFusion();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Top Header Bar */}
          <View style={styles.topHeader}>
            <TouchableOpacity style={styles.dismissBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <ChevronDown size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.dateTitle}>{formattedDate}</Text>

            <TouchableOpacity
              style={[styles.saveBtn, text.trim().length > 0 && styles.saveBtnActive]}
              onPress={handleSave}
              disabled={text.trim().length === 0}
            >
              <Text style={[styles.saveBtnText, text.trim().length > 0 && styles.saveBtnTextActive]}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Full Screen Text Editor Body */}
          <View style={styles.editorBody}>
            <TextInput
              style={styles.textInput}
              placeholder="Start typing here..."
              placeholderTextColor={theme.colors.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              autoFocus
              textAlignVertical="top"
            />
          </View>

          {/* Bottom Formatting Toolbar Bar */}
          <View style={styles.bottomToolbar}>
            <TouchableOpacity style={styles.toolbarIconBtn}>
              <Text style={styles.textFormatIcon}>Aa</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarIconBtn}>
              <PenTool size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarIconBtn}>
              <CheckSquare size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light Minimalist Pure White Editor Surface
  },
  keyboardContainer: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
  },
  dismissBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTitle: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 14,
    color: theme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  saveBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  saveBtnActive: {
    backgroundColor: theme.colors.auroraIndigo,
  },
  saveBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  saveBtnTextActive: {
    color: '#FFFFFF',
  },
  editorBody: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  textInput: {
    flex: 1,
    fontFamily: theme.fonts.serif,
    fontSize: 19,
    color: theme.colors.textPrimary,
    lineHeight: 28,
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.05)',
    backgroundColor: '#FFFFFF',
  },
  toolbarIconBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textFormatIcon: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
});
