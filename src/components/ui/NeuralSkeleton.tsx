import React, { useEffect } from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { CyberTheme } from '../../theme/cyberLuxury';

interface NeuralSkeletonProps {
  style?: StyleProp<ViewStyle>;
  statusText?: string;
  height?: number;
}

export const NeuralSkeleton: React.FC<NeuralSkeletonProps> = ({
  style,
  statusText = '✨ Neural Gemini Synthesis...',
  height = 180,
}) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      -1,
      true
    );
  }, []);

  const animatedGlow = useAnimatedStyle(() => {
    const opacity = interpolate(pulse.value, [0, 1], [0.3, 0.85]);
    const scale = interpolate(pulse.value, [0, 1], [0.98, 1.01]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const animatedShimmer = useAnimatedStyle(() => {
    const translateX = interpolate(pulse.value, [0, 1], [-120, 120]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { height }, style]}>
      {/* Dynamic Ambient Back-Glow */}
      <Animated.View style={[styles.ambientGlow, animatedGlow]} />

      {/* 1px Glowing Border Frame */}
      <LinearGradient
        colors={CyberTheme.colors.gradients.glowCardBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <BlurView intensity={CyberTheme.blur.intensity} tint="dark" style={styles.glassInner}>
          {/* Shimmering Top Media Placeholder */}
          <View style={styles.mediaBox}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedShimmer]}>
              <LinearGradient
                colors={['rgba(157, 78, 221, 0.05)', 'rgba(0, 242, 254, 0.2)', 'rgba(157, 78, 221, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          {/* Shimmering Text Lines */}
          <View style={styles.textContainer}>
            <View style={[styles.line, { width: '85%' }]} />
            <View style={[styles.line, { width: '60%', height: 10 }]} />
          </View>

          {/* Synaptic AI Status Pill */}
          <View style={styles.statusRow}>
            <Animated.View style={[styles.statusDot, animatedGlow]} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: CyberTheme.radii.lg,
    overflow: 'visible',
  },
  ambientGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(157, 78, 221, 0.15)',
    borderRadius: CyberTheme.radii.lg,
    shadowColor: CyberTheme.colors.cyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  gradientBorder: {
    flex: 1,
    borderRadius: CyberTheme.radii.lg,
    padding: 1,
  },
  glassInner: {
    flex: 1,
    borderRadius: CyberTheme.radii.lg - 1,
    backgroundColor: CyberTheme.colors.surface,
    padding: CyberTheme.spacing.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  mediaBox: {
    height: 70,
    borderRadius: CyberTheme.radii.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  textContainer: {
    gap: 8,
  },
  line: {
    height: 14,
    borderRadius: CyberTheme.radii.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: CyberTheme.colors.cyan,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: CyberTheme.colors.cyan,
    letterSpacing: 0.3,
  },
});
