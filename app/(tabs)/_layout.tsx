import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, LogBox, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LayoutGrid, Sparkles, Folder, RotateCcw } from '../../src/components/Icons';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { MemoryDetailModal } from '../../src/components/MemoryDetailModal';
import { FullScreenImageViewerModal } from '../../src/components/FullScreenImageViewerModal';
import { KnowledgeGraphModal } from '../../src/components/KnowledgeGraphModal';
import { CyberTheme } from '../../src/theme/cyberLuxury';

LogBox.ignoreLogs(['Due to changes in Androids permission requirements']);

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_COUNT = 4;
const INDICATOR_WIDTH = 24;
const SLIDE_DISTANCE = SCREEN_WIDTH * 0.25;

// Directional slide: screens slide left/right with fade
function forDirectionalSlide({ current }: { current: { progress: any } }) {
  return {
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 0],
      }),
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-SLIDE_DISTANCE, 0, SLIDE_DISTANCE],
          }),
        },
      ],
    },
  };
}

const TAB_META = [
  { label: 'Memories', icon: LayoutGrid },
  { label: 'Discovery', icon: Sparkles },
  { label: 'Serendipity', icon: RotateCcw },
  { label: 'Spaces', icon: Folder },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const indicatorX = useSharedValue(0);
  const tabWidth = SCREEN_WIDTH / TAB_COUNT;

  useEffect(() => {
    indicatorX.value = withSpring(
      state.index * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2,
      { damping: 18, stiffness: 220, mass: 0.6 },
    );
  }, [state.index, tabWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={tabStyles.bar}>
      <Animated.View style={[tabStyles.indicator, indicatorStyle]} />
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const meta = TAB_META[index];
        const IconComp = meta.icon;

        return (
          <Pressable
            key={route.key}
            style={tabStyles.tab}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          >
            <IconComp
              size={20}
              color={focused ? CyberTheme.colors.accentLight : '#64748B'}
            />
            <Text
              style={[
                tabStyles.label,
                { color: focused ? '#F8FAFC' : '#64748B' },
                focused && tabStyles.labelActive,
              ]}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#101114',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    height: 64,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelActive: {
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: INDICATOR_WIDTH,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: CyberTheme.colors.accent,
  },
});

export default function TabLayout() {
  const { loadStoredMemories } = useMemoryStore();

  useEffect(() => {
    loadStoredMemories();
  }, [loadStoredMemories]);

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyleInterpolator: forDirectionalSlide,
          transitionSpec: {
            animation: 'timing',
            config: { duration: 220 },
          },
          sceneStyle: { backgroundColor: '#0A0B0E' },
        }}
      >
        <Tabs.Screen name="feed" options={{ title: 'Memory Feed' }} />
        <Tabs.Screen name="discover" options={{ title: 'Discovery' }} />
        <Tabs.Screen name="serendipity" options={{ title: 'Serendipity' }} />
        <Tabs.Screen name="spaces" options={{ title: 'Spaces' }} />
      </Tabs>
      <MemoryDetailModal />
      <FullScreenImageViewerModal />
      <KnowledgeGraphModal />
    </>
  );
}
