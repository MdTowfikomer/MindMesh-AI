import * as Haptics from 'expo-haptics';

export const CyberTheme = {
  colors: {
    // Deep Pitch-Black Canvas
    bg: '#030308',
    bgSecondary: '#080812',
    bgGradient: ['#030308', '#090A15', '#04040A'] as const,
    
    // Glassmorphism Surfaces
    surface: 'rgba(18, 20, 36, 0.72)',
    surfaceSolid: '#0E1020',
    surfaceSubtle: 'rgba(255, 255, 255, 0.04)',
    surfaceHover: 'rgba(255, 255, 255, 0.08)',
    surfaceCard: 'rgba(14, 16, 28, 0.85)',
    
    // Borders
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.14)',
    borderActive: 'rgba(0, 242, 254, 0.5)',
    borderGlow: 'rgba(157, 78, 221, 0.45)',

    // Typography
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textDim: '#475569',

    // Synaptic Neons (21st.dev / Feral UI palette)
    cyan: '#00F2FE',
    violet: '#9D4EDD',
    blue: '#4FACFE',
    emerald: '#00F5A0',
    amber: '#FFB703',
    rose: '#FF007F',

    // Neon Glow Presets
    glows: {
      cyan: 'rgba(0, 242, 254, 0.28)',
      violet: 'rgba(157, 78, 221, 0.28)',
      blue: 'rgba(79, 172, 254, 0.28)',
      emerald: 'rgba(0, 245, 160, 0.28)',
      rose: 'rgba(255, 0, 127, 0.28)',
      amber: 'rgba(255, 183, 3, 0.28)',
    },

    // Gradient Presets
    gradients: {
      neural: ['#9D4EDD', '#4FACFE', '#00F2FE'] as const,
      cyber: ['#00F2FE', '#4FACFE'] as const,
      iridescent: ['#9D4EDD', '#FF007F', '#FFB703', '#00F5A0', '#00F2FE'] as const,
      shimmer: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)'] as const,
      darkGlass: ['rgba(20, 22, 40, 0.85)', 'rgba(10, 11, 20, 0.95)'] as const,
      glowCardBorder: ['rgba(0, 242, 254, 0.6)', 'rgba(157, 78, 221, 0.6)', 'rgba(255, 0, 127, 0.4)'] as const,
    },
  },

  radii: {
    xs: 8,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 32,
    full: 9999,
  },

  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  springs: {
    touchable: { damping: 15, stiffness: 280, mass: 0.7 },
    modal: { damping: 20, stiffness: 180, mass: 0.9 },
    bento: { damping: 16, stiffness: 140, mass: 1 },
    snappy: { damping: 12, stiffness: 350, mass: 0.5 },
  },

  haptics: {
    light: () => {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    },
    medium: () => {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    },
    heavy: () => {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
    },
    success: () => {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    },
    warning: () => {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
    },
  },

  blur: {
    intensity: 30,
    tint: 'dark' as const,
  },
};
