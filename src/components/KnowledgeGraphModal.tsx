import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import ReanimatedAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Sparkles, ArrowRight, ZoomIn, ZoomOut, RotateCcw, CheckSquare } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import { MemoryItem, NodePosition } from '../types/mindmesh';
import { CyberTheme } from '../theme/cyberLuxury';
import { GRAPH_CONFIG, getTypeColor } from '../config/graphConfig';
import { GraphNodeComponent, GraphNodeData } from './graph/GraphNodeComponent';
import { GraphEdgeComponent, GraphEdgeData } from './graph/GraphEdgeComponent';
import { GraphSearchOverlay } from './graph/GraphSearchOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INITIAL_PAN_X = -(GRAPH_CONFIG.CANVAS_SIZE - SCREEN_WIDTH) / 2;
const INITIAL_PAN_Y = -(GRAPH_CONFIG.CANVAS_SIZE - SCREEN_HEIGHT) / 2;

export const KnowledgeGraphModal: React.FC = () => {
  const {
    isKnowledgeGraphVisible,
    closeKnowledgeGraph,
    memories,
    connections,
    openMemoryDetail,
    graphNodePositions,
    updateGraphNodePosition,
    resetGraphNodePositions,
  } = useMemoryStore();

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [liveDragNodePositions, setLiveDragNodePositions] = useState<Record<string, NodePosition>>({});

  // Reanimated shared values for canvas pan & zoom
  const panX = useSharedValue(INITIAL_PAN_X);
  const panY = useSharedValue(INITIAL_PAN_Y);
  const scale = useSharedValue(1.0);
  const savedPanX = useSharedValue(INITIAL_PAN_X);
  const savedPanY = useSharedValue(INITIAL_PAN_Y);
  const savedScale = useSharedValue(1.0);
  // JS-side zoom for passing to child components
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  const syncZoom = useCallback((s: number) => setZoomScale(s), []);

  // Reset canvas view on initial open
  useEffect(() => {
    if (isKnowledgeGraphVisible) {
      resetCanvasView();
    }
  }, [isKnowledgeGraphVisible]);

  const resetCanvasView = useCallback(() => {
    panX.value = INITIAL_PAN_X;
    panY.value = INITIAL_PAN_Y;
    savedPanX.value = INITIAL_PAN_X;
    savedPanY.value = INITIAL_PAN_Y;
    scale.value = 1.0;
    savedScale.value = 1.0;
    setZoomScale(1.0);
    setSelectedNodeIds([]);
    setSearchQuery('');
  }, [panX, panY, savedPanX, savedPanY, scale, savedScale]);

  // Canvas gestures: simultaneous pan (1-finger) + pinch (2-finger)
  const canvasPanGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onStart(() => {
      savedPanX.value = panX.value;
      savedPanY.value = panY.value;
    })
    .onUpdate((e) => {
      panX.value = savedPanX.value + e.translationX;
      panY.value = savedPanY.value + e.translationY;
    });

  const canvasPinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = Math.max(
        GRAPH_CONFIG.MIN_ZOOM,
        Math.min(GRAPH_CONFIG.MAX_ZOOM, savedScale.value * e.scale),
      );
      scale.value = newScale;
      runOnJS(syncZoom)(newScale);
    });

  const canvasGesture = Gesture.Simultaneous(canvasPanGesture, canvasPinchGesture);

  const canvasAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panX.value },
      { translateY: panY.value },
      { scale: scale.value },
    ],
  }));

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

  // Matching node IDs based on search query
  const searchMatchedNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase().trim();
    const matched = new Set<string>();
    filteredMemories.forEach((m) => {
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchContent = m.content.toLowerCase().includes(q);
      const matchSpace = m.contextSpace.toLowerCase().includes(q);
      const matchTag = m.tags.some((t) => t.toLowerCase().includes(q));
      if (matchTitle || matchContent || matchSpace || matchTag) {
        matched.add(m.id);
      }
    });
    return matched;
  }, [filteredMemories, searchQuery]);

  // Generate Node layout around canvas center (1300, 1300)
  const { nodes, edges } = useMemo(() => {
    const CANVAS_CENTER_X = GRAPH_CONFIG.CANVAS_SIZE * 0.5;
    const CANVAS_CENTER_Y = GRAPH_CONFIG.CANVAS_SIZE * 0.5;

    const nodesList: GraphNodeData[] = [];
    const edgesList: GraphEdgeData[] = [];
    const nodeMap = new Map<string, GraphNodeData>();
    const existingEdgesSet = new Set<string>();

    filteredMemories.forEach((mem, idx) => {
      const angle = idx * GRAPH_CONFIG.GOLDEN_ANGLE;
      const radius = Math.sqrt(idx + 1) * GRAPH_CONFIG.SPIRAL_RADIUS_STEP;

      const defaultX = CANVAS_CENTER_X + radius * Math.cos(angle);
      const defaultY = CANVAS_CENTER_Y + radius * Math.sin(angle);

      const pos = graphNodePositions[mem.id] || { x: defaultX, y: defaultY };

      const node: GraphNodeData = {
        id: mem.id,
        memory: mem,
        x: pos.x,
        y: pos.y,
        radius: mem.imageUrl ? GRAPH_CONFIG.NODE_RADIUS.IMAGE : GRAPH_CONFIG.NODE_RADIUS.DEFAULT,
        color: getTypeColor(mem.type),
        label: mem.title || 'Thought',
      };

      nodesList.push(node);
      nodeMap.set(mem.id, node);
    });

    // Add edges for AI Discovered Connections
    connections.forEach((conn) => {
      const source = nodeMap.get(conn.sourceMemoryId);
      const target = nodeMap.get(conn.targetMemoryId);
      if (source && target) {
        const pairKey = [source.id, target.id].sort().join('--');
        if (!existingEdgesSet.has(pairKey)) {
          existingEdgesSet.add(pairKey);
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
      }
    });

    // Indexed lookup table for synthetic space & tag connections (O(N) indexing)
    if (edgesList.length < GRAPH_CONFIG.MAX_SYNTHETIC_EDGES) {
      const spaceIndex = new Map<string, GraphNodeData[]>();
      const tagIndex = new Map<string, GraphNodeData[]>();

      nodesList.forEach((n) => {
        if (n.memory.contextSpace) {
          const arr = spaceIndex.get(n.memory.contextSpace) || [];
          arr.push(n);
          spaceIndex.set(n.memory.contextSpace, arr);
        }
        n.memory.tags.forEach((t) => {
          const arr = tagIndex.get(t) || [];
          arr.push(n);
          tagIndex.set(t, arr);
        });
      });

      const addSyntheticEdge = (n1: GraphNodeData, n2: GraphNodeData) => {
        if (n1.id === n2.id || edgesList.length >= GRAPH_CONFIG.MAX_SYNTHETIC_EDGES) return;
        const pairKey = [n1.id, n2.id].sort().join('--');
        if (!existingEdgesSet.has(pairKey)) {
          existingEdgesSet.add(pairKey);
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
      };

      // Connect adjacent nodes sharing space
      spaceIndex.forEach((group) => {
        for (let k = 0; k < group.length - 1 && edgesList.length < GRAPH_CONFIG.MAX_SYNTHETIC_EDGES; k++) {
          addSyntheticEdge(group[k], group[k + 1]);
        }
      });

      // Connect adjacent nodes sharing tags
      tagIndex.forEach((group) => {
        for (let k = 0; k < group.length - 1 && edgesList.length < GRAPH_CONFIG.MAX_SYNTHETIC_EDGES; k++) {
          addSyntheticEdge(group[k], group[k + 1]);
        }
      });
    }

    return { nodes: nodesList, edges: edgesList };
  }, [filteredMemories, connections, graphNodePositions]);

  // Node selection handler
  const handleSelectNode = useCallback(
    (id: string) => {
      if (isMultiSelectMode) {
        setSelectedNodeIds((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
      } else {
        setSelectedNodeIds((prev) => (prev.includes(id) && prev.length === 1 ? [] : [id]));
      }
    },
    [isMultiSelectMode]
  );

  // Live drag positions tracked in state so edges re-render in real-time.
  const handleDragMove = useCallback(
    (id: string, pos: NodePosition) => {
      setLiveDragNodePositions((prev) => ({ ...prev, [id]: pos }));
    },
    [],
  );

  const handleDragEnd = useCallback(
    (id: string, pos: NodePosition) => {
      setLiveDragNodePositions((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      updateGraphNodePosition(id, pos);
    },
    [updateGraphNodePosition],
  );

  const primarySelectedNode = useMemo(() => {
    if (selectedNodeIds.length === 0) return null;
    return nodes.find((n) => n.id === selectedNodeIds[selectedNodeIds.length - 1]);
  }, [nodes, selectedNodeIds]);

  if (!isKnowledgeGraphVisible) return null;

  return (
    <Modal
      visible={isKnowledgeGraphVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={closeKnowledgeGraph}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Control Bar */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerBadge}>
              <Sparkles size={14} color="#94A3B8" />
              <Text style={styles.headerBadgeText}>Mind Vault Graph</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.multiSelectBtn, isMultiSelectMode && styles.multiSelectBtnActive]}
                onPress={() => {
                  CyberTheme.haptics.light();
                  setIsMultiSelectMode((prev) => !prev);
                  if (isMultiSelectMode) setSelectedNodeIds([]);
                }}
              >
                <CheckSquare size={14} color={isMultiSelectMode ? '#101114' : '#CBD5E1'} />
                <Text style={[styles.multiSelectBtnText, isMultiSelectMode && styles.multiSelectBtnTextActive]}>
                  {isMultiSelectMode ? 'Multi-Select On' : 'Select'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={closeKnowledgeGraph}>
                <X size={20} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerSub}>
            Drag nodes or pan 360° across your {filteredMemories.length} thoughts.
          </Text>

          {/* Search Filter Overlay */}
          <GraphSearchOverlay
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
          />

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

        {/* 360° Infinite Virtual Canvas Area */}
        <GestureDetector gesture={canvasGesture}>
          <ReanimatedAnimated.View style={styles.canvasWrapper}>
            <ReanimatedAnimated.View
              style={[
                styles.graphCanvas,
                {
                  width: GRAPH_CONFIG.CANVAS_SIZE,
                  height: GRAPH_CONFIG.CANVAS_SIZE,
                },
                canvasAnimatedStyle,
              ]}
            >
              {/* Render Graph Edge Lines (with live drag positions) */}
              {edges.map((edge) => {
                const isConnectedToSelected = selectedNodeIds.some(
                  (id) => edge.sourceId === id || edge.targetId === id
                );
                const liveSource = liveDragNodePositions[edge.sourceId];
                const liveTarget = liveDragNodePositions[edge.targetId];

                return (
                  <GraphEdgeComponent
                    key={edge.id}
                    edge={{
                      ...edge,
                      x1: liveSource ? liveSource.x : edge.x1,
                      y1: liveSource ? liveSource.y : edge.y1,
                      x2: liveTarget ? liveTarget.x : edge.x2,
                      y2: liveTarget ? liveTarget.y : edge.y2,
                    }}
                    isSelectedConnected={isConnectedToSelected}
                  />
                );
              })}

              {/* Render Draggable Memory Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNodeIds.includes(node.id);
                const isConnected = selectedNodeIds.some((selectedId) =>
                  edges.some(
                    (e) =>
                      (e.sourceId === selectedId && e.targetId === node.id) ||
                      (e.targetId === selectedId && e.sourceId === node.id)
                  )
                );
                const isSearchMatched = searchMatchedNodeIds.has(node.id);

                return (
                  <GraphNodeComponent
                    key={node.id}
                    node={node}
                    isSelected={isSelected}
                    isConnected={isConnected}
                    isSearchMatched={isSearchMatched}
                    zoomScale={zoomScale}
                    onSelectNode={handleSelectNode}
                    onDragEnd={handleDragEnd}
                    onDragMove={handleDragMove}
                  />
                );
              })}
            </ReanimatedAnimated.View>

            {/* Floating Zoom & Canvas Reset Controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity
                style={styles.zoomBtn}
                onPress={() => {
                  const newScale = Math.min(GRAPH_CONFIG.MAX_ZOOM, zoomScale + GRAPH_CONFIG.ZOOM_STEP);
                  scale.value = withSpring(newScale, { damping: 15, stiffness: 120 });
                  setZoomScale(newScale);
                }}
              >
                <ZoomIn size={16} color="#CBD5E1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomBtn} onPress={resetCanvasView}>
                <RotateCcw size={14} color="#CBD5E1" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.zoomBtn}
                onPress={() => {
                  const newScale = Math.max(GRAPH_CONFIG.MIN_ZOOM, zoomScale - GRAPH_CONFIG.ZOOM_STEP);
                  scale.value = withSpring(newScale, { damping: 15, stiffness: 120 });
                  setZoomScale(newScale);
                }}
              >
                <ZoomOut size={16} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
          </ReanimatedAnimated.View>
        </GestureDetector>

        {/* Selected Thought Detail Banner Dock */}
        {primarySelectedNode ? (
          <View style={styles.bottomDock}>
            <View style={styles.selectedBanner}>
              {primarySelectedNode.memory.imageUrl ? (
                <Image source={{ uri: primarySelectedNode.memory.imageUrl }} style={styles.bannerImage} />
              ) : null}
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {primarySelectedNode.memory.title || 'Selected Thought'}
                </Text>
                <Text style={styles.bannerSub} numberOfLines={1}>
                  #{primarySelectedNode.memory.contextSpace || 'Space'} • {primarySelectedNode.memory.tags.join(', ')}
                  {selectedNodeIds.length > 1 ? ` (${selectedNodeIds.length} nodes selected)` : ''}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.openDetailBtn}
                onPress={() => {
                  CyberTheme.haptics.medium();
                  openMemoryDetail(primarySelectedNode.memory);
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
              Tap a node to inspect • Drag nodes to reposition • Pinch to zoom • Pan to explore
            </Text>
          </View>
        )}
      </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  multiSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  multiSelectBtnActive: {
    backgroundColor: '#8B1A2B',
    borderColor: '#8B1A2B',
  },
  multiSelectBtnText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  multiSelectBtnTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  headerSub: {
    fontSize: 11,
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
    backgroundColor: '#8B1A2B',
    borderColor: '#8B1A2B',
  },
  filterChipText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#F8FAFC',
    fontWeight: '600',
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#0A0B0E',
    overflow: 'hidden',
  },
  graphCanvas: {
    position: 'relative',
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
    zIndex: 20,
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
    zIndex: 20,
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
    zIndex: 20,
  },
  bottomHintText: {
    fontSize: 11,
    color: '#64748B',
  },
});
