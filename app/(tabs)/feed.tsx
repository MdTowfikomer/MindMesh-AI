import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { MemoryCard } from '../../src/components/MemoryCard';
import { CaptureBar } from '../../src/components/CaptureBar';
import { SynapticFusion } from '../../src/components/SynapticFusion';
import { theme } from '../../src/theme/tokens';
import { Search, Sparkles } from '../../src/components/Icons';

export default function FeedScreen() {
  const {
    memories,
    activeContextSpace,
    setActiveContextSpace,
    searchQuery,
    setSearchQuery,
    deleteMemory,
    isSynapticFusing,
    openMemoryDetail,
  } = useMemoryStore();

  const contextSpaces = ['All', 'Shipaton', 'Pricing', 'RevenueCat', 'MobileUX', 'Idea'];

  // Filter memories by Context Space / Tags and Search Query
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesSpace =
        activeContextSpace === 'All' ||
        m.contextSpace.toLowerCase() === activeContextSpace.toLowerCase() ||
        m.tags.some((t) => t.toLowerCase() === activeContextSpace.toLowerCase());
      const matchesSearch =
        searchQuery.trim() === '' ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSpace && matchesSearch;
    });
  }, [memories, activeContextSpace, searchQuery]);

  // Dual-column splitting for high-performance React Native visual grid layout
  const leftColumn = useMemo(() => filteredMemories.filter((_, idx) => idx % 2 === 0), [filteredMemories]);
  const rightColumn = useMemo(() => filteredMemories.filter((_, idx) => idx % 2 === 1), [filteredMemories]);

  return (
    <View style={styles.container}>
      {/* Search & Vector Distance Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search thoughts, vector concepts, or tags..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Keyword Auto-Complete Suggestions */}
        {searchQuery.trim().length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
            <Text style={styles.suggestionLabel}>Suggestions:</Text>
            {Array.from(new Set(memories.flatMap(m => m.tags)))
              .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()) && tag.toLowerCase() !== searchQuery.toLowerCase())
              .slice(0, 4)
              .map((tag) => (
                <TouchableOpacity key={tag} style={styles.suggestionPill} onPress={() => setSearchQuery(tag)}>
                  <Text style={styles.suggestionPillText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        )}
      </View>

      {/* Visual Memory Grid (Dual-Column Masonry) */}
      <ScrollView contentContainerStyle={styles.masonryScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.masonryGrid}>
          {/* Left Column */}
          <View style={styles.masonryColumn}>
            {leftColumn.map((item) => (
              <MemoryCard
                key={item.id}
                memory={item}
                onPress={() => openMemoryDetail(item)}
                onDelete={() => deleteMemory(item.id)}
              />
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.masonryColumn}>
            {rightColumn.map((item) => (
              <MemoryCard
                key={item.id}
                memory={item}
                onPress={() => openMemoryDetail(item)}
                onDelete={() => deleteMemory(item.id)}
              />
            ))}
          </View>
        </View>

        {filteredMemories.length === 0 && (
          <View style={styles.emptyState}>
            <Sparkles size={32} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No memories found</Text>
            <Text style={styles.emptySub}>Dump a screenshot, note, or voice recording below.</Text>
          </View>
        )}
      </ScrollView>

      {/* Synaptic Fusion Particle Overlay */}
      <SynapticFusion isVisible={isSynapticFusing} />

      {/* Floating 1-Tap Universal Capture Bar */}
      <CaptureBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  searchSection: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    height: 42,
    gap: theme.spacing.xs,
    ...theme.shadows.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textPrimary,
    letterSpacing: theme.tracking.normal,
  },
  clearSearchText: {
    fontSize: 11,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.auroraPurple,
    letterSpacing: theme.tracking.normal,
  },
  suggestionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xxs,
  },
  suggestionLabel: {
    fontSize: 10,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.textMuted,
    letterSpacing: theme.tracking.wide,
    marginRight: 2,
  },
  suggestionPill: {
    backgroundColor: 'rgba(109, 40, 217, 0.06)',
    borderColor: 'rgba(109, 40, 217, 0.15)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
  },
  suggestionPillText: {
    fontSize: 10,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.auroraPurple,
    letterSpacing: theme.tracking.normal,
  },
  chipsRow: {
    gap: theme.spacing.xxs,
    paddingRight: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.auroraIndigo,
    borderColor: theme.colors.auroraIndigo,
  },
  chipText: {
    fontSize: 11,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.textMuted,
    letterSpacing: theme.tracking.normal,
  },
  chipTextActive: {
    color: '#FFF',
    fontFamily: theme.fonts.sansBold,
    letterSpacing: theme.tracking.wide,
  },
  masonryScrollContent: {
    paddingTop: 1,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  masonryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  masonryColumn: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptySub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});
