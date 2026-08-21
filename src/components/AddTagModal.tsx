import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { X, ChevronUp } from './Icons';

interface AddTagModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveTags: (tags: string[]) => void;
  currentTags: string[];
  recentTags?: string[];
}

export const AddTagModal: React.FC<AddTagModalProps> = ({
  visible,
  onClose,
  onSaveTags,
  currentTags,
  recentTags = ['competition', 'portfolio', 'ideas', 'design', 'notes', 'pricing'],
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelectedTags([...currentTags]);
      setInputText('');
    }
  }, [visible, currentTags]);

  if (!visible) return null;

  const handleAddFromInput = () => {
    const trimmed = inputText.trim().replace(/^#/, '');
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setInputText('');
  };

  const handleToggleRecentTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFinishAndSave = () => {
    const trimmed = inputText.trim().replace(/^#/, '');
    let finalTags = [...selectedTags];
    if (trimmed && !finalTags.includes(trimmed)) {
      finalTags.push(trimmed);
    }
    onSaveTags(finalTags);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.outsideOverlay} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Header Row: ADD TAGS label and Close Button */}
          <View style={styles.headerRow}>
            <Text style={styles.headerLabel}>ADD TAGS</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Inner Rounded Input & Recents Container */}
          <View style={styles.innerBox}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type tag name..."
                placeholderTextColor="#64748B"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAddFromInput}
                autoFocus={true}
                returnKeyType="done"
              />
              <ChevronUp size={16} color="#64748B" />
            </View>

            {/* Selected Tags Chips (if any added) */}
            {selectedTags.length > 0 && (
              <View style={styles.selectedTagsRow}>
                {selectedTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.selectedTagPill}
                    onPress={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                  >
                    <Text style={styles.selectedTagText}>{tag}</Text>
                    <X size={10} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* RECENT TAGS Section */}
            <View style={styles.recentSection}>
              <Text style={styles.recentSectionLabel}>RECENT TAGS</Text>
              <ScrollView style={styles.recentScroll} showsVerticalScrollIndicator={false}>
                {recentTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={styles.recentTagItem}
                      onPress={() => handleToggleRecentTag(tag)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.recentTagText, isSelected && styles.recentTagTextSelected]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Finish & Save (Signature mymind orange pill) */}
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={handleFinishAndSave}
            activeOpacity={0.88}
          >
            <Text style={styles.finishBtnText}>Finish & Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 17, 20, 0.88)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  outsideOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: '#181A20',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 0.8,
  },
  innerBox: {
    backgroundColor: '#121418',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '400',
    paddingVertical: 4,
  },
  selectedTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#252832',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  recentSection: {
    gap: 8,
    maxHeight: 140,
  },
  recentSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  recentScroll: {
    maxHeight: 110,
  },
  recentTagItem: {
    paddingVertical: 6,
  },
  recentTagText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  recentTagTextSelected: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  finishBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101114',
  },
});
