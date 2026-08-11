import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { theme } from '../theme/tokens';
import { Sparkles, Zap } from './Icons';

interface SynapticFusionProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const SynapticFusion: React.FC<SynapticFusionProps> = ({ isVisible, onAnimationComplete }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const particleRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(particleRotate, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
      ]).start(() => {
        if (onAnimationComplete) onAnimationComplete();
      });
    } else {
      pulseAnim.setValue(0);
      scaleAnim.setValue(0.7);
      particleRotate.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const rotate = particleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View style={[styles.darkPortalOverlay, { opacity }]}>
      {/* Radiant Dark Portal Card */}
      <Animated.View style={[styles.fusionPortalCard, { transform: [{ scale: scaleAnim }] }]}>
        {/* Neon Particle Threads */}
        <Animated.View style={[styles.particleRing, { transform: [{ rotate }] }]}>
          <View style={styles.neonParticle1} />
          <View style={styles.neonParticle2} />
          <View style={styles.neonParticle3} />
        </Animated.View>

        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Sparkles size={36} color="#C084FC" />
          </Animated.View>
        </View>
        
        <View style={styles.textColumn}>
          <View style={styles.badgeRow}>
            <Zap size={12} color="#38BDF8" />
            <Text style={styles.fusionTitle}>SYNAPTIC FUSION REVEAL</Text>
          </View>
          <Text style={styles.fusionSub}>
            Physically converging connected thoughts into executable Build Plans...
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  darkPortalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 10, 16, 0.95)', // Deep obsidian dark portal backdrop
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  fusionPortalCard: {
    backgroundColor: '#111827',
    borderColor: '#8B5CF6',
    borderWidth: 1.5,
    borderRadius: theme.radii.lg,
    paddingHorizontal: 24,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    maxWidth: '88%',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  particleRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    left: -50,
  },
  neonParticle1: {
    position: 'absolute',
    top: 20,
    left: 40,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C084FC',
    shadowColor: '#C084FC',
    shadowRadius: 10,
    shadowOpacity: 0.9,
  },
  neonParticle2: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowRadius: 8,
    shadowOpacity: 0.9,
  },
  neonParticle3: {
    position: 'absolute',
    top: 90,
    right: 20,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
    shadowRadius: 8,
    shadowOpacity: 0.9,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fusionTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#C084FC',
    letterSpacing: 1.2,
  },
  fusionSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
});
