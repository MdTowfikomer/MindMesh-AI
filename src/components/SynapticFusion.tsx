import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SynapticFusionProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const SynapticFusion: React.FC<SynapticFusionProps> = ({ isVisible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const auraScaleAnim = useRef(new Animated.Value(1)).current;
  const auraRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Flowing swirl & breathing pulse loop
      pulseLoopRef.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(auraScaleAnim, {
              toValue: 1.12,
              duration: 2200,
              useNativeDriver: true,
            }),
            Animated.timing(auraScaleAnim, {
              toValue: 1,
              duration: 2200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(auraRotateAnim, {
              toValue: 1,
              duration: 4400,
              useNativeDriver: true,
            }),
            Animated.timing(auraRotateAnim, {
              toValue: 0,
              duration: 4400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoopRef.current.start();
    } else {
      if (pulseLoopRef.current) {
        pulseLoopRef.current.stop();
      }
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const rotateInterpolation = auraRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* 1. Base Gradient Canvas (Black Current #12142E to Clear Hanada #4C3894) */}
      <LinearGradient
        colors={['#090A14', '#12142E', '#251E4E', '#4C3894', '#6D5BB5']}
        locations={[0, 0.35, 0.6, 0.85, 1.0]}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 2. High-Res Flow Swirl Image Texture */}
      <Animated.Image
        source={require('../../assets/feralui_flow_gradient.png')}
        style={[
          styles.flowImageOverlay,
          {
            transform: [
              { scale: auraScaleAnim },
              { rotate: rotateInterpolation },
            ],
          },
        ]}
        resizeMode="cover"
      />

      {/* 3. Subtle Dark Vignette for Text Legibility */}
      <LinearGradient
        colors={['rgba(9, 10, 20, 0.75)', 'transparent', 'rgba(18, 20, 46, 0.4)']}
        locations={[0, 0.45, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 4. Serendipity Discovery Content */}
      <View style={styles.contentWrapper}>
        <Text style={styles.tagHeader}>SYNTHESIZING MEMORIES</Text>

        <Text style={styles.heroHeadline}>
          Connecting the dots{'\n'}across your mind
        </Text>

        <Text style={styles.bodySubtitle}>
          Uncovering hidden relationships across your saved thoughts, screenshots, and links to spark new ideas.
        </Text>

        {/* Translucent Frosted Loading Capsule */}
        <View style={styles.loadingPill}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingPillText}>DISCOVERING CONNECTIONS...</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#090A14',
  },
  flowImageOverlay: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_HEIGHT * 1.1,
    opacity: 0.85,
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
