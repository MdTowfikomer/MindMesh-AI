import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MemoryItem, SmartSpace } from '../types/mindmesh';
import { Globe, Quote, Mic, Video, FileText, DollarSign, Image as ImageIcon, Tag, Bookmark } from './Icons';

interface AutoStacksDrawerProps {
  memories: MemoryItem[];
  savedSmartSpaces: SmartSpace[];
  activeSearchQuery: string;
  onSelectStack: (queryFilter: string) => void;
  onCreateSmartSpace: (name: string, query: string) => void;
  onDeleteSmartSpace: (id: string) => void;
}

export const AutoStacksDrawer: React.FC<AutoStacksDrawerProps> = ({
  memories,
  savedSmartSpaces,
  activeSearchQuery,
  onSelectStack,
}) => {
  // Dynamic volume-based auto stacks
  const stackCategories = [
    { id: 'st-articles', name: 'Articles', query: 'type:article', icon: Globe, count: memories.filter((m) => m.type === 'article').length },
    { id: 'st-quotes', name: 'Quotes', query: 'type:quote', icon: Quote, count: memories.filter((m) => m.type === 'quote').length },
    { id: 'st-images', name: 'Images', query: 'type:image', icon: ImageIcon, count: memories.filter((m) => m.type === 'image' || m.type === 'whiteboard').length },
    { id: 'st-voice', name: 'Voice', query: 'type:voice', icon: Mic, count: memories.filter((m) => m.type === 'voice').length },
    { id: 'st-videos', name: 'Videos', query: 'type:video', icon: Video, count: memories.filter((m) => m.type === 'video' || m.type === 'gif').length },
    { id: 'st-pdfs', name: 'PDFs', query: 'type:pdf', icon: FileText, count: memories.filter((m) => m.type === 'pdf').length },
    { id: 'st-pricing', name: 'Pricing', query: 'type:pricing', icon: DollarSign, count: memories.filter((m) => m.type === 'pricing').length },
  ].filter((cat) => cat.count > 0).sort((a, b) => b.count - a.count);

  return (
    <View style={styles.container}>
      {/* Auto Stacks — horizontal scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
        {stackCategories.map((stack) => {
          const IconComp = stack.icon;
          const isActive = activeSearchQuery === stack.query;
          return (
            <TouchableOpacity
              key={stack.id}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onSelectStack(isActive ? '' : stack.query)}
              activeOpacity={0.7}
            >
              <IconComp size={11} color={isActive ? '#101114' : '#94A3B8'} />
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{stack.name}</Text>
              <Text style={[styles.pillCount, isActive && styles.pillCountActive]}>{stack.count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Saved Smart Spaces — only show if any exist */}
      {savedSmartSpaces.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
          <Bookmark size={10} color="#64748B" />
          {savedSmartSpaces.map((space) => {
            const isActive = activeSearchQuery === space.query;
            return (
              <TouchableOpacity
                key={space.id}
                style={[styles.spacePill, isActive && styles.spacePillActive]}
                onPress={() => onSelectStack(isActive ? '' : space.query)}
                activeOpacity={0.7}
              >
                <Tag size={9} color={isActive ? '#101114' : '#94A3B8'} />
                <Text style={[styles.spaceText, isActive && styles.spaceTextActive]}>{space.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    gap: 6,
  },
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pillActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F8FAFC',
  },
  pillText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#101114',
    fontWeight: '600',
  },
  pillCount: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  pillCountActive: {
    color: '#64748B',
  },
  spacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#181A20',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  spacePillActive: {
    backgroundColor: '#F8FAFC',
  },
  spaceText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  spaceTextActive: {
    color: '#101114',
    fontWeight: '600',
  },
});
