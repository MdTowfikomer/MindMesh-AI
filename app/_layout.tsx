import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { RevenueCatService } from '../src/services/revenuecat';

export default function RootLayout() {
  useEffect(() => {
    RevenueCatService.configure();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
        animationDuration: 250,
        contentStyle: { backgroundColor: '#0A0B0E' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="onboarding"
        options={{ animation: 'fade', gestureEnabled: false }}
      />
      <Stack.Screen
        name="paywall"
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
