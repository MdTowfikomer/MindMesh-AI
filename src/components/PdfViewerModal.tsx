import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { MemoryItem } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { FileText, X, Layers, Download } from './Icons';

interface PdfViewerModalProps {
  visible: boolean;
  pdf: MemoryItem | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ visible, pdf, onClose }) => {
  if (!pdf || !visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <FileText size={18} color={theme.colors.auroraPurple} />
              <Text style={styles.title} numberOfLines={1}>
                {pdf.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Meta Info Bar */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Layers size={12} color={theme.colors.auroraPurple} />
              <Text style={styles.metaText}>{pdf.pageCount || 24} Pages</Text>
            </View>
            <View style={styles.metaItem}>
              <Download size={12} color={theme.colors.auroraEmerald} />
              <Text style={styles.metaText}>{pdf.fileSize || '8.4 MB'}</Text>
            </View>
          </View>

          {/* PDF Preview Content */}
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>DOCUMENT EXECUTIVE SUMMARY</Text>
              <Text style={styles.summaryContent}>{pdf.content}</Text>
            </View>

            {/* Simulated PDF Pages */}
            {Array.from({ length: Math.min(3, pdf.pageCount || 3) }).map((_, idx) => (
              <View key={idx} style={styles.pdfPageSheet}>
                <View style={styles.pageHeader}>
                  <Text style={styles.pageNumber}>Page {idx + 1}</Text>
                  <Text style={styles.docHeaderTitle}>{pdf.title}</Text>
                </View>
                <Text style={styles.pageBodyText}>
                  [Page {idx + 1} Visual Content Preview] — {pdf.content}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '88%',
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 10,
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
    flex: 1,
  },
  title: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 15,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.textSecondary,
  },
  scrollContent: {
    paddingVertical: 8,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 10,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraEmerald,
    letterSpacing: 0.8,
  },
  summaryContent: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 17,
  },
  pdfPageSheet: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    minHeight: 180,
    gap: 8,
    ...theme.shadows.card,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
    paddingBottom: 6,
  },
  pageNumber: {
    fontSize: 10,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraPurple,
  },
  docHeaderTitle: {
    fontSize: 9,
    fontFamily: theme.fonts.sans,
    color: theme.colors.textMuted,
  },
  pageBodyText: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
});
