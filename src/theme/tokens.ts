// Premium Editorial Theme Tokens — High Taste Frontend System
export const theme = {
  colors: {
    bg: '#FAFAF9',           // Warm Warm White Canvas
    bgSecondary: '#F5F5F4',  // Subtle Warm Grey
    surface: '#FFFFFF',      // Pure White Surface
    surfaceSubtle: '#F2F2F0',
    card: '#FFFFFF',
    cardHover: '#F7F7F6',
    border: 'rgba(15, 23, 42, 0.06)',
    borderLight: 'rgba(15, 23, 42, 0.04)',
    
    // Luxury Typography Hierarchy & Tracking
    textPrimary: '#0F172A',   // Deep Obsidian Blue
    textSecondary: '#475569', // Muted Slate
    textMuted: '#64748B',     // Warm Secondary
    textDim: '#94A3B8',

    // Curated Editorial Accents (High Contrast, Organic Vibrancy)
    auroraIndigo: '#4338CA',  // Deep Indigo
    auroraPurple: '#6D28D9',  // Royal Violet
    auroraRose: '#BE123C',    // Crimson Rose
    auroraCyan: '#0369A1',    // Oceanic Blue
    auroraAmber: '#B45309',   // Warm Amber
    auroraEmerald: '#047857', // Forest Emerald

    // Micro Radial Aurora Overlays
    auroraGlowIndigo: 'rgba(67, 56, 202, 0.06)',
    auroraGlowPurple: 'rgba(109, 40, 217, 0.06)',
    auroraGlowRose: 'rgba(190, 18, 60, 0.06)',

    // Glassmorphism Light
    glassBg: 'rgba(255, 255, 255, 0.88)',
    glassBorder: 'rgba(15, 23, 42, 0.06)',

    // Semantic Tags (Subtle light backgrounds with readable dark text)
    tagPricingBg: 'rgba(180, 83, 9, 0.08)',
    tagPricingText: '#B45309',
    tagVoiceBg: 'rgba(3, 105, 161, 0.08)',
    tagVoiceText: '#0369A1',
    tagIdeaBg: 'rgba(109, 40, 217, 0.08)',
    tagIdeaText: '#6D28D9',
    tagCodeBg: 'rgba(4, 120, 87, 0.08)',
    tagCodeText: '#047857',
    tagUiBg: 'rgba(190, 18, 60, 0.08)',
    tagUiText: '#BE123C',
  },

  fonts: {
    serif: 'CormorantGaramond-SemiBold',
    serifItalic: 'CormorantGaramond-Italic',
    sans: 'PlusJakartaSans-Regular',
    sansMedium: 'PlusJakartaSans-Medium',
    sansBold: 'PlusJakartaSans-Bold',
    mono: 'Courier',
  },

  // Refined Spacing Scale (8pt grid system for dynamic optical alignment)
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Micro-tracking & Kerning rules for editorial luxury typography
  tracking: {
    tight: -0.5,
    normal: 0,
    wide: 0.8,
    widest: 1.5,
  },

  radii: {
    xs: 8,
    sm: 12,
    md: 18,
    lg: 28,
    full: 9999,
  },

  // Physics-driven spring motion configs
  motion: {
    springFast: { friction: 7, tension: 120 },
    springBouncy: { friction: 5, tension: 100 },
    springSmooth: { friction: 9, tension: 80 },
  },

  shadows: {
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 16,
      elevation: 2,
    },
    auroraGlow: {
      shadowColor: '#4338CA',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
    }
  }
};
