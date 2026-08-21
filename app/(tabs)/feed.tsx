import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { MemoryCard } from '../../src/components/MemoryCard';
import { CaptureBar } from '../../src/components/CaptureBar';
import { AutoStacksDrawer } from '../../src/components/AutoStacksDrawer';
import { TrashModal } from '../../src/components/TrashModal';
import { ArticleReaderModal } from '../../src/components/ArticleReaderModal';
import { PdfViewerModal } from '../../src/components/PdfViewerModal';
import { InboundShareSimulatorModal } from '../../src/components/InboundShareSimulatorModal';
import { AdvancedSearchService } from '../../src/services/advancedSearch';
import { URLEnrichmentService } from '../../src/services/urlEnrichment';
import { VisionAIService } from '../../src/services/visionAI';
import { ShareIntentService } from '../../src/services/shareIntent';
import { MemoryDetailModal } from '../../src/components/MemoryDetailModal';
import { SavingSkeletonCard } from '../../src/components/SavingSkeletonCard';
import { SpotlightCommandPalette } from '../../src/components/SpotlightCommandPalette';
import { CyberTheme } from '../../src/theme/cyberLuxury';
import { Search, Sparkles, CheckCircle2, AlertCircle, Settings } from '../../src/components/Icons';
import { SettingsModal } from '../../src/components/SettingsModal';
import { ByokPromptModal } from '../../src/components/ByokPromptModal';
import { RemoteLogger } from '../../src/services/logger';

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
    openMemoryDetail,
    openSettingsModal,
    addMemory,
    triggerSynapticFusion,
    isSaving,
    setIsSaving,
    toastMessage,
    toastType,
    showToast,
  } = useMemoryStore();

  // Listen for native Android inbound share intents from external apps (Screenshots, Gallery, Instagram, Twitter/X)
  useEffect(() => {
    const handleSharedContent = async (data: string, type: 'text' | 'image') => {
      console.log('[FeedScreen] 📥 Incoming shared content:', { type, data: data.slice(0, 100) });
      RemoteLogger.info(`📥 Inbound Android Share Intent: ${type}`, { raw: data.slice(0, 300) }, 'ShareIntentReceiver');
      setIsSaving(true);
      try {
        if (type === 'image') {
          // Copy content:// to cache for readability, then analyze with Gemini Vision
          let cachedUri = data;
          try {
            cachedUri = await ShareIntentService.copyToCache(data);
          } catch (copyError: any) {
            console.warn('[FeedScreen] Failed to copy to cache, proceeding with original URI:', copyError);
            RemoteLogger.warn('Failed to copy shared content URI to cache', { error: copyError?.message, uri: data }, 'ShareIntent');
          }

          const visionResult = await VisionAIService.analyzeImage(cachedUri);
          console.log('[FeedScreen] 📸 Screenshot Vision Result:', {
            title: visionResult.title,
            tags: visionResult.tags,
            classification: visionResult.classification,
          });
          addMemory({
            type: visionResult.classification || 'image',
            title: visionResult.title || 'Saved Screenshot',
            content: visionResult.tldr || visionResult.ocrText || 'Captured visual screenshot',
            imageUrl: cachedUri,
            ocrText: visionResult.ocrText,
            tags: visionResult.tags.length > 0 ? visionResult.tags : ['Screenshot'],
            contextSpace: visionResult.tags[0] || 'Screenshot',
            confidenceScore: visionResult.confidenceScore,
          });
          triggerSynapticFusion();
          const { ByokService } = await import('../../src/services/byokService');
          const hasKey = await ByokService.hasCustomKey();
          if (!hasKey) {
            useMemoryStore.getState().triggerByokPromptIfNeeded();
          } else {
            showToast(`✨ BYOK AI analyzed screenshot & added ${visionResult.tags.length} smart tags!`, 'success');
          }
        } else {
          // Text/URL — enrich with scraper
          const enriched = await URLEnrichmentService.enrichUrlAsync(data);
          addMemory(enriched);
          triggerSynapticFusion();
          const { ByokService } = await import('../../src/services/byokService');
          const hasKey = await ByokService.hasCustomKey();
          if (!hasKey) {
            useMemoryStore.getState().triggerByokPromptIfNeeded();
          } else {
            showToast('✨ Saved visual post card from shared link!', 'success');
          }
        }
      } catch (e: any) {
        console.error('[FeedScreen] Share intent handling error:', e);
        if (type === 'image') {
          RemoteLogger.error('Image cannot be able to uploaded from external platform share', {
            error: e?.message || String(e),
            stack: e?.stack,
            sharedUri: data,
            platform: 'Android Share Intent',
          }, 'ShareIntentReceiver');
          showToast('Image cannot be able to uploaded', 'error');
        } else {
          RemoteLogger.error('Failed to process incoming shared link', {
            error: e?.message || String(e),
            sharedData: data,
          }, 'ShareIntentReceiver');
        }
      } finally {
        setIsSaving(false);
      }
    };

    // Check if app was opened via share intent
    ShareIntentService.getSharedContent().then((shared) => {
      if (shared.type && shared.data) {
        handleSharedContent(shared.data, shared.type);
      }
    });

    // Listen for share intents while app is open
    const unsubscribe = ShareIntentService.addListener((type, data) => {
      if (type === 'image') {
        handleSharedContent(data, 'image');
      } else {
        handleSharedContent(data, 'text');
      }
    });

    return unsubscribe;
  }, []);

  const [isSpotlightVisible, setIsSpotlightVisible] = useState(false);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Clean Screen Title & Settings Header */}
      <View style={styles.headerTitleRow}>
        <Text style={styles.screenTitle}>Memory Feed</Text>
        <TouchableOpacity
          style={styles.settingsHeaderBtn}
          activeOpacity={0.75}
          onPress={() => {
            CyberTheme.haptics.light();
            openSettingsModal();
          }}
        >
          <Settings size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* 21st.dev Style Spotlight Search Bar Trigger */}
      <View style={styles.searchSection}>
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => {
            CyberTheme.haptics.light();
            setIsSpotlightVisible(true);
          }}
        >
          <Search size={16} color="#94A3B8" />
          <Text style={styles.searchPlaceholder}>
            {searchQuery ? searchQuery : 'Search your mind...'}
          </Text>
          <View style={styles.spotlightBadge}>
            <Sparkles size={12} color="#94A3B8" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Stacks & Smart Spaces — visible when active query exists */}
      {searchQuery.trim().length > 0 && (
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
            {isSaving && <SavingSkeletonCard />}
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
            <Sparkles size={28} color="#64748B" />
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptySub}>Save a thought, screenshot, or link to get started.</Text>
          </View>
        )}
      </ScrollView>

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

      {/* Toast Notification Banner (Tap to open Settings if prompt) */}
      {toastMessage && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (toastMessage.includes('Settings') || toastMessage.includes('key') || toastMessage.includes('BYOK')) {
              CyberTheme.haptics.light();
              openSettingsModal();
            }
          }}
          style={[
            styles.toastBanner,
            toastType === 'error' && styles.toastBannerError,
          ]}
        >
          {toastType === 'error' ? (
            <AlertCircle size={16} color="#F87171" />
          ) : (
            <CheckCircle2 size={16} color="#10B981" />
          )}
          <Text
            style={[
              styles.toastText,
              toastType === 'error' && styles.toastTextError,
            ]}
          >
            {toastMessage}
          </Text>
        </TouchableOpacity>
      )}

      {/* Spotlight Command Palette (21st.dev Style) */}
      <SpotlightCommandPalette
        visible={isSpotlightVisible}
        onClose={() => setIsSpotlightVisible(false)}
        memories={memories}
        onSelectMemory={handleCardPress}
      />

      {/* Floating Capture Bar & Modals */}
      <MemoryDetailModal />
      <SettingsModal />
      <ByokPromptModal />
      <CaptureBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101114',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  settingsHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  toastBanner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#181A20',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
  },
  toastBannerError: {
    backgroundColor: '#1C1316',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  toastText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E2E8F0',
  },
  toastTextError: {
    color: '#FCA5A5',
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181A20',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    height: 44,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400',
  },
  spotlightBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
    padding: 4,
  },
  masonryScrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 100,
    paddingTop: 4,
  },
  masonryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  masonryColumn: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
  },
});
