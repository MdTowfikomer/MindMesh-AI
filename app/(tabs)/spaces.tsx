import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Dimensions, StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { MemoryItem } from '../../src/types/mindmesh';
import { theme } from '../../src/theme/tokens';
import { Plus, X, Folder, Trash2 } from '../../src/components/Icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SpaceCollection {
  name: string;
  items: MemoryItem[];
  coverImage?: string;
  isUserCreated?: boolean;
  spaceId?: string; // for user-created spaces (to delete)
}

export default function SpacesScreen() {
  const { memories, savedSmartSpaces, createSmartSpace, deleteSmartSpace, deleteMemory } = useMemoryStore();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<SpaceCollection | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Intercept Android hardware back press & back swipe gesture so user remains inside Spaces tab
  useEffect(() => {
    const onBackPress = () => {
      if (fullScreenImage) {
        setFullScreenImage(null);
        return true;
      }
      if (selectedSpace) {
        setSelectedSpace(null);
        return true;
      }
      if (isCreateModalVisible) {
        setIsCreateModalVisible(false);
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [fullScreenImage, selectedSpace, isCreateModalVisible]);

  // Auto-generate collections — only from user-uploaded memories (not seed data)
  const autoCollections = useMemo(() => {
    const tagCounts: Record<string, MemoryItem[]> = {};

    // Only user memories (seed IDs are like "mem-article-1", user IDs are "mem-1723456789")
    const userMemories = memories.filter(m => /^mem-\d+$/.test(m.id));

    userMemories.forEach((mem) => {
      // Use only the FIRST tag as the primary space for this memory
      const primaryTag = mem.tags[0];
      if (!primaryTag) return;

      const normalizedTag = primaryTag.charAt(0).toUpperCase() + primaryTag.slice(1).toLowerCase();
      if (!tagCounts[normalizedTag]) tagCounts[normalizedTag] = [];
      if (!tagCounts[normalizedTag].find(m => m.id === mem.id)) {
        tagCounts[normalizedTag].push(mem);
      }
    });

    return Object.entries(tagCounts)
      .filter(([_, items]) => items.length >= 1)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 16)
      .map(([name, items]) => ({
        name,
        items,
        coverImage: items.find(i => i.imageUrl)?.imageUrl || undefined,
      }));
  }, [memories]);

  // User-created spaces
  const userSpaces = useMemo(() => {
    return savedSmartSpaces.map((space) => {
      const matchingItems = memories.filter((m) =>
        m.tags.some(t => t.toLowerCase().includes(space.query.toLowerCase())) ||
        m.title.toLowerCase().includes(space.query.toLowerCase()) ||
        m.contextSpace.toLowerCase().includes(space.query.toLowerCase())
      );
      return {
        name: space.name,
        items: matchingItems,
        coverImage: matchingItems.find(i => i.imageUrl)?.imageUrl || undefined,
        isUserCreated: true,
        spaceId: space.id,
      };
    });
  }, [savedSmartSpaces, memories]);

  const allSpaces = [...userSpaces, ...autoCollections];

  const handleCreateSpace = () => {
    if (newSpaceName.trim()) {
      createSmartSpace(newSpaceName.trim(), newSpaceName.trim().toLowerCase());
      setNewSpaceName('');
      setIsCreateModalVisible(false);
    }
  };

  const handleDeleteDirectory = () => {
    if (selectedSpace?.isUserCreated && selectedSpace.spaceId) {
      deleteSmartSpace(selectedSpace.spaceId);
    }
    setSelectedSpace(null);
  };

  const handleDeleteItemFromSpace = (itemId: string) => {
    deleteMemory(itemId);
    // Update the selected space items in real-time
    if (selectedSpace) {
      const updatedItems = selectedSpace.items.filter(i => i.id !== itemId);
      if (updatedItems.length === 0) {
        setSelectedSpace(null); // Go back if empty
      } else {
        setSelectedSpace({ ...selectedSpace, items: updatedItems });
      }
    }
  };

  // ─── Full Screen Image Viewer ───────────────────────────────────────────────
  if (fullScreenImage) {
    return (
      <View style={styles.fullScreenBackdrop}>
        <StatusBar hidden />
        <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} resizeMode="contain" />
        <TouchableOpacity style={styles.fullScreenCloseBtn} onPress={() => setFullScreenImage(null)}>
          <X size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Space Detail View ──────────────────────────────────────────────────────
  if (selectedSpace) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderRow}>
            <TouchableOpacity onPress={() => setSelectedSpace(null)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>

            {/* Delete directory button (only for user-created) */}
            {selectedSpace.isUserCreated && (
              <TouchableOpacity style={styles.deleteDirectoryBtn} onPress={handleDeleteDirectory}>
                <Trash2 size={14} color="#E11D48" />
                <Text style={styles.deleteDirectoryText}>Delete Space</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.detailTitle}>{selectedSpace.name}</Text>
          <Text style={styles.detailCount}>{selectedSpace.items.length} items</Text>
        </View>

        <ScrollView contentContainerStyle={styles.detailGrid}>
          <View style={styles.gridRow}>
            {selectedSpace.items.map((item) => (
              <View key={item.id} style={styles.detailCard}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => item.imageUrl ? setFullScreenImage(item.imageUrl) : null}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.detailCardImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.detailCardText}>
                      <Text style={styles.detailCardTextContent} numberOfLines={4}>{item.content || item.title}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.detailCardFooter}>
                  <Text style={styles.detailCardCaption} numberOfLines={1}>{item.title}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItemFromSpace(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={12} color={theme.colors.textDim} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Main Spaces Grid ───────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spaces</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsCreateModalVisible(true)}>
          <Plus size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {allSpaces.map((space, idx) => (
            <TouchableOpacity
              key={`${space.name}-${idx}`}
              style={styles.spaceCard}
              onPress={() => setSelectedSpace(space)}
              activeOpacity={0.85}
            >
              {space.coverImage ? (
                <Image source={{ uri: space.coverImage }} style={styles.spaceCover} resizeMode="cover" />
              ) : (
                <View style={styles.spaceCoverPlaceholder}>
                  <Folder size={24} color={theme.colors.textDim} />
                </View>
              )}
              <Text style={styles.spaceName}>{space.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {allSpaces.length === 0 && (
          <View style={styles.emptyState}>
            <Folder size={32} color={theme.colors.textDim} />
            <Text style={styles.emptyTitle}>No spaces yet</Text>
            <Text style={styles.emptySub}>Save items with tags and spaces will auto-generate, or create your own.</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Space Modal */}
      <Modal visible={isCreateModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsCreateModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Space</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                <X size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Space name (e.g. Anime, Recipes, Code)"
              placeholderTextColor={theme.colors.textDim}
              value={newSpaceName}
              onChangeText={setNewSpaceName}
              autoFocus
              onSubmitEditing={handleCreateSpace}
            />

            <Text style={styles.modalHint}>
              Items with matching tags or content will automatically appear in this space.
            </Text>

            <TouchableOpacity
              style={[styles.createBtn, !newSpaceName.trim() && styles.createBtnDisabled]}
              onPress={handleCreateSpace}
              disabled={!newSpaceName.trim()}
            >
              <Text style={styles.createBtnText}>Create Space</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101114',
  },
  fullScreenBackdrop: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main grid
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spaceCard: {
    width: '48%',
    marginBottom: 12,
  },
  spaceCover: {
    width: '100%',
    height: 160,
    borderRadius: 16,
  },
  spaceCoverPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 6,
    paddingHorizontal: 2,
  },
  emptyState: {
    paddingVertical: 80,
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
    paddingHorizontal: 40,
  },

  // Detail view
  detailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {},
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00F2FE',
  },
  deleteDirectoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(225, 29, 72, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.3)',
  },
  deleteDirectoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF007F',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  detailCount: {
    fontSize: 12,
    color: '#64748B',
  },
  detailGrid: {
    padding: 10,
    paddingBottom: 40,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailCard: {
    width: '48%',
    marginBottom: 10,
  },
  detailCardImage: {
    width: '100%',
    height: 140,
    borderRadius: 14,
  },
  detailCardText: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    justifyContent: 'center',
  },
  detailCardTextContent: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  detailCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  detailCardCaption: {
    fontSize: 10,
    color: '#64748B',
    flex: 1,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 3, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0E1020',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    padding: 20,
    width: '85%',
    gap: 14,
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalInput: {
    fontSize: 14,
    color: '#F8FAFC',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalHint: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  createBtn: {
    backgroundColor: '#00F2FE',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: '#FFF',
  },
});
