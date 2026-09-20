import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  BackHandler,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Sparkles, ArrowRight, ZoomIn, ZoomOut, RotateCcw } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import { MemoryItem } from '../types/mindmesh';
import { CyberTheme } from '../theme/cyberLuxury';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GraphNode {
  id: string;
  memory: MemoryItem;
  x: number;
  y: number;
  radius: number;
  color: string;
  label: string;
}

interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
}

export const KnowledgeGraphModal: React.FC = () => {
  const {
    isKnowledgeGraphVisible,
    closeKnowledgeGraph,
    memories,
    connections,
    openMemoryDetail,
  } = useMemoryStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState<string>('All');
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // 360° Freeform Drag & Pinch Zoom Engine
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isDraggingRef = useRef(false);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1.0);
  const currentZoomRef = useRef<number>(1.0);

  useEffect(() => {
    currentZoomRef.current = zoomScale;
  }, [zoomScale]);

  const graphPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isMultiTouch = gestureState.numberActiveTouches === 2;
        const isDragging = Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
        return isMultiTouch || isDragging;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        const isMultiTouch = gestureState.numberActiveTouches === 2;
        const isDragging = Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8;
        return isMultiTouch || isDragging;
      },
      onPanResponderGrant: () => {
        isDraggingRef.current = false;
        initialPinchDistanceRef.current = null;
        pan.setOffset({
          x: (pan.x as any)._value || 0,
          y: (pan.y as any)._value || 0,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length === 2) {
          isDraggingRef.current = true;
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (initialPinchDistanceRef.current === null) {
            initialPinchDistanceRef.current = distance;
            initialZoomRef.current = currentZoomRef.current;
          } else {
            const factor = distance / initialPinchDistanceRef.current;
            const newScale = Math.max(0.3, Math.min(3.0, initialZoomRef.current * factor));
            setZoomScale(newScale);
          }
        } else {
          initialPinchDistanceRef.current = null;
          if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
            isDraggingRef.current = true;
          }
          pan.x.setValue(gestureState.dx);
          pan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        initialPinchDistanceRef.current = null;
        pan.flattenOffset();
      },
    })
  ).current;

  const resetCanvasView = () => {
    pan.setValue({ x: 0, y: 0 });
    pan.setOffset({ x: 0, y: 0 });
    setZoomScale(1.0);
  };

  // Available spaces for filtering nodes
  const availableSpaces = useMemo(() => {
    const spaces = new Set<string>();
    memories.forEach((m) => {
      if (m.contextSpace) spaces.add(m.contextSpace);
    });
    return ['All', ...Array.from(spaces)];
  }, [memories]);

  // Filter memories by selected space
  const filteredMemories = useMemo(() => {
    if (selectedSpaceFilter === 'All') return memories;
    return memories.filter((m) => m.contextSpace === selectedSpaceFilter);
  }, [memories, selectedSpaceFilter]);

  // Generate Node layout in a golden spiral distribution
  const { nodes, edges } = useMemo(() => {
    const CANVAS_CENTER_X = SCREEN_WIDTH * 0.5;
    const CANVAS_CENTER_Y = SCREEN_HEIGHT * 0.4;

    const nodesList: GraphNode[] = [];
    const edgesList: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'image':
          return '#38BDF8'; // Sky blue
        case 'text':
        case 'quote':
          return '#F59E0B'; // Amber
        case 'bookmark':
        case 'article':
          return '#10B981'; // Emerald
        case 'video':
          return '#EC4899'; // Pink
        case 'voice':
          return '#8B5CF6'; // Purple
        default:
          return '#CBD5E1'; // Slate
      }
    };

    filteredMemories.forEach((mem, idx) => {
      const angle = idx * 137.5 * (Math.PI / 180);
      const radius = Math.sqrt(idx + 1) * 75;

      const x = CANVAS_CENTER_X + radius * Math.cos(angle);
      const y = CANVAS_CENTER_Y + radius * Math.sin(angle);

      const node: GraphNode = {
        id: mem.id,
        memory: mem,
        x,
        y,
        radius: mem.imageUrl ? 28 : 22,
        color: getTypeColor(mem.type),
        label: mem.title || 'Thought',
      };

      nodesList.push(node);
      nodeMap.set(mem.id, node);
    });

    // 1. Add edges for AI Discovered Connections
    connections.forEach((conn) => {
      const source = nodeMap.get(conn.sourceMemoryId);
      const target = nodeMap.get(conn.targetMemoryId);
      if (source && target) {
        edgesList.push({
          id: conn.id,
          sourceId: source.id,
          targetId: target.id,
          x1: source.x,
          y1: source.y,
          x2: target.x,
          y2: target.y,
          label: conn.title,
        });
      }
    });

    // 2. Add edges for shared tags / space relationships
    for (let i = 0; i < nodesList.length; i++) {
      for (let j = i + 1; j < nodesList.length; j++) {
        const n1 = nodesList[i];
        const n2 = nodesList[j];

        const hasSharedTag = n1.memory.tags.some((t) => n2.memory.tags.includes(t));
        const hasSharedSpace = n1.memory.contextSpace && n1.memory.contextSpace === n2.memory.contextSpace;

        if ((hasSharedTag || hasSharedSpace) && edgesList.length < 35) {
          const edgeExists = edgesList.some(
            (e) => (e.sourceId === n1.id && e.targetId === n2.id) || (e.sourceId === n2.id && e.targetId === n1.id)
          );

          if (!edgeExists) {
            edgesList.push({
              id: `edge-${n1.id}-${n2.id}`,
              sourceId: n1.id,
              targetId: n2.id,
              x1: n1.x,
              y1: n1.y,
              x2: n2.x,
              y2: n2.y,
            });
          }
        }
      }
    }

    return { nodes: nodesList, edges: edgesList };
  }, [filteredMemories, connections]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!isKnowledgeGraphVisible) return null;

  return (
    <Modal
      visible={isKnowledgeGraphVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={closeKnowledgeGraph}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Control Bar */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerBadge}>
              <Sparkles size={14} color="#94A3B8" />
              <Text style={styles.headerBadgeText}>Mind Vault Graph</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeKnowledgeGraph}>
              <X size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSub}>
            Fluid 360° network map of your {filteredMemories.length} thoughts.
          </Text>

          {/* Space Filter Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {availableSpaces.map((sp) => {
              const isSelected = selectedSpaceFilter === sp;
              return (
                <TouchableOpacity
                  key={sp}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setSelectedSpaceFilter(sp)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                    {sp === 'All' ? 'All Spaces' : `#${sp}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 360° Freeform Touch Drag & Zoom Graph Canvas */}
        <View style={styles.canvasWrapper} {...graphPanResponder.panHandlers}>
          <Animated.View
            style={[
              styles.graphCanvas,
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale: zoomScale },
                ],
              },
            ]}
          >
            {/* Render Graph Connection Lines */}
            {edges.map((edge) => {
              const isConnectedToSelected =
                selectedNodeId && (edge.sourceId === selectedNodeId || edge.targetId === selectedNodeId);

              const dx = edge.x2 - edge.x1;
              const dy = edge.y2 - edge.y1;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);

              return (
                <View
                  key={edge.id}
                  style={{
                    position: 'absolute',
                    left: edge.x1,
                    top: edge.y1,
                    width: distance,
                    height: isConnectedToSelected ? 2 : 1,
                    backgroundColor: isConnectedToSelected
                      ? '#38BDF8'
                      : 'rgba(255, 255, 255, 0.08)',
                    transformOrigin: '0% 50%',
                    transform: [{ rotate: `${angle}deg` }],
                    zIndex: isConnectedToSelected ? 2 : 1,
                  }}
                />
              );
            })}

            {/* Render Memory Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnected =
                selectedNodeId &&
                edges.some(
                  (e) =>
                    (e.sourceId === selectedNodeId && e.targetId === node.id) ||
                    (e.targetId === selectedNodeId && e.sourceId === node.id)
                );

              return (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeCircle,
                    {
                      left: node.x - node.radius,
                      top: node.y - node.radius,
                      width: node.radius * 2,
                      height: node.radius * 2,
                      borderRadius: node.radius,
                      backgroundColor: isSelected ? '#38BDF8' : node.color,
                      borderColor: isSelected ? '#FFFFFF' : isConnected ? '#38BDF8' : 'rgba(255, 255, 255, 0.25)',
                      borderWidth: isSelected ? 3 : 1.5,
                      transform: [{ scale: isSelected ? 1.25 : 1 }],
                    },
                  ]}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  onPress={() => {
                    CyberTheme.haptics.light();
                    setSelectedNodeId(isSelected ? null : node.id);
                  }}
                  activeOpacity={0.7}
                >
                  {node.memory.imageUrl ? (
                    <Image
                      source={{ uri: node.memory.imageUrl }}
                      style={[styles.nodeImage, { borderRadius: node.radius - 2 }]}
                    />
                  ) : null}

                  {/* Node Title Overlay Pill */}
                  <View style={[styles.nodeLabelPill, isSelected && styles.nodeLabelPillActive]}>
                    <Text style={[styles.nodeLabelText, isSelected && styles.nodeLabelTextActive]} numberOfLines={1}>
                      {node.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>

          {/* Floating Zoom & Pan Reset Controls */}
          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => setZoomScale((s) => Math.min(2.5, s + 0.25))}
            >
              <ZoomIn size={16} color="#CBD5E1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={resetCanvasView}
            >
              <RotateCcw size={14} color="#CBD5E1" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => setZoomScale((s) => Math.max(0.4, s - 0.25))}
            >
              <ZoomOut size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Thought Detail Banner Dock */}
        {selectedNode ? (
          <View style={styles.bottomDock}>
            <View style={styles.selectedBanner}>
              {selectedNode.memory.imageUrl ? (
                <Image source={{ uri: selectedNode.memory.imageUrl }} style={styles.bannerImage} />
              ) : null}
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {selectedNode.memory.title || 'Selected Thought'}
                </Text>
                <Text style={styles.bannerSub} numberOfLines={1}>
                  #{selectedNode.memory.contextSpace || 'Space'} • {selectedNode.memory.tags.join(', ')}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.openDetailBtn}
                onPress={() => {
                  CyberTheme.haptics.medium();
                  openMemoryDetail(selectedNode.memory);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.openDetailBtnText}>Inspect Thought</Text>
                <ArrowRight size={14} color="#101114" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.bottomHintDock}>
            <Text style={styles.bottomHintText}>
              💡 Drag in any direction to explore • Tap nodes to inspect thoughts
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 6,
    zIndex: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  filterChipActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F8FAFC',
  },
  filterChipText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#101114',
    fontWeight: '600',
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#0A0B0E',
    overflow: 'hidden',
  },
  graphCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
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
  zoomControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#16181F',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  zoomBtn: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  bottomDock: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#101114',
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  bannerImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  bannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  openDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openDetailBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#101114',
  },
  bottomHintDock: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#101114',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  bottomHintText: {
    fontSize: 11,
    color: '#64748B',
  },
});
