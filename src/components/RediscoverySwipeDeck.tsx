import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MemoryItem } from '../types/mindmesh';
import { Trash2, CheckCircle2, RefreshCw } from './Icons';
import { SoundEffects } from '../services/soundEffects';
import { CrumpleWasteBin } from './CrumpleWasteBin';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
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
  const [wadCount, setWadCount] = useState(0);
  const [binVisible, setBinVisible] = useState(false);
  const [isCrumpling, setIsCrumpling] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const crumpleScale = useRef(new Animated.Value(1)).current;
  const crumpleRotate = useRef(new Animated.Value(0)).current;
  const crumpleY = useRef(new Animated.Value(0)).current;
  const binTimeoutRef = useRef<any>(null);

  const currentMemory = memories[currentIndex];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isCrumpling,
      onPanResponderMove: (_, gestureState) => {
        if (!isCrumpling) {
          position.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isCrumpling) return;
        if (gestureState.dx > SWIPE_THRESHOLD) {
          handleKeep();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          handleCrumpleDelete();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const handleKeep = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 120, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      const item = memories[currentIndex];
      onKeepMemory(item);
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) => prev + 1);
      setReviewedCount((prev) => prev + 1);
    });
  };

  const handleCrumpleDelete = () => {
    if (isCrumpling || !currentMemory) return;
    setIsCrumpling(true);

    // 1. Play paper crumple crunch sound & haptics
    SoundEffects.playCrumpleSound();

    // 2. Show Wire-Mesh waste bin
    setBinVisible(true);
    if (binTimeoutRef.current) clearTimeout(binTimeoutRef.current);

    // 3. Physical Paper Crumple Animation (Card shrinks into paper wad and falls into bin)
    Animated.parallel([
      Animated.timing(crumpleScale, {
        toValue: 0.12,
        duration: 380,
        useNativeDriver: false,
      }),
      Animated.timing(crumpleRotate, {
        toValue: 1,
        duration: 380,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(crumpleY, {
          toValue: -30, // slight upward toss
          duration: 120,
          useNativeDriver: false,
        }),
        Animated.timing(crumpleY, {
          toValue: 260, // drops into wire mesh bin
          duration: 260,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      const item = memories[currentIndex];
      onTrashMemory(item);

      // Increment wads in waste bin
      setWadCount((prev) => prev + 1);
      setReviewedCount((prev) => prev + 1);

      // Reset animation values for next card
      crumpleScale.setValue(1);
      crumpleRotate.setValue(0);
      crumpleY.setValue(0);
      position.setValue({ x: 0, y: 0 });
      setIsCrumpling(false);
      setCurrentIndex((prev) => prev + 1);

      // Sink bin away after 2.2 seconds of inactivity
      binTimeoutRef.current = setTimeout(() => {
        setBinVisible(false);
      }, 2200);
    });
  };

  const rotateInterpolation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  const crumpleRotateInterpolation = crumpleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

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
        <CheckCircle2 size={44} color="#10B981" />
        <Text style={styles.completedTitle}>All Caught Up!</Text>
        <Text style={styles.completedSub}>
          You reviewed {reviewedCount} memories. Your mind space is organized and focused.
        </Text>
        <TouchableOpacity
          style={styles.restartBtn}
          onPress={() => {
            setCurrentIndex(0);
            setWadCount(0);
          }}
          activeOpacity={0.85}
        >
          <RefreshCw size={14} color="#FFF" />
          <Text style={styles.restartBtnText}>Review Deck Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.deckContainer}>
      {/* Top Deck Stats Header */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>REDISCOVERY DECK</Text>
        <Text style={styles.counterBadge}>
          {currentIndex + 1} of {memories.length}
        </Text>
      </View>

      {/* Card Stack Container */}
      <View style={styles.cardStackWrapper}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: isCrumpling ? crumpleY : position.y },
                { rotate: isCrumpling ? crumpleRotateInterpolation : rotateInterpolation },
                { scale: crumpleScale },
              ],
              borderRadius: isCrumpling ? 40 : 16,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Swipe Indicator Badges */}
          <Animated.View style={[styles.overlayBadge, styles.keepBadge, { opacity: keepOpacity }]}>
            <CheckCircle2 size={18} color="#10B981" />
            <Text style={styles.keepBadgeText}>KEEP</Text>
          </Animated.View>

          <Animated.View style={[styles.overlayBadge, styles.trashBadge, { opacity: trashOpacity }]}>
            <Trash2 size={18} color="#E11D48" />
            <Text style={styles.trashBadgeText}>CRUMPLE</Text>
          </Animated.View>

          {/* Card Hero Preview */}
          {currentMemory.imageUrl ? (
            <View style={styles.cardMediaBox}>
              <Image source={{ uri: currentMemory.imageUrl }} style={styles.cardImage} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.cardQuoteBox}>
              <Text style={styles.cardQuoteMarkTop}>“</Text>
              <Text style={styles.cardQuoteContent} numberOfLines={8}>
                {currentMemory.content || currentMemory.ocrText || 'Captured thought'}
              </Text>
              <Text style={styles.cardQuoteMarkBottom}>”</Text>
            </View>
          )}

          {/* Card Footer Details */}
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {currentMemory.title || 'Untitled Memory'}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.cardMeta}>
                #{currentMemory.contextSpace}
              </Text>
              <Text style={styles.cardMetaDot}>•</Text>
              <Text style={styles.cardMeta}>
                {new Date(currentMemory.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Swipe Action Buttons */}
      <View style={styles.actionButtonsRow}>
        {/* Crumple Delete Button (Left) */}
        <TouchableOpacity
          style={[styles.actionCircleBtn, styles.trashCircleBtn]}
          onPress={handleCrumpleDelete}
          disabled={isCrumpling}
          activeOpacity={0.8}
        >
          <Trash2 size={22} color="#E11D48" />
        </TouchableOpacity>

        {/* Keep Button (Right) */}
        <TouchableOpacity
          style={[styles.actionCircleBtn, styles.keepCircleBtn]}
          onPress={handleKeep}
          disabled={isCrumpling}
          activeOpacity={0.8}
        >
          <CheckCircle2 size={24} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Rising Wire-Mesh Waste Bin Animation Overlay */}
      <CrumpleWasteBin binVisible={binVisible} wadCount={wadCount} />
    </View>
  );
};

const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  counterBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  cardStackWrapper: {
    flex: 1,
    maxHeight: 440,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#181A20',
    borderRadius: 16,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  overlayBadge: {
    position: 'absolute',
    top: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  keepBadge: {
    right: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  keepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  trashBadge: {
    left: 16,
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderColor: '#E11D48',
  },
  trashBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  cardMediaBox: {
    flex: 1,
    backgroundColor: '#131418',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardQuoteBox: {
    flex: 1,
    backgroundColor: '#181A20',
    padding: 24,
    justifyContent: 'center',
  },
  cardQuoteMarkTop: {
    fontSize: 32,
    fontFamily: 'serif',
    color: '#64748B',
    lineHeight: 32,
  },
  cardQuoteContent: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#F8FAFC',
    lineHeight: 24,
    marginVertical: 4,
    fontStyle: 'italic',
  },
  cardQuoteMarkBottom: {
    fontSize: 32,
    fontFamily: 'serif',
    color: '#64748B',
    lineHeight: 32,
    textAlign: 'right',
  },
  cardDetails: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    backgroundColor: '#141519',
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMeta: {
    fontSize: 11,
    color: '#64748B',
  },
  cardMetaDot: {
    fontSize: 11,
    color: '#64748B',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingVertical: 8,
  },
  actionCircleBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderWidth: 1,
  },
  trashCircleBtn: {
    borderColor: 'rgba(225, 29, 72, 0.3)',
    backgroundColor: 'rgba(225, 29, 72, 0.06)',
  },
  keepCircleBtn: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  completedSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#252832',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  restartBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
