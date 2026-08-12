import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Dimensions, StatusBar } from 'react-native';
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
      <View style={styles.fullScreenContainer}>
        <StatusBar hidden />
        <Image source={{ uri: fullScreenImage }} style={styles.fullScreenImage} resizeMode="contain" />
        <TouchableOpacity style={styles.fullScreenClose} onPress={() => setFullScreenImage(null)}>
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
    backgroundColor: theme.colors.bg,
  },

  // Full screen image viewer
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullScreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.textPrimary,
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
    gap: 6,
  },
  spaceCard: {
    width: '48.5%',
    marginBottom: 10,
  },
  spaceCover: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  spaceCoverPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceName: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  emptySub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Detail view
  detailHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 2,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {},
  backBtnText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 13,
    color: theme.colors.auroraIndigo,
  },
  deleteDirectoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deleteDirectoryText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: '#E11D48',
  },
  detailTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  detailCount: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  detailGrid: {
    padding: 10,
    paddingBottom: 40,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailCard: {
    width: '48.5%',
    marginBottom: 10,
  },
  detailCardImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
  },
  detailCardText: {
    width: '100%',
    height: 140,
    backgroundColor: '#F5F5F3',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
  },
  detailCardTextContent: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textSecondary,
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
    fontFamily: theme.fonts.sans,
    fontSize: 10,
    color: theme.colors.textMuted,
    flex: 1,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  modalInput: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalHint: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
  },
  createBtn: {
    backgroundColor: theme.colors.textPrimary,
    paddingVertical: 12,
    borderRadius: 8,
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
