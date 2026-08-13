import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../theme/tokens';
import { Compass } from './Icons';

export const SavingSkeletonCard: React.FC = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Continuous rotation for compass spinner
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse opacity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.95,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.skeletonContainer, { opacity: pulseValue }]}>
      <View style={styles.contentBox}>
        {/* Animated Compass Loader Icon */}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Compass size={24} color={theme.colors.auroraIndigo} />
        </Animated.View>

        {/* User Requested Copy */}
        <Text style={styles.savingTitle}>One moment.</Text>
        <Text style={styles.savingSubtitle}>I’m saving this for you.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#F8F8F7',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  contentBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  savingTitle: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  savingSubtitle: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
