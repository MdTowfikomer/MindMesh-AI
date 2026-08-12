import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../theme/tokens';
import { Share2, Globe, Quote, ImageIcon, X, Check } from './Icons';

interface InboundShareSimulatorModalProps {
  visible: boolean;
  onClose: () => void;
  onReceiveContent: (sharedInput: string) => void;
}

export const InboundShareSimulatorModal: React.FC<InboundShareSimulatorModalProps> = ({
  visible,
  onClose,
  onReceiveContent,
}) => {
  const [inputText, setInputText] = useState('');

  const presetShareItems = [
    { label: 'Medium Article URL', value: 'https://medium.com/design/effortless-product-ux' },
    { label: 'Paul Graham Essay Quote', value: 'Simple things should be simple, complex things should be possible.' },
    { label: 'X / Twitter Link', value: 'https://twitter.com/indiefounder/status/1892019203' },
  ];

  const handleShareSubmit = (text: string) => {
    if (text.trim().length > 0) {
      onReceiveContent(text.trim());
      setInputText('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Share2 size={18} color={theme.colors.auroraPurple} />
              <Text style={styles.title}>OS Share Sheet Receiver (Simulator)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subText}>
            Simulate receiving shared content (links, tweets, quotes, photos) from other apps via iOS/Android Share Sheet into mymind.
          </Text>

          {/* Preset Inbound Share Buttons */}
          <Text style={styles.presetsLabel}>TAP PRESET SHARE TARGET:</Text>
          <View style={styles.presetsRow}>
            {presetShareItems.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.presetPill}
                onPress={() => handleShareSubmit(preset.value)}
              >
                <Globe size={11} color={theme.colors.auroraPurple} />
                <Text style={styles.presetPillText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Manual Share Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Or paste any URL, quote, or tweet link here..."
            placeholderTextColor={theme.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity style={styles.submitBtn} onPress={() => handleShareSubmit(inputText)}>
            <Check size={14} color="#FFF" />
            <Text style={styles.submitBtnText}>Receive & Ingest into mymind</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  subText: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
  },
  presetsLabel: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(109, 40, 217, 0.08)',
    borderColor: 'rgba(109, 40, 217, 0.2)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  presetPillText: {
    fontSize: 11,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.auroraPurple,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textPrimary,
    minHeight: 60,
  },
  submitBtn: {
    backgroundColor: theme.colors.auroraPurple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  submitBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#FFF',
  },
});
