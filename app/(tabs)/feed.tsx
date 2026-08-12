import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { MemoryCard } from '../../src/components/MemoryCard';
import { CaptureBar } from '../../src/components/CaptureBar';
import { SynapticFusion } from '../../src/components/SynapticFusion';
import { AutoStacksDrawer } from '../../src/components/AutoStacksDrawer';
import { TrashModal } from '../../src/components/TrashModal';
import { ArticleReaderModal } from '../../src/components/ArticleReaderModal';
import { PdfViewerModal } from '../../src/components/PdfViewerModal';
import { InboundShareSimulatorModal } from '../../src/components/InboundShareSimulatorModal';
import { AdvancedSearchService } from '../../src/services/advancedSearch';
import { URLEnrichmentService } from '../../src/services/urlEnrichment';
import { MemoryDetailModal } from '../../src/components/MemoryDetailModal';
import { theme } from '../../src/theme/tokens';
import { Search, Sparkles, X } from '../../src/components/Icons';

export default function FeedScreen() {
  const {
    memories,
    trash,
    savedSmartSpaces,
    activeContextSpace,
    searchQuery,
    setSearchQuery,
    deleteMemory,
    restoreMemory,
    purgeMemory,
    emptyTrash,
    isTrashModalVisible,
    openTrashModal,
    closeTrashModal,
    selectedMemory,
    isArticleReaderVisible,
    openArticleReader,
    closeArticleReader,
    isPdfViewerVisible,
    openPdfViewer,
    closePdfViewer,
    saveArticleHighlight,
    createSmartSpace,
    deleteSmartSpace,
    isSynapticFusing,
    openMemoryDetail,
    addMemory,
  } = useMemoryStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isShareSimulatorVisible, setIsShareSimulatorVisible] = useState(false);

  // Multi-stage Advanced Search System Engine Filtering
  const filteredMemories = useMemo(() => {
    let base = memories;
    if (activeContextSpace !== 'All') {
      base = memories.filter(
        (m) =>
          m.contextSpace.toLowerCase() === activeContextSpace.toLowerCase() ||
          m.tags.some((t) => t.toLowerCase() === activeContextSpace.toLowerCase())
      );
    }
    return AdvancedSearchService.filterMemories(base, searchQuery);
  }, [memories, activeContextSpace, searchQuery]);

  // Dual-column masonry layout
  const leftColumn = useMemo(() => filteredMemories.filter((_, idx) => idx % 2 === 0), [filteredMemories]);
  const rightColumn = useMemo(() => filteredMemories.filter((_, idx) => idx % 2 === 1), [filteredMemories]);

  const handleCardPress = useCallback((item: typeof memories[0]) => {
    if (item.type === 'article') {
      openArticleReader(item);
    } else if (item.type === 'pdf') {
      openPdfViewer(item);
    } else {
      openMemoryDetail(item);
    }
  }, [openArticleReader, openPdfViewer, openMemoryDetail]);

  const handleInboundShareReceive = useCallback((sharedInput: string) => {
    const enriched = URLEnrichmentService.enrichInput(sharedInput);
    addMemory(enriched);
  }, [addMemory]);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    // Keep stacks visible while there's a query
    if (searchQuery.trim().length === 0) {
      setIsSearchFocused(false);
    }
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchFocused(false);
  }, [setSearchQuery]);

  return (
    <View style={styles.container}>
      {/* Clean minimal search bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={15} color={theme.colors.textDim} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your mind..."
            placeholderTextColor={theme.colors.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={14} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Stacks & Smart Spaces — only visible on search focus or active query */}
      {(isSearchFocused || searchQuery.trim().length > 0) && (
        <AutoStacksDrawer
          memories={memories}
          savedSmartSpaces={savedSmartSpaces}
          activeSearchQuery={searchQuery}
          onSelectStack={setSearchQuery}
          onCreateSmartSpace={createSmartSpace}
          onDeleteSmartSpace={deleteSmartSpace}
        />
      )}

      {/* Visual Memory Grid (Dual-Column Masonry) */}
      <ScrollView
        contentContainerStyle={styles.masonryScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.masonryGrid}>
          <View style={styles.masonryColumn}>
            {leftColumn.map((item) => (
              <MemoryCard
                key={item.id}
                memory={item}
                onPress={() => handleCardPress(item)}
              />
            ))}
          </View>

          <View style={styles.masonryColumn}>
            {rightColumn.map((item) => (
              <MemoryCard
                key={item.id}
                memory={item}
                onPress={() => handleCardPress(item)}
              />
            ))}
          </View>
        </View>

        {filteredMemories.length === 0 && (
          <View style={styles.emptyState}>
            <Sparkles size={28} color={theme.colors.textDim} />
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySub}>Save a thought, screenshot, or link to get started.</Text>
          </View>
        )}
      </ScrollView>

      {/* Synaptic Fusion Particle Overlay */}
      <SynapticFusion isVisible={isSynapticFusing} />

      {/* Modals */}
      <TrashModal
        visible={isTrashModalVisible}
        trash={trash}
        onClose={closeTrashModal}
        onRestore={restoreMemory}
        onPurge={purgeMemory}
        onEmptyTrash={emptyTrash}
      />

      <ArticleReaderModal
        visible={isArticleReaderVisible}
        article={selectedMemory}
        onClose={closeArticleReader}
        onSaveHighlight={saveArticleHighlight}
      />

      <PdfViewerModal
        visible={isPdfViewerVisible}
        pdf={selectedMemory}
        onClose={closePdfViewer}
      />

      <InboundShareSimulatorModal
        visible={isShareSimulatorVisible}
        onClose={() => setIsShareSimulatorVisible(false)}
        onReceiveContent={handleInboundShareReceive}
      />

      {/* Floating Capture Bar */}
      <MemoryDetailModal />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radii.full,
    paddingHorizontal: 14,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textPrimary,
    letterSpacing: theme.tracking.normal,
  },
  masonryScrollContent: {
    paddingHorizontal: 6,
    paddingBottom: 90,
    paddingTop: 2,
  },
  masonryGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  masonryColumn: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  emptySub: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});
