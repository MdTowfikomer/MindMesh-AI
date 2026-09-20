import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LayoutGrid, Sparkles, Folder, RotateCcw } from '../../src/components/Icons';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { MemoryDetailModal } from '../../src/components/MemoryDetailModal';
import { FullScreenImageViewerModal } from '../../src/components/FullScreenImageViewerModal';
import { KnowledgeGraphModal } from '../../src/components/KnowledgeGraphModal';

LogBox.ignoreLogs(['Due to changes in Androids permission requirements']);

export default function TabLayout() {
  const { loadStoredMemories } = useMemoryStore();

  useEffect(() => {
    loadStoredMemories();
  }, [loadStoredMemories]);


  return (
    <>
      <StatusBar style="light" />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#101114',
          borderTopColor: 'rgba(255, 255, 255, 0.06)',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#F8FAFC',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.1,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Memory Feed',
          tabBarLabel: 'Memories',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size - 2} color={color as string} />,
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discovery',
          tabBarLabel: 'Discovery',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Sparkles size={size - 2} color={color as string} />,
        }}
      />

      <Tabs.Screen
        name="serendipity"
        options={{
          title: 'Serendipity',
          tabBarLabel: 'Serendipity',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <RotateCcw size={size - 2} color={color as string} />,
        }}
      />

      <Tabs.Screen
        name="spaces"
        options={{
          title: 'Spaces',
          tabBarLabel: 'Spaces',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Folder size={size - 2} color={color as string} />,
        }}
      />
    </Tabs>
    <MemoryDetailModal />
    <FullScreenImageViewerModal />
    <KnowledgeGraphModal />
    </>
  );
}
