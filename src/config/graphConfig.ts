export const GRAPH_CONFIG = {
  CANVAS_SIZE: 2600,
  MIN_ZOOM: 0.3,
  MAX_ZOOM: 3.0,
  ZOOM_STEP: 0.25,
  GOLDEN_ANGLE: 137.5 * (Math.PI / 180),
  SPIRAL_RADIUS_STEP: 90,
  TAP_DRAG_THRESHOLD: 3,
  MAX_SYNTHETIC_EDGES: 40,
  NODE_RADIUS: {
    IMAGE: 28,
    DEFAULT: 22,
  },
  TYPE_COLORS: {
    image: '#38BDF8', // Sky blue
    text: '#F59E0B', // Amber
    quote: '#F59E0B',
    bookmark: '#10B981', // Emerald
    article: '#10B981',
    video: '#EC4899', // Pink
    voice: '#8B5CF6', // Purple
    code: '#6366F1', // Indigo
    default: '#CBD5E1', // Slate
  } as Record<string, string>,
};

export const getTypeColor = (type: string): string => {
  return GRAPH_CONFIG.TYPE_COLORS[type] || GRAPH_CONFIG.TYPE_COLORS.default;
};
