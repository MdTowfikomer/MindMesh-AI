import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { theme } from '../theme/tokens';
import { X, Sparkles, Share2, Check, ArrowRight } from './Icons';

interface BuildStoryExportProps {
  visible: boolean;
  onClose: () => void;
}

export const BuildStoryExport: React.FC<BuildStoryExportProps> = ({ visible, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Build Story Card (Viral Exporter)</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Shareable Card Canvas Preview */}
          <View style={styles.shareableCard}>
            <View style={styles.cardBadgeRow}>
              <View style={styles.brandBadge}>
                <Sparkles size={12} color={theme.colors.auroraPurple} />
                <Text style={styles.brandText}>MindMesh AI</Text>
              </View>
              <Text style={styles.dateText}>August 2026</Text>
            </View>

            <Text style={styles.storyTitle}>From 2 Scattered Notes to Shipped Product Spec</Text>

            <View style={styles.storyFlow}>
              <View style={styles.storyNode}>
                <Text style={styles.nodeTag}>1. CAPTURED</Text>
                <Text style={styles.nodeText}>Voice Note + RevenueCat Screenshot</Text>
              </View>

              <ArrowRight size={14} color={theme.colors.auroraIndigo} style={{ alignSelf: 'center' }} />

              <View style={styles.storyNode}>
                <Text style={styles.nodeTag}>2. DISCOVERED</Text>
                <Text style={styles.nodeText}>95% Synaptic Connection Match</Text>
              </View>

              <ArrowRight size={14} color={theme.colors.auroraIndigo} style={{ alignSelf: 'center' }} />

              <View style={styles.storyNode}>
                <Text style={styles.nodeTag}>3. BUILT</Text>
                <Text style={styles.nodeText}>Executable PRD & Storytelling Paywall</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            {copied ? <Check size={16} color="#FFF" /> : <Share2 size={16} color="#FFF" />}
            <Text style={styles.shareBtnText}>
              {copied ? 'Copied Card Image & Tweet!' : 'Export Card for X / LinkedIn / Stories'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 9, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  shareableCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    borderColor: theme.colors.auroraIndigo,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.auroraGlow,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.auroraPurple,
  },
  dateText: {
    fontFamily: theme.fonts.sans,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  storyTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  storyFlow: {
    gap: 8,
  },
  storyNode: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radii.xs,
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.auroraIndigo,
  },
  nodeTag: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: theme.colors.auroraIndigo,
    letterSpacing: 0.8,
  },
  nodeText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  shareBtn: {
    backgroundColor: theme.colors.auroraIndigo,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
  },
  shareBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: '#FFF',
  },
});
