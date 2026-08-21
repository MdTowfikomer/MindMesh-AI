import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Search, X, Globe, Mic, FileText, ImageIcon, Quote } from './Icons';
import { MemoryItem } from '../types/mindmesh';
import { AdvancedSearchService } from '../services/advancedSearch';

interface SpotlightCommandPaletteProps {
  visible: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onSelectMemory: (memory: MemoryItem) => void;
}

export const SpotlightCommandPalette: React.FC<SpotlightCommandPaletteProps> = ({
  visible,
  onClose,
  memories,
  onSelectMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filterChips = [
    { id: 'all', label: 'All', query: '' },
    { id: 'screenshot', label: 'Images', query: 'type:image' },
    { id: 'voice', label: 'Voice', query: 'type:voice' },
    { id: 'article', label: 'Articles', query: 'type:article' },
    { id: 'quote', label: 'Quotes', query: 'type:quote' },
    { id: 'pdf', label: 'Documents', query: 'type:pdf' },
  ];

  const filteredResults = useMemo(() => {
    let base = memories;
    if (activeFilter !== 'all') {
      const chip = filterChips.find((c) => c.id === activeFilter);
      if (chip?.query) {
        base = AdvancedSearchService.filterMemories(base, chip.query);
      }
    }
    return AdvancedSearchService.filterMemories(base, searchQuery);
  }, [memories, searchQuery, activeFilter]);

  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId === activeFilter ? 'all' : filterId);
  };

  const handleSelect = (item: MemoryItem) => {
    onClose();
    onSelectMemory(item);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <Mic size={14} color="#94A3B8" />;
      case 'article':
        return <Globe size={14} color="#94A3B8" />;
      case 'quote':
        return <Quote size={14} color="#94A3B8" />;
      case 'pdf':
        return <FileText size={14} color="#94A3B8" />;
      default:
        return <ImageIcon size={14} color="#94A3B8" />;
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <BlurView intensity={50} tint="dark" style={styles.backdrop}>
        <SafeAreaView style={styles.container} edges={['top']}>
          {/* Header Search Omnibox */}
          <View style={styles.omniboxContainer}>
            <View style={styles.omnibox}>
              <Search size={16} color="#94A3B8" />
              <TextInput
                autoFocus
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search memories, OCR text, or tags..."
                placeholderTextColor="#64748B"
                style={styles.searchInput}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearBtn}
                >
                  <X size={14} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.closeCapsule} onPress={onClose}>
              <Text style={styles.closeText}>ESC</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Filter Pills */}
          <View style={styles.filtersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {filterChips.map((chip) => {
                const isActive = activeFilter === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => handleFilterSelect(chip.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Search Results List */}
          <ScrollView
            style={styles.resultsList}
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSelect(item)}
                activeOpacity={0.8}
                style={styles.resultCard}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.cardThumb} />
                ) : (
                  <View style={styles.cardThumbIcon}>
                    {getItemIcon(item.type)}
                  </View>
                )}

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title || 'Untitled Memory'}
                  </Text>
                  <Text style={styles.cardSnippet} numberOfLines={1}>
                    {item.content || item.ocrText || 'No extra snippet'}
                  </Text>

                  <View style={styles.cardTagsRow}>
                    <View style={styles.spaceTagBadge}>
                      <Text style={styles.spaceTagText}>#{item.contextSpace}</Text>
                    </View>
                    {item.tags.slice(0, 2).map((t, idx) => (
                      <View key={idx} style={styles.tagBadge}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {filteredResults.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No matching memories</Text>
                <Text style={styles.emptySub}>
                  Try searching for keywords like "ideas", "pricing", or filter by type above.
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 17, 20, 0.94)',
  },
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  omniboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  omnibox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '400',
  },
  clearBtn: {
    padding: 4,
  },
  closeCapsule: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filtersWrapper: {
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 4,
  },
  filterPillActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F8FAFC',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#101114',
    fontWeight: '600',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 40,
    gap: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#131418',
  },
  cardThumbIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#131418',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  cardSnippet: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  spaceTagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spaceTagText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#64748B',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
