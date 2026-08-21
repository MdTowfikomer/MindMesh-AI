import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronDown,
  Plus,
  Share2,
  Trash2,
  Check,
  X,
  Folder,
  FileText,
  Mic,
  MoreHorizontal,
  Play,
  Globe,
  ArrowRight,
} from './Icons';
import { MemoryItem } from '../types/mindmesh';
import { useMemoryStore } from '../stores/memoryStore';
import { SoundEffects } from '../services/soundEffects';
import { CyberTheme } from '../theme/cyberLuxury';
import { AddTagModal } from './AddTagModal';

export const MemoryDetailModal: React.FC = () => {
  const {
    selectedMemory,
    isMemoryDetailVisible,
    closeMemoryDetail,
    updateMemoryTags,
    updateMemoryNote,
    updateMemoryDirectory,
    deleteMemory,
  } = useMemoryStore();

  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSelectingDirectory, setIsSelectingDirectory] = useState(false);

  const availableDirectories = ['Shipathon', 'Pricing', 'Notes', 'Visuals', 'Startup Ideas', 'Personal'];

  useEffect(() => {
    if (selectedMemory) {
      setNoteText(selectedMemory.personalNote || '');
    }
  }, [selectedMemory]);

  if (!isMemoryDetailVisible || !selectedMemory) return null;

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = selectedMemory.tags.filter((t) => t !== tagToRemove);
    updateMemoryTags(selectedMemory.id, updated);
  };

  const handleNoteChange = (text: string) => {
    setNoteText(text);
    updateMemoryNote(selectedMemory.id, text);
  };

  const handleSelectDirectory = (dir: string) => {
    updateMemoryDirectory(selectedMemory.id, dir);
    setIsSelectingDirectory(false);
  };

  const handleDelete = () => {
    SoundEffects.playCrumpleSound();
    deleteMemory(selectedMemory.id);
    closeMemoryDetail();
  };

  const handleShare = async () => {
    try {
      const shareContent = selectedMemory.imageUrl
        ? { title: selectedMemory.title, url: selectedMemory.imageUrl }
        : { title: selectedMemory.title, message: selectedMemory.content || selectedMemory.title };
      await Share.share(shareContent);
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const getTimeAgo = () => {
    if (!selectedMemory.createdAt) return 'just now';
    const diffSeconds = Math.round((Date.now() - new Date(selectedMemory.createdAt).getTime()) / 1000);
    if (diffSeconds < 60) return `${Math.max(1, diffSeconds)} seconds ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return 'recently';
  };

  return (
    <Modal
      visible={isMemoryDetailVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={closeMemoryDetail}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Header Bar: Down Arrow, Title, More Options */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconButton} onPress={closeMemoryDetail}>
            <ChevronDown size={22} color="#CBD5E1" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedMemory.title || selectedMemory.urlMetadata?.domain || 'Saved Memory'}
          </Text>

          <TouchableOpacity style={styles.headerIconButton}>
            <MoreHorizontal size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Hero Card Canvas */}
          {selectedMemory.imageUrl ? (
            <View style={styles.heroImageBox}>
              <Image source={{ uri: selectedMemory.imageUrl }} style={styles.heroImage} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.heroTextBox}>
              <Text style={styles.heroTextContent}>
                {selectedMemory.content || selectedMemory.ocrText || selectedMemory.title || 'Note content'}
              </Text>
              {selectedMemory.type === 'voice' && selectedMemory.audioDuration ? (
                <Text style={styles.voiceMetaText}>🎙️ {selectedMemory.audioDuration} Voice Memo</Text>
              ) : null}
            </View>
          )}

          {/* Clickable Action Banner for Videos / Shared URLs (Instagram, YouTube, Web) */}
          {selectedMemory.urlMetadata?.url && (
            <TouchableOpacity
              style={styles.watchVideoBtn}
              activeOpacity={0.85}
              onPress={() => {
                CyberTheme.haptics.medium();
                Linking.openURL(selectedMemory.urlMetadata!.url);
              }}
            >
              <View style={styles.watchVideoIconCircle}>
                {selectedMemory.type === 'video' ||
                selectedMemory.urlMetadata.url.includes('instagram.com') ||
                selectedMemory.urlMetadata.url.includes('youtube.com') ||
                selectedMemory.urlMetadata.url.includes('youtu.be') ? (
                  <Play size={14} color="#FFF" />
                ) : (
                  <Globe size={14} color="#FFF" />
                )}
              </View>
              <View style={styles.watchVideoTextCol}>
                <Text style={styles.watchVideoTitle} numberOfLines={1}>
                  {selectedMemory.urlMetadata.url.includes('instagram.com')
                    ? 'Watch Reel on Instagram'
                    : selectedMemory.urlMetadata.url.includes('youtube.com') ||
                      selectedMemory.urlMetadata.url.includes('youtu.be')
                    ? 'Watch Video on YouTube'
                    : selectedMemory.type === 'video'
                    ? 'Watch Video'
                    : 'Open Original Web Link'}
                </Text>
                <Text style={styles.watchVideoSub} numberOfLines={1}>
                  {selectedMemory.urlMetadata.domain || selectedMemory.urlMetadata.url}
                </Text>
              </View>
              <View style={styles.watchVideoArrowPill}>
                <ArrowRight size={14} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          )}

          {/* MIND TAGS Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MIND TAGS</Text>
            <View style={styles.tagsRow}>
              {/* + Add tag Button (mymind signature coral pill) */}
              <TouchableOpacity
                style={styles.addTagPill}
                onPress={() => setIsAddTagModalOpen(true)}
                activeOpacity={0.85}
              >
                <Plus size={12} color="#FFF" />
                <Text style={styles.addTagPillText}>Add tag</Text>
              </TouchableOpacity>

              {/* Tag Pills */}
              {selectedMemory.tags.map((tag, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.tagItem}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <FileText size={11} color="#94A3B8" />
                  <Text style={styles.tagItemText}>{tag}</Text>
                  <X size={10} color="#64748B" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* MIND NOTES Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MIND NOTES</Text>
            <View style={styles.notesContainer}>
              <TextInput
                style={styles.notesInput}
                placeholder="Type here to add a note..."
                placeholderTextColor="#64748B"
                multiline
                value={noteText}
                onChangeText={handleNoteChange}
              />
            </View>
          </View>

          {/* Spaces Sub-Menu (If opened) */}
          {isSelectingDirectory && (
            <View style={styles.directoryBox}>
              <Text style={styles.directoryBoxLabel}>ASSIGN TO SPACE:</Text>
              <View style={styles.directoryChipsRow}>
                {availableDirectories.map((dir) => {
                  const isSelected = (selectedMemory.directory || selectedMemory.contextSpace) === dir;
                  return (
                    <TouchableOpacity
                      key={dir}
                      style={[styles.directoryChip, isSelected && styles.directoryChipActive]}
                      onPress={() => handleSelectDirectory(dir)}
                    >
                      <Text style={[styles.directoryChipText, isSelected && styles.directoryChipTextActive]}>
                        {dir}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Dock: Spaces, Share, Delete */}
        <View style={styles.bottomDock}>
          <View style={styles.actionButtonsRow}>
            {/* Spaces Pill */}
            <TouchableOpacity
              style={[styles.dockBtn, isSelectingDirectory && styles.dockBtnActive]}
              onPress={() => setIsSelectingDirectory(!isSelectingDirectory)}
            >
              <Folder size={14} color="#CBD5E1" />
              <Text style={styles.dockBtnText}>
                {selectedMemory.directory || selectedMemory.contextSpace || 'Spaces'}
              </Text>
            </TouchableOpacity>

            {/* Share Pill */}
            <TouchableOpacity style={styles.dockBtn} onPress={handleShare}>
              <Share2 size={14} color="#CBD5E1" />
              <Text style={styles.dockBtnText}>Share</Text>
            </TouchableOpacity>

            {/* Delete Pill (mymind soft coral pill) */}
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Trash2 size={14} color="#E11D48" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Attribution */}
          <Text style={styles.footerTimeText}>
            Saved to your mind, {getTimeAgo()}
          </Text>
        </View>

        {/* Add Tag Modal Overlay (mymind popup with Keyboard autofocus) */}
        <AddTagModal
          visible={isAddTagModalOpen}
          onClose={() => setIsAddTagModalOpen(false)}
          currentTags={selectedMemory.tags}
          onSaveTags={(newTags) => updateMemoryTags(selectedMemory.id, newTags)}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101114',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  headerIconButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  heroImageBox: {
    width: '100%',
    height: 280,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#181A20',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTextBox: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 24,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  heroTextContent: {
    fontSize: 16,
    color: '#F8FAFC',
    lineHeight: 24,
    fontWeight: '400',
  },
  voiceMetaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 12,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  addTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#222530',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  addTagPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#181A20',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tagItemText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  notesContainer: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 14,
    minHeight: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  notesInput: {
    fontSize: 13,
    color: '#F8FAFC',
    lineHeight: 19,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  directoryBox: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  directoryBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  directoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  directoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  directoryChipActive: {
    backgroundColor: '#F8FAFC',
  },
  directoryChipText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  directoryChipTextActive: {
    color: '#101114',
    fontWeight: '600',
  },
  watchVideoBtn: {
    backgroundColor: '#181A20',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  watchVideoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchVideoTextCol: {
    flex: 1,
    gap: 2,
  },
  watchVideoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  watchVideoSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  watchVideoArrowPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomDock: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    gap: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dockBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#181A20',
    borderRadius: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  dockBtnActive: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  dockBtnText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFE4E6', // soft coral pill
    borderRadius: 20,
    paddingVertical: 10,
  },
  deleteBtnText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '600',
  },
  footerTimeText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
