import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { theme } from '../theme/tokens';
import { X, Camera, Link, MessageSquare } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';

export const ShareSheetModal: React.FC = () => {
  const { isShareSheetVisible, closeShareSheet, addMemory, triggerSynapticFusion } = useMemoryStore();

  if (!isShareSheetVisible) return null;

  const handleSimulateImport = (title: string, type: 'image' | 'text' | 'pricing', content: string) => {
    addMemory({
      type,
      title,
      content,
      tags: ['ShareSheet', 'Imported'],
      contextSpace: 'Shipaton',
    });
    closeShareSheet();
    triggerSynapticFusion();
  };

  return (
    <Modal visible={isShareSheetVisible} animationType="slide" transparent={true} onRequestClose={closeShareSheet}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeShareSheet}>
        <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>OS Share Sheet Integration</Text>
            <TouchableOpacity onPress={closeShareSheet}>
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            MindMesh intercepts shared links, tweets, screenshots, and audio clips directly from iOS & Android system share menus.
          </Text>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleSimulateImport('Tweet: RevenueCat Paywalls', 'pricing', 'Shared via Safari Share Sheet: Multi-page storytelling paywall conversion statistics.')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Link size={20} color={theme.colors.auroraCyan} />
              </View>
              <Text style={styles.actionLabel}>Share Web Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleSimulateImport('Camera Roll Screenshot', 'image', 'Shared from Photos app: UI inspiration screenshot.')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Camera size={20} color={theme.colors.auroraPurple} />
              </View>
              <Text style={styles.actionLabel}>Share Screenshot</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleSimulateImport('Voice Memo Audio', 'text', 'Shared from Voice Memos: Voice thought blurb.')}
            >
              <View style={[styles.iconBox, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
                <MessageSquare size={20} color={theme.colors.auroraRose} />
              </View>
              <Text style={styles.actionLabel}>Share Voice Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderColor: theme.colors.border,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    padding: 12,
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});
