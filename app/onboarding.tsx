import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../src/theme/tokens';
import { Sparkles, Camera, PenTool, Mic, ArrowRight, CheckCircle2, Wand2 } from '../src/components/Icons';
import { useMemoryStore } from '../src/stores/memoryStore';
import { SynapticFusion } from '../src/components/SynapticFusion';

export default function OnboardingScreen() {
  const router = useRouter();
  const { addMemory, triggerSynapticFusion, completeOnboarding } = useMemoryStore();

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [hasImage, setHasImage] = useState(false);
  const [hasNote, setHasNote] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);

  const handleStartCapture = () => {
    setStep(1);
  };

  const handleCaptureImage = () => {
    setHasImage(true);
    addMemory({
      type: 'pricing',
      title: 'RevenueCat Storytelling Paywall Screenshot',
      content: 'Multi-page storytelling paywall flow captured during cold-start onboarding.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      ocrText: 'REVENUECAT STORYTELLING PAYWALL: 3-Page Narrative Flow',
      tags: ['Pricing', 'RevenueCat', 'ColdStart'],
      contextSpace: 'Shipaton',
      confidenceScore: 0.96,
    });
    setStep(2);
  };

  const handleCaptureNote = () => {
    setHasNote(true);
    addMemory({
      type: 'text',
      title: 'White Minimalist & Luxury Editorial Design Spec',
      content: 'White minimalist canvas (#FFFFFF) with Cormorant Garamond serif headings and mymind visual cards.',
      tags: ['Design', 'SwissMinimalism', 'Typography'],
      contextSpace: 'MobileUX',
      confidenceScore: 0.92,
    });
    setStep(3);
  };

  const handleCaptureVoice = () => {
    setHasVoice(true);
    addMemory({
      type: 'voice',
      title: 'Synaptic Fusion & Build Plan Idea',
      content: 'What if captured notes physically converge into executable PRDs & RevenueCat paywall strategies?',
      audioDuration: '0:35',
      audioWaveform: [30, 60, 90, 40, 70, 100, 50, 80],
      tags: ['Idea', 'VoiceMemo', 'SynapticFusion'],
      contextSpace: 'Shipaton',
      confidenceScore: 0.94,
    });
    setStep(4);
    triggerSynapticFusion();
  };

  const handleFinishOnboarding = () => {
    completeOnboarding();
    router.replace('/(tabs)/feed');
  };

  // Step 0: Editorial Serendipity Welcome Screen (Inspired by Media 2 with Complementary Light White Theme)
  if (step === 0) {
    return (
      <View style={styles.serendipityWelcomeContainer}>
        {/* Ambient Top Glow */}
        <View style={styles.ambientGlow} />

        <View style={styles.serendipityContent}>
          {/* Subtitle Badge */}
          <Text style={styles.serendipitySubtitle}>EMBRACE SERENDIPITY</Text>

          {/* Main Headline */}
          <Text style={styles.serendipityHeadline}>
            What will chance{'\n'}show you today?
          </Text>

          {/* Body Copy */}
          <Text style={styles.serendipityBody}>
            Refresh and reinforce your memories with a quick journey through your mind. We call it <Text style={styles.serendipityHighlight}>Serendipity</Text>.
          </Text>

          {/* Hero Action Pill Button */}
          <TouchableOpacity style={styles.showMeHowBtn} onPress={handleStartCapture} activeOpacity={0.88}>
            <Text style={styles.showMeHowBtnText}>SHOW ME HOW</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Brand */}
        <View style={styles.welcomeFooter}>
          <Sparkles size={14} color={theme.colors.auroraPurple} />
          <Text style={styles.welcomeFooterText}>MindMesh AI — Sub-100ms On-Device Convergence</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Sparkles size={18} color={theme.colors.auroraPurple} />
          <Text style={styles.brandTitle}>MindMesh AI</Text>
        </View>
        <Text style={styles.stepBadge}>Step {step} of 4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heroHeader}>60-Second Cold-Start Magic</Text>
        <Text style={styles.heroSub}>
          Drop 3 thoughts. Watch MindMesh discover what connects them in under 60 seconds.
        </Text>

        {/* 3 Step Cards */}
        <TouchableOpacity
          style={[styles.stepCard, hasImage && styles.stepCardDone]}
          onPress={handleCaptureImage}
          disabled={hasImage}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            {hasImage ? <CheckCircle2 size={24} color={theme.colors.auroraAmber} /> : <Camera size={24} color={theme.colors.auroraAmber} />}
          </View>

          <View style={styles.stepTextCol}>
            <Text style={styles.stepTitle}>1. Drop 1 Screenshot / Image</Text>
            <Text style={styles.stepDesc}>
              {hasImage ? 'Pricing Screenshot Classified & OCR Processed' : 'Tap to simulate dropping a pricing screenshot'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stepCard, hasNote && styles.stepCardDone]}
          onPress={handleCaptureNote}
          disabled={!hasImage || hasNote}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
            {hasNote ? <CheckCircle2 size={24} color={theme.colors.auroraPurple} /> : <PenTool size={24} color={theme.colors.auroraPurple} />}
          </View>

          <View style={styles.stepTextCol}>
            <Text style={styles.stepTitle}>2. Write 1 Quick Thought</Text>
            <Text style={styles.stepDesc}>
              {hasNote ? 'Thought Parsed & Auto-Tagged' : 'Tap to drop a design requirement note'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stepCard, hasVoice && styles.stepCardDone]}
          onPress={handleCaptureVoice}
          disabled={!hasNote || hasVoice}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            {hasVoice ? <CheckCircle2 size={24} color={theme.colors.auroraCyan} /> : <Mic size={24} color={theme.colors.auroraCyan} />}
          </View>

          <View style={styles.stepTextCol}>
            <Text style={styles.stepTitle}>3. Record 1 Voice Memo</Text>
            <Text style={styles.stepDesc}>
              {hasVoice ? 'Audio Transcribed into Action Items' : 'Tap to record a 10s audio blurb'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Finish CTA */}
        {hasVoice && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Synaptic Connection Discovered!</Text>
            <Text style={styles.successSub}>
              MindMesh connected your pricing screenshot with your voice note (96% Match) and prepared your first Build Plan.
            </Text>

            <TouchableOpacity style={styles.finishButton} onPress={handleFinishOnboarding}>
              <Text style={styles.finishButtonText}>Enter MindMesh Feed</Text>
              <ArrowRight size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <SynapticFusion isVisible={step === 4 && hasVoice} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Media 2 Serendipity Welcome Screen Styles (Complementary Light White Editorial Palette)
  serendipityWelcomeContainer: {
    flex: 1,
    backgroundColor: '#FAFAF9', // Warm White Editorial Background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  serendipityContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  serendipitySubtitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: theme.colors.auroraPurple,
    letterSpacing: 2.2,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  serendipityHeadline: {
    fontFamily: theme.fonts.serif,
    fontSize: 36,
    color: theme.colors.textPrimary,
    lineHeight: 44,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  serendipityBody: {
    fontFamily: theme.fonts.sans,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
  },
  serendipityHighlight: {
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.textPrimary,
    textDecorationLine: 'underline',
  },
  showMeHowBtn: {
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
  showMeHowBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.auroraIndigo,
    letterSpacing: 1.8,
  },
  welcomeFooter: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  welcomeFooterText: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },

  // Onboarding Step Styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  stepBadge: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.auroraPurple,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.xs,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  heroHeader: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
    color: theme.colors.textPrimary,
    lineHeight: 32,
  },
  heroSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  stepCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepCardDone: {
    borderColor: theme.colors.auroraIndigo,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextCol: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  stepDesc: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  successBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: theme.radii.md,
    padding: 16,
    borderColor: theme.colors.auroraPurple,
    borderWidth: 1,
    marginTop: 10,
  },
  successTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.auroraPurple,
    marginBottom: 4,
  },
  successSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 14,
    lineHeight: 16,
  },
  finishButton: {
    backgroundColor: theme.colors.auroraIndigo,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
  },
  finishButtonText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: '#FFF',
  },
});
