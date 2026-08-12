import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { MemoryItem } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { Trash2, RotateCcw, X, AlertCircle } from './Icons';

interface TrashModalProps {
  visible: boolean;
  trash: MemoryItem[];
  onClose: () => void;
  onRestore: (id: string) => void;
  onPurge: (id: string) => void;
  onEmptyTrash: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  visible,
  trash,
  onClose,
  onRestore,
  onPurge,
  onEmptyTrash,
}) => {
  const calculateDaysRemaining = (deletedAt?: string) => {
    if (!deletedAt) return 30;
    const deletedDate = new Date(deletedAt).getTime();
    const now = Date.now();
    const daysPassed = Math.floor((now - deletedDate) / (1000 * 60 * 60 * 24));
    return Math.max(1, 30 - daysPassed);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Trash2 size={18} color={theme.colors.tagPricingText} />
              <Text style={styles.title}>30-Day Trash & Recovery ({trash.length})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subText}>
            Items in trash will be permanently purged automatically after 30 days. You can restore them anytime.
          </Text>

          {trash.length > 0 && (
            <TouchableOpacity style={styles.emptyTrashBtn} onPress={onEmptyTrash}>
              <Trash2 size={12} color="#FFF" />
              <Text style={styles.emptyTrashBtnText}>Empty Trash Now</Text>
            </TouchableOpacity>
          )}

          {/* List of Soft Deleted Items */}
          <FlatList
            data={trash}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const daysLeft = calculateDaysRemaining(item.deletedAt);
              return (
                <View style={styles.trashCard}>
                  <View style={styles.trashInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.daysRow}>
                      <AlertCircle size={10} color={theme.colors.tagPricingText} />
                      <Text style={styles.daysText}>{daysLeft} days remaining before auto-delete</Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.restoreBtn} onPress={() => onRestore(item.id)}>
                      <RotateCcw size={12} color={theme.colors.auroraEmerald} />
                      <Text style={styles.restoreText}>Restore</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.purgeBtn} onPress={() => onPurge(item.id)}>
                      <X size={12} color={theme.colors.tagPricingText} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Trash2 size={32} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Trash is empty</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '75%',
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  subText: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    lineHeight: 15,
  },
  emptyTrashBtn: {
    backgroundColor: theme.colors.tagPricingText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyTrashBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: '#FFF',
  },
  listContent: {
    paddingVertical: 8,
    gap: 10,
  },
  trashCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trashInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysText: {
    fontSize: 10,
    fontFamily: theme.fonts.sans,
    color: theme.colors.tagPricingText,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  restoreText: {
    fontSize: 10,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraEmerald,
  },
  purgeBtn: {
    padding: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 6,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});
