import React, { useCallback, useEffect } from 'react';
import { Text, Image, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MemoryItem, NodePosition } from '../../types/mindmesh';
import { CyberTheme } from '../../theme/cyberLuxury';
import { GRAPH_CONFIG } from '../../config/graphConfig';

export interface GraphNodeData {
  id: string;
  memory: MemoryItem;
  x: number;
  y: number;
  radius: number;
  color: string;
  label: string;
}

interface GraphNodeComponentProps {
  node: GraphNodeData;
  isSelected: boolean;
  isConnected: boolean;
  isSearchMatched?: boolean;
  zoomScale: number;
  onSelectNode: (id: string) => void;
  onDragEnd: (id: string, pos: NodePosition) => void;
  onDragMove: (id: string, pos: NodePosition) => void;
}

const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };

export const GraphNodeComponent: React.FC<GraphNodeComponentProps> = React.memo(
  ({
    node,
    isSelected,
    isConnected,
    isSearchMatched = false,
    zoomScale,
    onSelectNode,
    onDragEnd,
    onDragMove,
  }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const nodeScale = useSharedValue(1);
    const isDragging = useSharedValue(false);

    // Floating tooltip animation
    const tooltipOpacity = useSharedValue(0);
    const tooltipScale = useSharedValue(0.7);

    useEffect(() => {
      if (isSelected) {
        tooltipOpacity.value = withSpring(1, { damping: 12, stiffness: 350, mass: 0.5 });
        tooltipScale.value = withSpring(1, { damping: 12, stiffness: 350, mass: 0.5 });
      } else {
        tooltipOpacity.value = withTiming(0, { duration: 120 });
        tooltipScale.value = withTiming(0.85, { duration: 120 });
      }
    }, [isSelected, tooltipOpacity, tooltipScale]);

    const tooltipAnimStyle = useAnimatedStyle(() => ({
      opacity: tooltipOpacity.value,
      transform: [{ scale: tooltipScale.value }],
    }));

    const fireSelect = useCallback(() => {
      CyberTheme.haptics.light();
      onSelectNode(node.id);
    }, [node.id, onSelectNode]);

    const fireMove = useCallback(
      (x: number, y: number) => {
        onDragMove(node.id, { x, y });
      },
      [node.id, onDragMove],
    );

    const fireDragEnd = useCallback(
      (x: number, y: number) => {
        onDragEnd(node.id, { x, y });
      },
      [node.id, onDragEnd],
    );

    const panGesture = Gesture.Pan()
      .maxPointers(1)
      .minDistance(GRAPH_CONFIG.TAP_DRAG_THRESHOLD)
      .onStart(() => {
        isDragging.value = true;
        nodeScale.value = withSpring(1.18, SPRING_CONFIG);
      })
      .onUpdate((e) => {
        const s = zoomScale || 1;
        translateX.value = e.translationX / s;
        translateY.value = e.translationY / s;
        const newX = node.x + translateX.value;
        const newY = node.y + translateY.value;
        runOnJS(fireMove)(newX, newY);
      })
      .onEnd(() => {
        nodeScale.value = withSpring(1, SPRING_CONFIG);
        const finalX = node.x + translateX.value;
        const finalY = node.y + translateY.value;
        runOnJS(fireDragEnd)(finalX, finalY);
        translateX.value = 0;
        translateY.value = 0;
        isDragging.value = false;
      });

    const tapGesture = Gesture.Tap().onEnd(() => {
      runOnJS(fireSelect)();
    });

    const composed = Gesture.Race(panGesture, tapGesture);

    const animatedNodeStyle = useAnimatedStyle(() => {
      const baseScale = isSelected ? 1.25 : isSearchMatched ? 1.15 : 1;
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: baseScale * nodeScale.value },
        ],
        zIndex: isDragging.value ? 100 : isSelected ? 10 : isSearchMatched ? 8 : 5,
      };
    });

    const memoryType = node.memory.type.charAt(0).toUpperCase() + node.memory.type.slice(1);

    return (
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            styles.nodeCircle,
            {
              left: node.x - node.radius,
              top: node.y - node.radius,
              width: node.radius * 2,
              height: node.radius * 2,
              borderRadius: node.radius,
              backgroundColor: isSelected ? '#38BDF8' : node.color,
              borderColor: isSelected
                ? '#FFFFFF'
                : isConnected || isSearchMatched
                ? '#38BDF8'
                : 'rgba(255, 255, 255, 0.25)',
              borderWidth: isSelected ? 3 : isSearchMatched ? 2.5 : 1.5,
            },
            animatedNodeStyle,
          ]}
        >
          {node.memory.imageUrl ? (
            <Image
              source={{ uri: node.memory.imageUrl }}
              style={[styles.nodeImage, { borderRadius: node.radius - 2 }]}
            />
          ) : null}

          {/* Default small label pill (always visible) */}
          <Animated.View style={[styles.nodeLabelPill, isSelected && styles.nodeLabelPillActive]}>
            <Text
              style={[styles.nodeLabelText, isSelected && styles.nodeLabelTextActive]}
              numberOfLines={1}
            >
              {node.label}
            </Text>
          </Animated.View>

          {/* Floating tooltip card on selection (Obsidian-style) */}
          <Animated.View
            style={[styles.tooltipCard, tooltipAnimStyle]}
            pointerEvents="none"
          >
            <View style={styles.tooltipBadge}>
              <View style={[styles.tooltipDot, { backgroundColor: node.color }]} />
              <Text style={styles.tooltipType}>{memoryType}</Text>
            </View>
            <Text style={styles.tooltipTitle} numberOfLines={2}>
              {node.memory.title || 'Untitled'}
            </Text>
            {node.memory.tags.length > 0 && (
              <Text style={styles.tooltipTags} numberOfLines={1}>
                {node.memory.tags.map((t) => `#${t}`).join(' ')}
              </Text>
            )}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    );
  },
);

GraphNodeComponent.displayName = 'GraphNodeComponent';

const styles = StyleSheet.create({
  nodeCircle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nodeImage: {
    width: '100%',
    height: '100%',
  },
  nodeLabelPill: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(16, 18, 24, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    maxWidth: 90,
  },
  nodeLabelPillActive: {
    backgroundColor: '#F8FAFC',
  },
  nodeLabelText: {
    fontSize: 9,
    color: '#CBD5E1',
  },
  nodeLabelTextActive: {
    color: '#101114',
    fontWeight: '600',
  },
  tooltipCard: {
    position: 'absolute',
    top: -(72),
    alignSelf: 'center',
    backgroundColor: '#181A20',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minWidth: 100,
    maxWidth: 160,
    gap: 3,
  },
  tooltipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tooltipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tooltipType: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  tooltipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
    lineHeight: 16,
  },
  tooltipTags: {
    fontSize: 10,
    color: '#64748B',
  },
});
