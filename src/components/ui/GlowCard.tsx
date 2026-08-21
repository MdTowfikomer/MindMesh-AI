import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CyberTheme } from '../../theme/cyberLuxury';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlowCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  glowColor?: string;
  isGlowing?: boolean;
  borderRadius?: number;
  disabled?: boolean;
  borderGradients?: readonly [string, string, ...string[]];
}

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  style,
  contentStyle,
  onPress,
  onLongPress,
  glowColor = CyberTheme.colors.cyan,
  isGlowing = false,
  borderRadius = CyberTheme.radii.lg,
  disabled = false,
  borderGradients,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    CyberTheme.haptics.light();
    scale.value = withSpring(0.968, CyberTheme.springs.touchable);
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    scale.value = withSpring(1, CyberTheme.springs.touchable);
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeGradients = borderGradients || (isGlowing 
    ? [glowColor, CyberTheme.colors.violet, glowColor] 
    : [CyberTheme.colors.borderLight, CyberTheme.colors.border]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !onPress}
      style={[
        styles.wrapper,
        { borderRadius },
        isGlowing && {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 6,
        },
        style,
        animatedContainerStyle,
      ]}
    >
      {/* 1px Gradient Border Stroke */}
      <LinearGradient
        colors={activeGradients}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.borderStroke, { borderRadius }]}
      >
        {/* Frosted Glass Surface */}
        <BlurView
          intensity={CyberTheme.blur.intensity}
          tint="dark"
          style={[styles.glassSurface, { borderRadius: borderRadius - 1 }]}
        >
          <View style={[styles.innerContent, contentStyle]}>
            {children}
          </View>
        </BlurView>
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'visible',
  },
  borderStroke: {
    padding: 1, // 1px hairline border
    overflow: 'hidden',
  },
  glassSurface: {
    backgroundColor: CyberTheme.colors.surface,
    overflow: 'hidden',
  },
  innerContent: {
    padding: CyberTheme.spacing.md,
  },
});
