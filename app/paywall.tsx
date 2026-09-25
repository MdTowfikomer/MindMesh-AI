import React, { useEffect } from 'react';
import { View } from 'react-native';
import { PaywallStory } from '../src/components/PaywallStory';
import { useMemoryStore } from '../src/stores/memoryStore';
import { useRouter } from 'expo-router';

export default function PaywallScreen() {
  const { openPaywall, isPaywallVisible } = useMemoryStore();
  const router = useRouter();

  useEffect(() => {
    openPaywall();
  }, [openPaywall]);

  useEffect(() => {
    if (!isPaywallVisible && router.canGoBack()) {
      router.back();
    }
  }, [isPaywallVisible, router]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0B0E' }}>
      <PaywallStory />
    </View>
  );
}
