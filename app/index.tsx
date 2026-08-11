import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMemoryStore } from '../src/stores/memoryStore';
import { SerendipitySplash } from '../src/components/SerendipitySplash';

export default function IndexScreen() {
  const router = useRouter();
  const { isOnboardingCompleted } = useMemoryStore();

  const handleContinue = () => {
    if (!isOnboardingCompleted) {
      router.replace('/onboarding');
    } else {
      router.replace('/(tabs)/feed');
    }
  };

  return <SerendipitySplash onContinue={handleContinue} />;
}
