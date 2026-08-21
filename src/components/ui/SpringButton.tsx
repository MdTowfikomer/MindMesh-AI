import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CyberTheme } from '../../theme/cyberLuxury';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface SpringButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'neon' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glowColor?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const SpringButton: React.FC<SpringButtonProps> = ({
  label,
  icon,
  onPress,
  variant = 'neon',
  size = 'md',
  glowColor = CyberTheme.colors.cyan,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled || loading) return;
    CyberTheme.haptics.light();
    scale.value = withSpring(0.94, CyberTheme.springs.snappy);
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, CyberTheme.springs.snappy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = {
    sm: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: CyberTheme.radii.sm, fontSize: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: CyberTheme.radii.md, fontSize: 14 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, borderRadius: CyberTheme.radii.lg, fontSize: 16 },
  }[size];

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="#FFFFFF" />;
    }

    return (
      <View style={styles.contentRow}>
        {icon && <View style={label ? styles.iconMargin : undefined}>{icon}</View>}
        {label && (
          <Text
            style={[
              styles.labelBase,
              { fontSize: sizeStyles.fontSize },
              variant === 'glass' && { color: CyberTheme.colors.textPrimary },
              variant === 'ghost' && { color: CyberTheme.colors.textSecondary },
              variant === 'danger' && { color: CyberTheme.colors.rose },
              textStyle,
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    );
  };

  const isGradient = variant === 'primary' || variant === 'neon';
  const gradientColors = variant === 'neon'
    ? CyberTheme.colors.gradients.neural
    : CyberTheme.colors.gradients.cyber;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.wrapper,
        fullWidth && styles.fullWidth,
        isGradient && {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 5,
        },
        style,
        animatedStyle,
      ]}
    >
      {isGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.innerContainer,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
            },
          ]}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.innerContainer,
            variant === 'glass' && styles.glassVariant,
            variant === 'ghost' && styles.ghostVariant,
            variant === 'danger' && styles.dangerVariant,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
            },
          ]}
        >
          {renderContent()}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMargin: {
    marginRight: 8,
  },
  labelBase: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  glassVariant: {
    backgroundColor: CyberTheme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: CyberTheme.colors.borderLight,
  },
  ghostVariant: {
    backgroundColor: 'transparent',
  },
  dangerVariant: {
    backgroundColor: 'rgba(255, 0, 127, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 127, 0.3)',
  },
});
