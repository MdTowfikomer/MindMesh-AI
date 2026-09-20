import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FluidFieldBackground } from './FluidFieldBackground';

interface SynapticFusionProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const SynapticFusion: React.FC<SynapticFusionProps> = ({ isVisible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* 1. Live WebGL Fluid Field Shader Background */}
      <FluidFieldBackground style={StyleSheet.absoluteFill} />

      {/* 2. Dark Vignette for Text Legibility & Depth */}
      <LinearGradient
        colors={['rgba(3, 3, 6, 0.6)', 'transparent', 'rgba(3, 3, 6, 0.8)']}
        locations={[0, 0.5, 1.0]}
        style={StyleSheet.absoluteFill as any}
        pointerEvents="none"
      />

      {/* 3. Serendipity Discovery Content */}
      <View style={styles.contentWrapper} pointerEvents="none">
        <Text style={styles.tagHeader}>SYNTHESIZING MEMORIES</Text>

        <Text style={styles.heroHeadline}>
          Connecting the dots{'\n'}across your mind
        </Text>

        <Text style={styles.bodySubtitle}>
          Uncovering hidden relationships across your saved thoughts, screenshots, and links to spark new ideas.
        </Text>

        {/* Translucent Frosted Loading Capsule */}
        <View style={styles.loadingPill}>
          <ActivityIndicator size="small" color="#00E5FF" />
          <Text style={styles.loadingPillText}>DISCOVERING CONNECTIONS...</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030306',
  },

  contentWrapper: {
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    maxWidth: 420,
    zIndex: 10,
  },
  tagHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(215, 220, 245, 0.75)',
    letterSpacing: 2.2,
    textAlign: 'center',
  },
  heroHeadline: {
    fontSize: 34,
    fontFamily: 'serif',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 42,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  bodySubtitle: {
    fontSize: 14,
    color: 'rgba(235, 240, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  loadingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  loadingPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
