import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MemoryItem } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { Play, FileText, Globe, Quote as QuoteIcon, Layers } from './Icons';

interface MemoryCardProps {
  memory: MemoryItem;
  onPress?: () => void;
  onDelete?: () => void;
  isFused?: boolean;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onPress, isFused }) => {
  const imageHeight = Math.min(220, Math.max(120, 145 * (memory.aspectRatio || 1.1)));

  // Platform signature color detection — quick visual reminder of source
  const getPlatformColor = (): string | null => {
    const domain = memory.urlMetadata?.domain?.toLowerCase() || '';
    const tags = memory.tags.map(t => t.toLowerCase());
    const title = memory.title.toLowerCase();
    const content = memory.content?.toLowerCase() || '';
    const all = `${domain} ${tags.join(' ')} ${title} ${content}`;

    if (all.includes('twitter') || all.includes('x.com') || domain.includes('x.com')) return '#000000';
    if (all.includes('instagram') || domain.includes('instagram')) return '#E1306C';
    if (all.includes('linkedin') || domain.includes('linkedin')) return '#0A66C2';
    if (all.includes('reddit') || domain.includes('reddit')) return '#FF4500';
    if (all.includes('youtube') || domain.includes('youtube')) return '#FF0000';
    if (all.includes('github') || domain.includes('github')) return '#24292E';
    if (all.includes('medium') || domain.includes('medium')) return '#1A8917';
    if (all.includes('discord') || domain.includes('discord')) return '#5865F2';
    if (all.includes('figma') || domain.includes('figma')) return '#A259FF';
    if (all.includes('dribbble') || domain.includes('dribbble')) return '#EA4C89';
    if (all.includes('producthunt') || domain.includes('producthunt')) return '#DA552F';
    if (all.includes('hacker news') || domain.includes('ycombinator')) return '#FF6600';
    if (all.includes('tiktok') || domain.includes('tiktok')) return '#010101';
    if (all.includes('pinterest') || domain.includes('pinterest')) return '#E60023';
    if (all.includes('spotify') || domain.includes('spotify')) return '#1DB954';
    if (all.includes('notion') || domain.includes('notion')) return '#000000';
    return null;
  };

  const platformColor = getPlatformColor();

  // Article / bookmark card — colored top bar + embedded content
  if (memory.type === 'article') {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrapper}>
        <View style={styles.card}>
          {platformColor && <View style={[styles.topBar, { backgroundColor: platformColor }]} />}
          {memory.imageUrl && (
            <Image source={{ uri: memory.imageUrl }} style={styles.articleImage} resizeMode="cover" />
          )}
          <View style={styles.articleBody}>
            <Text style={styles.articleTitle} numberOfLines={2}>{memory.title}</Text>
            <Text style={styles.articleExcerpt} numberOfLines={2}>{memory.content}</Text>
            <View style={styles.articleMeta}>
              <Globe size={10} color={theme.colors.textDim} />
              <Text style={styles.metaText}>{memory.urlMetadata?.domain || 'web'}</Text>
              {memory.urlMetadata?.readTime && (
                <Text style={styles.metaText}>{memory.urlMetadata.readTime}</Text>
              )}
            </View>
          </View>
        </View>
        <Text style={styles.captionBelow} numberOfLines={2}>{memory.title}</Text>
      </TouchableOpacity>
    );
  }

  // Quote card — purple quote icon, clean serif text
  if (memory.type === 'quote') {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrapper}>
        <View style={[styles.card, styles.quoteCard]}>
          <QuoteIcon size={18} color={theme.colors.auroraPurple} />
          <Text style={styles.quoteBody} numberOfLines={5}>{memory.content}</Text>
          {memory.urlMetadata?.author && (
            <Text style={styles.quoteAuthor}>— {memory.urlMetadata.author}</Text>
          )}
          {memory.urlMetadata?.domain && (
            <Text style={styles.quoteSource}>{memory.urlMetadata.domain}</Text>
          )}
        </View>
        <Text style={styles.captionBelow} numberOfLines={1}>
          {memory.urlMetadata?.author || memory.title}
        </Text>
      </TouchableOpacity>
    );
  }

  // PDF card
  if (memory.type === 'pdf') {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrapper}>
        <View style={[styles.card, styles.pdfCard]}>
          <FileText size={20} color={theme.colors.textMuted} />
          <Text style={styles.pdfTitle} numberOfLines={2}>{memory.title}</Text>
          <View style={styles.pdfMeta}>
            <Layers size={10} color={theme.colors.textDim} />
            <Text style={styles.metaText}>{memory.pageCount || 12} Pages</Text>
            {memory.fileSize && <Text style={styles.metaText}>· {memory.fileSize}</Text>}
          </View>
        </View>
        <Text style={styles.captionBelow} numberOfLines={1}>{memory.title}</Text>
      </TouchableOpacity>
    );
  }

  // Video / GIF card
  if (memory.type === 'video' || memory.type === 'gif') {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrapper}>
        <View style={styles.card}>
          <View style={[styles.imageBox, { height: imageHeight }]}>
            <Image
              source={{ uri: memory.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.videoOverlay}>
              <View style={styles.playButton}>
                <Play size={16} color="#FFF" />
              </View>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {memory.type === 'gif' ? 'GIF' : memory.audioDuration || '0:18'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.captionBelow} numberOfLines={2}>{memory.title}</Text>
      </TouchableOpacity>
    );
  }

  // Image card (pricing, whiteboard, generic image)
  if (memory.imageUrl) {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrapper}>
        <View style={styles.card}>
          {platformColor && <View style={[styles.topBar, { backgroundColor: platformColor }]} />}
          <View style={[styles.imageBox, { height: imageHeight }]}>
            <Image source={{ uri: memory.imageUrl }} style={styles.image} resizeMode="cover" />
          </View>
        </View>
        <Text style={styles.captionBelow} numberOfLines={2}>{memory.title}</Text>
      </TouchableOpacity>
    );
  }

  // Voice card
  if (memory.type === 'voice') {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrapper}>
        <View style={[styles.card, styles.voiceCard]}>
          <View style={styles.waveformRow}>
            {(memory.audioWaveform || [20, 50, 80, 40, 95, 30, 70]).map((h, idx) => (
              <View key={idx} style={[styles.waveBar, { height: Math.max(6, h * 0.35) }]} />
            ))}
          </View>
          <Text style={styles.voiceDuration}>{memory.audioDuration || '0:30'}</Text>
        </View>
        <Text style={styles.captionBelow} numberOfLines={2}>{memory.title}</Text>
      </TouchableOpacity>
    );
  }

  // Text/note card (default)
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.cardWrapper}>
      <View style={[styles.card, styles.textCard]}>
        <Text style={styles.textContent} numberOfLines={6}>{memory.content}</Text>
      </View>
      <Text style={styles.captionBelow} numberOfLines={2}>{memory.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 4,
  },

  // Base card — borderless clean editorial style
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Caption below card — grey, left-aligned
  captionBelow: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 5,
    marginBottom: 6,
    paddingHorizontal: 2,
    lineHeight: 15,
  },

  // Image box
  imageBox: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Video overlay
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    fontSize: 9,
    fontFamily: theme.fonts.sansBold,
    color: '#FFF',
  },

  // Article card
  topBar: {
    height: 4,
    width: '100%',
  },
  articleImage: {
    width: '100%',
    height: 100,
  },
  articleBody: {
    padding: 10,
    gap: 3,
  },
  articleTitle: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 16,
  },
  articleExcerpt: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 10,
    fontFamily: theme.fonts.sans,
    color: theme.colors.textDim,
  },

  // Quote card — purple accent, clean
  quoteCard: {
    backgroundColor: '#F5F3F8',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  quoteBody: {
    fontFamily: theme.fonts.serif,
    fontSize: 13,
    fontStyle: 'italic',
    color: theme.colors.textPrimary,
    lineHeight: 19,
    textAlign: 'center',
  },
  quoteAuthor: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 10,
    color: theme.colors.auroraPurple,
    marginTop: 2,
  },
  quoteSource: {
    fontFamily: theme.fonts.sans,
    fontSize: 9,
    color: theme.colors.textDim,
  },

  // PDF card
  pdfCard: {
    backgroundColor: '#F5F5F3',
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  pdfTitle: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  pdfMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Voice card
  voiceCard: {
    backgroundColor: '#F5F5F3',
    padding: 14,
    gap: 6,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 30,
  },
  waveBar: {
    flex: 1,
    backgroundColor: theme.colors.auroraCyan,
    borderRadius: 1,
    maxWidth: 4,
  },
  voiceDuration: {
    fontSize: 10,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.textMuted,
  },

  // Text/note card
  textCard: {
    backgroundColor: '#F5F5F3',
    padding: 14,
  },
  textContent: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textPrimary,
    lineHeight: 17,
  },
});
