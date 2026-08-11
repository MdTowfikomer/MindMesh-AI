import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/tokens';
import { Sparkles } from './Icons';

interface SerendipitySplashProps {
  onContinue: () => void;
}

export const SerendipitySplash: React.FC<SerendipitySplashProps> = ({ onContinue }) => {
  return (
    <View style={styles.container}>
      <View style={styles.ambientGlow} />

      <View style={styles.contentBox}>
        <Text style={styles.subtitle}>EMBRACE SERENDIPITY</Text>

        <Text style={styles.headline}>
          What will chance{'\n'}show you today?
        </Text>

        <Text style={styles.bodyText}>
          Refresh and reinforce your memories with a quick journey through your mind. We call it <Text style={styles.boldUnderline}>Serendipity</Text>.
        </Text>

        <TouchableOpacity style={styles.actionBtn} onPress={onContinue} activeOpacity={0.88}>
          <Text style={styles.actionBtnText}>SHOW ME HOW</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <Sparkles size={14} color={theme.colors.auroraPurple} />
        <Text style={styles.footerText}>MindMesh AI — Synaptic Thought Convergence</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.07)',
  },
  contentBox: {
    alignItems: 'center',
    maxWidth: 320,
  },
  subtitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: theme.colors.auroraPurple,
    letterSpacing: 2.2,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: theme.fonts.serif,
    fontSize: 36,
    color: theme.colors.textPrimary,
    lineHeight: 44,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  bodyText: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
  },
  boldUnderline: {
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.textPrimary,
    textDecorationLine: 'underline',
  },
  actionBtn: {
    borderColor: theme.colors.auroraIndigo,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
    shadowColor: theme.colors.auroraIndigo,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  actionBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.auroraIndigo,
    letterSpacing: 1.8,
  },
  footerRow: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
