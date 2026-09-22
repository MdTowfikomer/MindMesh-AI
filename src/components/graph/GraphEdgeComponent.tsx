import React from 'react';
import { View } from 'react-native';

export interface GraphEdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
}

interface GraphEdgeComponentProps {
  edge: GraphEdgeData;
  isSelectedConnected: boolean;
}

export const GraphEdgeComponent: React.FC<GraphEdgeComponentProps> = React.memo(
  ({ edge, isSelectedConnected }) => {
    const dx = edge.x2 - edge.x1;
    const dy = edge.y2 - edge.y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return (
      <View
        style={{
          position: 'absolute',
          left: edge.x1,
          top: edge.y1,
          width: distance,
          height: isSelectedConnected ? 2.5 : 1,
          backgroundColor: isSelectedConnected
            ? '#FAF9F6'
            : 'rgba(220,240,250, 0.08)',
          transformOrigin: '0% 50%',
          transform: [{ rotate: `${angle}deg` }],
          zIndex: isSelectedConnected ? 2 : 1,
        }}
      />
    );
  }
);

GraphEdgeComponent.displayName = 'GraphEdgeComponent';
