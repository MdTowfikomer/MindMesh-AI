import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MemoryItem } from '../types/mindmesh';
import { Play, FileText, Globe, Mic } from './Icons';

interface MemoryCardProps {
  memory: MemoryItem;
  onPress?: () => void;
  onDelete?: () => void;
  isFused?: boolean;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onPress }) => {
  const imageHeight = Math.min(260, Math.max(130, 160 * (memory.aspectRatio || 1.1)));

  // ─── Quote Card ────────────────────────────────────────────────────────────
  if (memory.type === 'quote') {
    return (
      <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.88}>
        <View style={styles.quoteBox}>
          <Text style={styles.quoteMarkTop}>“</Text>
          <Text style={styles.quoteContent} numberOfLines={5}>
            {memory.content}
          </Text>
          <Text style={styles.quoteMarkBottom}>”</Text>
          {memory.urlMetadata?.author && (
            <Text style={styles.quoteAuthor}>— {memory.urlMetadata.author}</Text>
          )}
        </View>
        <Text style={styles.captionTitle} numberOfLines={2}>
          {memory.title || 'Words to live by'}
        </Text>
      </TouchableOpacity>
    );
  }

  // ─── Voice Memo Card (Rendered inside quotes like note saves) ───────────
  if (memory.type === 'voice') {
    return (
      <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.88}>
        <View style={styles.quoteBox}>
          <Text style={styles.quoteMarkTop}>“</Text>
          <Text style={styles.quoteContent} numberOfLines={5}>
            {memory.content || memory.ocrText || 'Recorded thought'}
          </Text>
          <Text style={styles.quoteMarkBottom}>”</Text>
          {memory.audioDuration && (
            <Text style={styles.quoteAuthor}>🎙️ {memory.audioDuration} Voice Memo</Text>
          )}
        </View>
        <Text style={styles.captionTitle} numberOfLines={2}>
          {memory.title || 'Voice Thought'}
        </Text>
      </TouchableOpacity>
    );
  }

  // ─── PDF / Document Card ───────────────────────────────────────────────────
  if (memory.type === 'pdf') {
    return (
      <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.88}>
        <View style={styles.docBox}>
          <FileText size={28} color="#94A3B8" />
          <Text style={styles.docPageCount}>{memory.pageCount || 1} Pages</Text>
        </View>
        <Text style={styles.captionTitle} numberOfLines={2}>
          {memory.title || 'Document'}
        </Text>
      </TouchableOpacity>
    );
  }

  // ─── Article / Web / Tweet Card ────────────────────────────────────────────
  if (memory.type === 'article') {
    return (
      <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.88}>
        <View style={styles.articleBox}>
          {memory.imageUrl ? (
            <Image source={{ uri: memory.imageUrl }} style={styles.articleImage} resizeMode="cover" />
          ) : (
            <View style={styles.articleFallback}>
              <Globe size={20} color="#94A3B8" />
              {memory.content ? (
                <Text style={styles.articleSnippet} numberOfLines={4}>{memory.content}</Text>
              ) : null}
            </View>
          )}
          {memory.urlMetadata?.domain && (
            <View style={styles.domainBadge}>
              <Text style={styles.domainText}>{memory.urlMetadata.domain}</Text>
            </View>
          )}
        </View>
        <Text style={styles.captionTitle} numberOfLines={2}>
          {memory.title || 'Saved Link'}
        </Text>
      </TouchableOpacity>
    );
  }

  // ─── Image & Screenshot Card ───────────────────────────────────────────────
  if (memory.imageUrl) {
    return (
      <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.88}>
        <View style={[styles.imageBox, { height: imageHeight }]}>
          <Image source={{ uri: memory.imageUrl }} style={styles.image} resizeMode="cover" />
          {memory.type === 'video' || memory.type === 'gif' ? (
            <View style={styles.playOverlay}>
              <View style={styles.playCircle}>
                <Play size={12} color="#FFF" />
              </View>
            </View>
          ) : null}
        </View>
        <Text style={styles.captionTitle} numberOfLines={2}>
          {memory.title || 'Untitled Image'}
        </Text>
      </TouchableOpacity>
    );
  }

  // ─── Text / Note Card ──────────────────────────────────────────────────────
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.textBox}>
        <Text style={styles.textContent} numberOfLines={6}>
          {memory.content}
        </Text>
      </View>
      <Text style={styles.captionTitle} numberOfLines={2}>
        {memory.title || 'Saved Note'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    width: '100%',
  },
  imageBox: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#181A20',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  captionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#94A3B8',
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: 2,
    letterSpacing: -0.1,
  },
  quoteBox: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 16,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteMarkTop: {
    fontSize: 20,
    color: '#64748B',
    marginBottom: 2,
    fontFamily: 'serif',
  },
  quoteMarkBottom: {
    fontSize: 20,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'serif',
  },
  quoteContent: {
    fontSize: 13,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
  voiceBox: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 16,
    height: 110,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 36,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  voiceDuration: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  docBox: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 18,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  docPageCount: {
    fontSize: 11,
    color: '#64748B',
  },
  articleBox: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 120,
  },
  articleFallback: {
    padding: 14,
    gap: 8,
  },
  articleSnippet: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  domainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  domainText: {
    fontSize: 10,
    color: '#64748B',
  },
  textBox: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 14,
    minHeight: 110,
    justifyContent: 'center',
  },
  textContent: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
