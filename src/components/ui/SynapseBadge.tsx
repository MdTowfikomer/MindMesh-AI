import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CyberTheme } from '../../theme/cyberLuxury';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SynapseBadgeProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  color?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const SynapseBadge: React.FC<SynapseBadgeProps> = ({
  label,
  icon,
  active = false,
  onPress,
  color = CyberTheme.colors.cyan,
  size = 'md',
  style,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!onPress) return;
    CyberTheme.haptics.light();
    scale.value = withSpring(0.92, CyberTheme.springs.snappy);
  };

  const handlePressOut = () => {
    if (!onPress) return;
    scale.value = withSpring(1, CyberTheme.springs.snappy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isSmall = size === 'sm';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      style={[
        styles.wrapper,
        active && {
          shadowColor: color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
        animatedStyle,
      ]}
    >
      {active ? (
        <LinearGradient
          colors={[color, CyberTheme.colors.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.badgeContainer, isSmall && styles.badgeContainerSmall]}
        >
          {icon && <View style={styles.iconMargin}>{icon}</View>}
          <Text style={[styles.label, styles.activeLabel, isSmall && styles.labelSmall]}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.badgeContainer,
            styles.inactiveBadge,
            isSmall && styles.badgeContainerSmall,
          ]}
        >
          {icon && <View style={styles.iconMargin}>{icon}</View>}
          <Text style={[styles.label, styles.inactiveLabel, isSmall && styles.labelSmall]}>
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: CyberTheme.radii.full,
  },
  badgeContainerSmall: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  inactiveBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconMargin: {
    marginRight: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '700',
  },
  activeLabel: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inactiveLabel: {
    color: CyberTheme.colors.textSecondary,
  },
});
