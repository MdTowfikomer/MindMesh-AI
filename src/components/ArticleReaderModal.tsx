import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { MemoryItem } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { Globe, X, Highlighting, Plus, Check } from './Icons';

interface ArticleReaderModalProps {
  visible: boolean;
  article: MemoryItem | null;
  onClose: () => void;
  onSaveHighlight: (memoryId: string, highlightText: string) => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  visible,
  article,
  onClose,
  onSaveHighlight,
}) => {
  const [newHighlight, setNewHighlight] = useState('');
  const [isHighlighting, setIsHighlighting] = useState(false);

  if (!article || !visible) return null;

  const meta = article.urlMetadata;
  const highlights = meta?.highlights || [];

  const handleAddHighlight = () => {
    if (newHighlight.trim().length > 0) {
      onSaveHighlight(article.id, newHighlight.trim());
      setNewHighlight('');
      setIsHighlighting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Reader Top Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerMeta}>
              <Globe size={14} color={theme.colors.auroraIndigo} />
              <Text style={styles.domainText}>{meta?.domain || 'web article'}</Text>
              {meta?.readTime && <Text style={styles.readTimeText}>• {meta.readTime}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Hero Image */}
            {article.imageUrl && (
              <Image source={{ uri: article.imageUrl }} style={styles.heroImage} resizeMode="cover" />
            )}

            {/* Article Title & Author */}
            <Text style={styles.articleTitle}>{article.title}</Text>
            {meta?.author && <Text style={styles.authorText}>By {meta.author}</Text>}

            <View style={styles.divider} />

            {/* Highlights Section */}
            <View style={styles.highlightsContainer}>
              <View style={styles.highlightsHeader}>
                <Highlighting size={14} color={theme.colors.auroraAmber} />
                <Text style={styles.highlightsHeaderTitle}>HIGHLIGHTS & QUOTES ({highlights.length})</Text>

                <TouchableOpacity
                  style={styles.addHighlightBtn}
                  onPress={() => setIsHighlighting(!isHighlighting)}
                >
                  <Plus size={12} color="#FFF" />
                  <Text style={styles.addHighlightBtnText}>Highlight Text</Text>
                </TouchableOpacity>
              </View>

              {isHighlighting && (
                <View style={styles.highlightInputBox}>
                  <TextInput
                    style={styles.highlightInput}
                    placeholder="Enter or paste quote text to highlight..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={newHighlight}
                    onChangeText={setNewHighlight}
                    multiline
                  />
                  <TouchableOpacity style={styles.saveHighlightBtn} onPress={handleAddHighlight}>
                    <Check size={12} color="#FFF" />
                    <Text style={styles.saveHighlightBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}

              {highlights.map((quote, idx) => (
                <View key={idx} style={styles.highlightCard}>
                  <Text style={styles.highlightQuoteText}>“{quote}”</Text>
                </View>
              ))}
            </View>

            {/* Body Text */}
            <Text style={styles.bodyText}>
              {meta?.fullText || article.content}
            </Text>
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
    height: '92%',
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  domainText: {
    fontSize: 12,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraIndigo,
  },
  readTimeText: {
    fontSize: 11,
    fontFamily: theme.fonts.sans,
    color: theme.colors.textMuted,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 12,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  articleTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.textPrimary,
    lineHeight: 28,
    marginTop: 4,
  },
  authorText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.auroraPurple,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  highlightsContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  highlightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  highlightsHeaderTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraAmber,
    letterSpacing: 0.8,
  },
  addHighlightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.auroraAmber,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addHighlightBtnText: {
    fontSize: 10,
    fontFamily: theme.fonts.sansBold,
    color: '#FFF',
  },
  highlightInputBox: {
    gap: 6,
    backgroundColor: theme.colors.surface,
    padding: 8,
    borderRadius: 8,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  highlightInput: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textPrimary,
    minHeight: 50,
  },
  saveHighlightBtn: {
    backgroundColor: theme.colors.auroraEmerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
  },
  saveHighlightBtnText: {
    fontSize: 10,
    fontFamily: theme.fonts.sansBold,
    color: '#FFF',
  },
  highlightCard: {
    backgroundColor: 'rgba(253, 230, 138, 0.25)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.auroraAmber,
    padding: 10,
    borderRadius: 4,
  },
  highlightQuoteText: {
    fontFamily: theme.fonts.serif,
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  bodyText: {
    fontFamily: theme.fonts.sans,
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 23,
    marginTop: 8,
  },
});
