import React from 'react';
import { Ionicons, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

interface IconProps {
  size?: number;
  color?: string;
  style?: any;
}

export const Sparkles: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Ionicons name="sparkles" size={size} color={color} style={style} />
);

export const Mic: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="mic" size={size} color={color} style={style} />
);

export const ImageIcon: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="image" size={size} color={color} style={style} />
);

export const FileText: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="file-text" size={size} color={color} style={style} />
);

export const DollarSign: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="dollar-sign" size={size} color={color} style={style} />
);

export const Code: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="code" size={size} color={color} style={style} />
);

export const Share2: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="share-2" size={size} color={color} style={style} />
);

export const Crown: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <MaterialCommunityIcons name="crown" size={size} color={color} style={style} />
);

export const CheckCircle2: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Ionicons name="checkmark-circle" size={size} color={color} style={style} />
);

export const X: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="x" size={size} color={color} style={style} />
);

export const Search: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="search" size={size} color={color} style={style} />
);

export const Database: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="database" size={size} color={color} style={style} />
);

export const CheckSquare: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="check-square" size={size} color={color} style={style} />
);

export const Copy: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="copy" size={size} color={color} style={style} />
);

export const Check: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="check" size={size} color={color} style={style} />
);

export const Zap: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="zap" size={size} color={color} style={style} />
);

export const ShieldCheck: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <MaterialCommunityIcons name="shield-check" size={size} color={color} style={style} />
);

export const Trash2: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="trash-2" size={size} color={color} style={style} />
);

export const ArrowRight: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="arrow-right" size={size} color={color} style={style} />
);

export const StopCircle: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="stop-circle" size={size} color={color} style={style} />
);

export const ArrowUp: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="arrow-up" size={size} color={color} style={style} />
);

export const Wand2: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Ionicons name="sparkles" size={size} color={color} style={style} />
);

export const Flame: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Ionicons name="flame" size={size} color={color} style={style} />
);

export const LayoutGrid: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="grid" size={size} color={color} style={style} />
);

export const PieChart: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="pie-chart" size={size} color={color} style={style} />
);

export const FileCode: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <MaterialCommunityIcons name="file-code-outline" size={size} color={color} style={style} />
);

export const Camera: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="camera" size={size} color={color} style={style} />
);

export const Link: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="link" size={size} color={color} style={style} />
);

export const MessageSquare: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="message-square" size={size} color={color} style={style} />
);

export const PenTool: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="pen-tool" size={size} color={color} style={style} />
);

export const Plus: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="plus" size={size} color={color} style={style} />
);

export const Layers: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="layers" size={size} color={color} style={style} />
);

export const Folder: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="folder" size={size} color={color} style={style} />
);

export const ChevronDown: React.FC<IconProps> = ({ size = 18, color = '#FFF', style }) => (
  <Feather name="chevron-down" size={size} color={color} style={style} />
);
