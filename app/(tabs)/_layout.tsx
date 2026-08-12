import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { theme } from '../../src/theme/tokens';
import { LayoutGrid, Sparkles, Folder, Crown, RotateCcw } from '../../src/components/Icons';
import { useMemoryStore } from '../../src/stores/memoryStore';

export default function TabLayout() {
  const { openPaywall, userStats } = useMemoryStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.bg,
        },
        headerTitleStyle: {
          fontFamily: theme.fonts.serif,
          fontSize: 20,
          color: theme.colors.textPrimary,
        },
        headerRight: () => (
          <TouchableOpacity
            style={styles.proHeaderBadge}
            onPress={openPaywall}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Crown size={12} color={theme.colors.auroraAmber} />
            <Text style={styles.proHeaderText}>{userStats.isPro ? 'Pro' : 'Upgrade'}</Text>
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 14,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.auroraIndigo,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: theme.fonts.sansMedium,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Memory Feed',
          tabBarLabel: 'Memories',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size - 2} color={color} />,
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: 'Connection Engine',
          tabBarLabel: 'Discovery',
          tabBarIcon: ({ color, size }) => <Sparkles size={size - 2} color={color} />,
        }}
      />

      <Tabs.Screen
        name="serendipity"
        options={{
          title: 'Serendipity',
          tabBarLabel: 'Serendipity',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <RotateCcw size={size - 2} color={color} />,
        }}
      />

      <Tabs.Screen
        name="spaces"
        options={{
          title: 'Spaces',
          tabBarLabel: 'Spaces',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Folder size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  proHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
    marginRight: 16,
  },
  proHeaderText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraAmber,
  },
});
