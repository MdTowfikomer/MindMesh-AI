import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, Image, TouchableOpacity } from 'react-native';
import { MemoryItem } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { RotateCcw, Trash2, CheckCircle2, Sparkles, RefreshCw } from './Icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

interface RediscoverySwipeDeckProps {
  memories: MemoryItem[];
  onKeepMemory: (memory: MemoryItem) => void;
  onTrashMemory: (memory: MemoryItem) => void;
}

export const RediscoverySwipeDeck: React.FC<RediscoverySwipeDeckProps> = ({
  memories,
  onKeepMemory,
  onTrashMemory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  const currentMemory = memories[currentIndex];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const item = memories[currentIndex];
    if (direction === 'right') {
      onKeepMemory(item);
    } else {
      onTrashMemory(item);
    }
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
    setReviewedCount((prev) => prev + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const animatedCardStyle = {
    transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
  };

  const keepOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const trashOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (!currentMemory || currentIndex >= memories.length) {
    return (
      <View style={styles.completedContainer}>
        <Sparkles size={40} color={theme.colors.auroraEmerald} />
        <Text style={styles.completedTitle}>All Caught Up!</Text>
        <Text style={styles.completedSub}>
          You reviewed {reviewedCount} memories today. Your mind space is clean & focused.
        </Text>
        <TouchableOpacity style={styles.restartBtn} onPress={() => setCurrentIndex(0)}>
          <RefreshCw size={14} color="#FFF" />
          <Text style={styles.restartBtnText}>Review Deck Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.deckContainer}>
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>MYMIND REDISCOVERY DECK</Text>
        <Text style={styles.counterBadge}>{currentIndex + 1} / {memories.length}</Text>
      </View>

      <View style={styles.cardStackWrapper}>
        <Animated.View style={[styles.card, animatedCardStyle]} {...panResponder.panHandlers}>
          {/* Swipe Left / Right Overlay Badges */}
          <Animated.View style={[styles.overlayBadge, styles.keepBadge, { opacity: keepOpacity }]}>
            <CheckCircle2 size={20} color={theme.colors.auroraEmerald} />
            <Text style={styles.keepBadgeText}>KEEP IN MIND</Text>
          </Animated.View>

          <Animated.View style={[styles.overlayBadge, styles.trashBadge, { opacity: trashOpacity }]}>
            <Trash2 size={20} color={theme.colors.tagPricingText} />
            <Text style={styles.trashBadgeText}>MOVE TO TRASH</Text>
          </Animated.View>

          {/* Card Media Preview */}
          {currentMemory.imageUrl ? (
            <Image source={{ uri: currentMemory.imageUrl }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardQuoteMark}>“</Text>
              <Text style={styles.cardTextContent}>{currentMemory.content}</Text>
            </View>
          )}

          {/* Card Info Details */}
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle}>{currentMemory.title}</Text>
            <Text style={styles.cardMeta}>
              Captured on {new Date(currentMemory.createdAt).toLocaleDateString()} • {currentMemory.contextSpace}
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Swipe Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={[styles.actionCircleBtn, styles.trashCircleBtn]} onPress={() => forceSwipe('left')}>
          <Trash2 size={22} color={theme.colors.tagPricingText} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCircleBtn, styles.keepCircleBtn]} onPress={() => forceSwipe('right')}>
          <CheckCircle2 size={22} color={theme.colors.auroraEmerald} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  counterBadge: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.auroraPurple,
  },
  cardStackWrapper: {
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    borderColor: theme.colors.border,
    borderWidth: 1,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  overlayBadge: {
    position: 'absolute',
    top: 20,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
  },
  keepBadge: {
    left: 20,
    borderColor: theme.colors.auroraEmerald,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  keepBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.auroraEmerald,
  },
  trashBadge: {
    right: 20,
    borderColor: theme.colors.tagPricingText,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  trashBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.tagPricingText,
  },
  cardImage: {
    width: '100%',
    height: 250,
  },
  cardTextContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(109, 40, 217, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardQuoteMark: {
    fontFamily: theme.fonts.serif,
    fontSize: 32,
    color: theme.colors.textMuted,
    marginBottom: -10,
  },
  cardTextContent: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardDetails: {
    padding: 14,
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  cardMeta: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginTop: 8,
  },
  actionCircleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.card,
  },
  trashCircleBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  keepCircleBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
  },
  completedContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  completedTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  completedSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  restartBtn: {
    backgroundColor: theme.colors.auroraPurple,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  restartBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: '#FFF',
  },
});
