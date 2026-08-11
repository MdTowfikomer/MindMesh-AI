import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MemoryItem } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { ImageIcon, Mic, FileText, DollarSign, Code, Sparkles, Trash2 } from './Icons';

interface MemoryCardProps {
  memory: MemoryItem;
  onPress?: () => void;
  onDelete?: () => void;
  isFused?: boolean;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onPress, onDelete, isFused }) => {
  const renderIcon = () => {
    switch (memory.type) {
      case 'pricing':
        return <DollarSign size={14} color={theme.colors.tagPricingText} />;
      case 'voice':
        return <Mic size={14} color={theme.colors.tagVoiceText} />;
      case 'code':
        return <Code size={14} color={theme.colors.tagCodeText} />;
      case 'image':
      case 'whiteboard':
        return <ImageIcon size={14} color={theme.colors.tagUiText} />;
      default:
        return <FileText size={14} color={theme.colors.tagIdeaText} />;
    }
  };

  const getBadgeStyle = () => {
    switch (memory.type) {
      case 'pricing':
        return { bg: theme.colors.tagPricingBg, text: theme.colors.tagPricingText };
      case 'voice':
        return { bg: theme.colors.tagVoiceBg, text: theme.colors.tagVoiceText };
      case 'code':
        return { bg: theme.colors.tagCodeBg, text: theme.colors.tagCodeText };
      case 'image':
        return { bg: theme.colors.tagUiBg, text: theme.colors.tagUiText };
      default:
        return { bg: theme.colors.tagIdeaBg, text: theme.colors.tagIdeaText };
    }
  };

  const badgeStyle = getBadgeStyle();

  const imageHeight = Math.min(180, Math.max(110, 140 * (memory.aspectRatio || 1.1)));

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.cardContainer,
        isFused && styles.fusedCardContainer,
      ]}
    >
      {/* Visual Media Card Box */}
      <View style={styles.cardBox}>
        {memory.imageUrl ? (
          <View style={[styles.imageContainer, { height: imageHeight }]}>
            <Image source={{ uri: memory.imageUrl }} style={styles.cardImage} resizeMode="cover" />
          </View>
        ) : memory.type === 'voice' ? (
          <View style={styles.voiceCardBox}>
            <View style={styles.waveformBars}>
              {(memory.audioWaveform || [20, 50, 80, 40, 95, 30, 70]).map((barHeight, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.waveformBar,
                    { height: Math.max(8, barHeight * 0.3) },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.audioDurationText}>{memory.audioDuration || '0:30'}</Text>
          </View>
        ) : (
          <View style={styles.textQuoteCardBox}>
            <Text style={styles.quoteMark}>“</Text>
            <Text style={styles.textQuoteContent} numberOfLines={4}>
              {memory.content}
            </Text>
            <Text style={styles.quoteMarkRight}>”</Text>
          </View>
        )}
      </View>

      {/* Small Description / Caption Text Below Card */}
      <Text style={styles.captionTitle} numberOfLines={2}>
        {memory.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 14,
    alignItems: 'center',
  },
  fusedCardContainer: {
    shadowColor: theme.colors.auroraIndigo,
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  cardBox: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    borderColor: 'rgba(15, 23, 42, 0.05)',
    borderWidth: 1,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  voiceCardBox: {
    padding: 14,
    backgroundColor: 'rgba(3, 105, 161, 0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  textQuoteCardBox: {
    padding: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  quoteMark: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.textMuted,
    marginBottom: -6,
  },
  quoteMarkRight: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.textMuted,
    marginTop: -6,
  },
  textQuoteContent: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  waveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  waveformBar: {
    width: 3,
    backgroundColor: theme.colors.auroraCyan,
    borderRadius: 2,
  },
  audioDurationText: {
    fontSize: 10,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.auroraCyan,
    marginLeft: 8,
  },
  captionTitle: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
});
