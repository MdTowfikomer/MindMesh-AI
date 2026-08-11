import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { theme } from '../src/theme/tokens';
import { RevenueCatService } from '../src/services/revenuecat';
import { PaywallStory } from '../src/components/PaywallStory';
import { ShareSheetModal } from '../src/components/ShareSheetModal';
import { MemoryDetailModal } from '../src/components/MemoryDetailModal';

export default function RootLayout() {
  useEffect(() => {
    RevenueCatService.configure();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor={theme.colors.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>

      <PaywallStory />
      <ShareSheetModal />
      <MemoryDetailModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
});
