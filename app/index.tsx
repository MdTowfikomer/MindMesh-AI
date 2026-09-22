import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemoryStore } from '../src/stores/memoryStore';

export default function RootIndex() {
  const router = useRouter();
  const { isOnboardingCompleted, loadStoredMemories } = useMemoryStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadStoredMemories().then(() => setReady(true));
  }, [loadStoredMemories]);

  useEffect(() => {
    if (!ready) return;
    if (isOnboardingCompleted) {
      router.replace('/(tabs)/feed');
    } else {
      router.replace('/onboarding');
    }
  }, [ready, isOnboardingCompleted, router]);

  return (
    <View style={styles.splash}>
      <ActivityIndicator size="small" color="#8B1A2B" />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0A0B0E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
