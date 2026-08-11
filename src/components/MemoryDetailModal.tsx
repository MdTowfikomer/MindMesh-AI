import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { theme } from '../theme/tokens';
import { X, Plus, Folder, Share2, Trash2, Check, Sparkles } from './Icons';
import { MemoryItem } from '../types/mindmesh';
import { useMemoryStore } from '../stores/memoryStore';

export const MemoryDetailModal: React.FC = () => {
  const {
    selectedMemory,
    isMemoryDetailVisible,
    closeMemoryDetail,
    updateMemoryTags,
    updateMemoryNote,
    updateMemoryDirectory,
    deleteMemory,
    openShareSheet,
    openBuildPlanModal,
  } = useMemoryStore();

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isSelectingDirectory, setIsSelectingDirectory] = useState(false);

  const availableDirectories = ['Shipaton', 'Pricing', 'RevenueCat', 'MobileUX', 'Startup Ideas', 'Personal'];

  useEffect(() => {
    if (selectedMemory) {
      setNoteText(selectedMemory.personalNote || '');
    }
  }, [selectedMemory]);

  if (!isMemoryDetailVisible || !selectedMemory) return null;

  const handleAddTag = () => {
    const trimmed = newTagText.trim().replace(/^#/, '');
    if (trimmed && !selectedMemory.tags.includes(trimmed)) {
      const updated = [...selectedMemory.tags, trimmed];
      updateMemoryTags(selectedMemory.id, updated);
    }
    setNewTagText('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = selectedMemory.tags.filter(t => t !== tagToRemove);
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
    deleteMemory(selectedMemory.id);
  };

  // Format time ago string
  const getTimeAgo = () => {
    if (!selectedMemory.createdAt) return 'recently';
    const diffHours = Math.round((Date.now() - new Date(selectedMemory.createdAt).getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'less than an hour ago';
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <Modal visible={isMemoryDetailVisible} animationType="slide" transparent={true} onRequestClose={closeMemoryDetail}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeMemoryDetail}>
        <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={16} color={theme.colors.auroraPurple} />
              <Text style={styles.modalHeaderTitle}>Mind Memory Detail</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeMemoryDetail}>
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Prominent Hero Visual Media Preview (Uncropped Full Aspect Ratio) */}
            {selectedMemory.imageUrl && (
              <View style={[styles.heroMediaContainer, { aspectRatio: selectedMemory.aspectRatio || 1.1 }]}>
                <Image source={{ uri: selectedMemory.imageUrl }} style={styles.heroMediaImage} resizeMode="contain" />
              </View>
            )}

            {/* Audio Waveform Player Box if Voice Memo */}
            {selectedMemory.type === 'voice' && (
              <View style={styles.heroVoicePlayerBox}>
                <Text style={styles.heroVoiceTitle}>🎙️ Voice Recording ({selectedMemory.audioDuration || '0:30'})</Text>
                <View style={styles.heroWaveformBars}>
                  {(selectedMemory.audioWaveform || [20, 50, 90, 70, 100, 40, 80, 60, 95, 30]).map((barHeight, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.heroWaveformBar,
                        { height: Math.max(10, barHeight * 0.4) },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* TLDR Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>TLDR</Text>
              <View style={styles.tldrBox}>
                <Text style={styles.tldrTitle}>{selectedMemory.title}</Text>
                <Text style={styles.tldrText}>
                  {selectedMemory.content || selectedMemory.ocrText || 'Captured research fragment'}
                </Text>
              </View>
            </View>

            {/* MIND TAGS Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>MIND TAGS</Text>
              <View style={styles.tagsGrid}>
                {/* Orange "+ Add tag" Button */}
                {isAddingTag ? (
                  <View style={styles.addTagInputRow}>
                    <TextInput
                      style={styles.addTagInput}
                      placeholder="Tag name..."
                      placeholderTextColor={theme.colors.textMuted}
                      value={newTagText}
                      onChangeText={setNewTagText}
                      autoFocus
                      onSubmitEditing={handleAddTag}
                    />
                    <TouchableOpacity style={styles.confirmTagBtn} onPress={handleAddTag}>
                      <Check size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addTagBtn} onPress={() => setIsAddingTag(true)}>
                    <Plus size={14} color="#FFF" />
                    <Text style={styles.addTagText}>Add tag</Text>
                  </TouchableOpacity>
                )}

                {/* Existing Tag Pills */}
                {selectedMemory.tags.map((tag, idx) => (
                  <TouchableOpacity key={idx} style={styles.tagPill} onPress={() => handleRemoveTag(tag)}>
                    <Text style={styles.tagPillText}>{tag}</Text>
                    <X size={11} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* MIND NOTES Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionLabel}>MIND NOTES</Text>
              <View style={styles.notesBox}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Type here to add a note..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  value={noteText}
                  onChangeText={handleNoteChange}
                />
              </View>
            </View>

            {/* Build Spec Shortcut Button */}
            <TouchableOpacity style={styles.buildSpecBanner} onPress={() => { closeMemoryDetail(); openBuildPlanModal(); }}>
              <Sparkles size={14} color={theme.colors.auroraPurple} />
              <Text style={styles.buildSpecText}>View Synthesized Build Spec for this item</Text>
            </TouchableOpacity>

            {/* Directory Selection Sub-Menu */}
            {isSelectingDirectory && (
              <View style={styles.directoryPickerBox}>
                <Text style={styles.directoryPickerTitle}>SELECT DIRECTORY COLLECTION:</Text>
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
                          📁 {dir}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Bar (3 Options: Directories, Share, Delete) */}
          <View style={styles.bottomBar}>
            <View style={styles.actionRow}>
              {/* Option 1: Directories (Replaces Spaces) */}
              <TouchableOpacity
                style={[styles.actionBtn, isSelectingDirectory && styles.actionBtnActive]}
                onPress={() => setIsSelectingDirectory(!isSelectingDirectory)}
              >
                <Folder size={16} color={theme.colors.textPrimary} />
                <Text style={styles.actionBtnText}>
                  {selectedMemory.directory || selectedMemory.contextSpace || 'Directories'}
                </Text>
              </TouchableOpacity>

              {/* Option 2: Share */}
              <TouchableOpacity style={styles.actionBtn} onPress={() => { closeMemoryDetail(); openShareSheet(); }}>
                <Share2 size={16} color={theme.colors.textPrimary} />
                <Text style={styles.actionBtnText}>Share</Text>
              </TouchableOpacity>

              {/* Option 3: Delete (Danger Red Pill) */}
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Trash2 size={16} color="#E11D48" />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Timestamp */}
            <Text style={styles.footerTimestamp}>
              Saved to your mind, {getTimeAgo()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF', // Pure White Editorial Surface
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderTopWidth: 1,
    maxHeight: '88%',
    paddingTop: 16,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  heroMediaContainer: {
    width: '100%',
    maxHeight: 480,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.02)',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
  },
  heroMediaImage: {
    width: '100%',
    height: '100%',
  },
  heroVoicePlayerBox: {
    backgroundColor: 'rgba(3, 105, 161, 0.05)',
    borderColor: 'rgba(3, 105, 161, 0.15)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    padding: 16,
    gap: 12,
  },
  heroVoiceTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.auroraCyan,
    letterSpacing: 0.5,
  },
  heroWaveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 45,
  },
  heroWaveformBar: {
    flex: 1,
    backgroundColor: theme.colors.auroraCyan,
    borderRadius: 2,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraAmber,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tldrBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.02)',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    padding: 14,
  },
  tldrTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
  },
  tldrText: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  addTagBtn: {
    backgroundColor: '#EA580C', // Vibrant warm orange "+ Add tag" pill
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
  },
  addTagText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  addTagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderColor: 'rgba(15, 23, 42, 0.1)',
    borderWidth: 1,
    borderRadius: theme.radii.full,
    paddingHorizontal: 12,
    height: 34,
    gap: 6,
  },
  addTagInput: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textPrimary,
    minWidth: 90,
  },
  confirmTagBtn: {
    backgroundColor: theme.colors.auroraEmerald,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radii.full,
  },
  tagPillText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  notesBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.02)',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    padding: 14,
    minHeight: 100,
  },
  notesInput: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 19,
    textAlignVertical: 'top',
  },
  buildSpecBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(109, 40, 217, 0.06)',
    borderColor: 'rgba(109, 40, 217, 0.2)',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: theme.radii.sm,
  },
  buildSpecText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: theme.colors.auroraPurple,
  },
  directoryPickerBox: {
    backgroundColor: 'rgba(3, 105, 161, 0.04)',
    borderColor: 'rgba(3, 105, 161, 0.15)',
    borderWidth: 1,
    borderRadius: theme.radii.sm,
    padding: 12,
    gap: 8,
  },
  directoryPickerTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraCyan,
    letterSpacing: 0.8,
  },
  directoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  directoryChip: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.xs,
  },
  directoryChipActive: {
    backgroundColor: theme.colors.auroraCyan,
    borderColor: theme.colors.auroraCyan,
  },
  directoryChipText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  directoryChipTextActive: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.sansBold,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
    borderRadius: theme.radii.full,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionBtnActive: {
    backgroundColor: theme.colors.auroraIndigo,
    borderColor: theme.colors.auroraIndigo,
  },
  actionBtnText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(190, 18, 60, 0.06)',
    borderColor: 'rgba(190, 18, 60, 0.15)',
    borderWidth: 1,
    borderRadius: theme.radii.full,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  deleteBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: '#BE123C',
  },
  footerTimestamp: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
