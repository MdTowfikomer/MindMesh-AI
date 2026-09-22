import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useMemoryStore } from '../src/stores/memoryStore';

export default function RootIndex() {
  const { isOnboardingCompleted, loadStoredMemories } = useMemoryStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadStoredMemories().then(() => setReady(true));
  }, [loadStoredMemories]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="small" color="#8B1A2B" />
      </View>
    );
  }

  if (isOnboardingCompleted) {
    return <Redirect href="/(tabs)/feed" />;
  }

  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0A0B0E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
