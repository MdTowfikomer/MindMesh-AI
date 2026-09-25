import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { CyberTheme } from '../theme/cyberLuxury';
import { X, Crown, Sparkles, CheckCircle2, ArrowRight, Zap } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import { RevenueCatService } from '../services/revenuecat';

// Burgundy Design System Constants
const BURGUNDY = {
  primary: '#8B1A2B',
  light: '#B8334F',
  surface: 'rgba(139, 26, 43, 0.12)',
  border: 'rgba(184, 51, 79, 0.45)',
};

export const PaywallStory: React.FC = () => {
  const { isPaywallVisible, closePaywall, unlockProAccess } = useMemoryStore();
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);
  const [showExitOffer, setShowExitOffer] = useState(false);

  if (!isPaywallVisible) return null;

  const handleNextPage = () => {
    CyberTheme.haptics.light();
    if (currentPage === 1) setCurrentPage(2);
    else if (currentPage === 2) setCurrentPage(3);
    else handlePurchase();
  };

  const handleDismiss = () => {
    CyberTheme.haptics.light();
    if (!showExitOffer && currentPage !== 3) {
      setShowExitOffer(true);
    } else {
      closePaywall();
      setShowExitOffer(false);
      setCurrentPage(1);
    }
  };

  const handlePurchase = async () => {
    CyberTheme.haptics.medium();
    const success = await RevenueCatService.purchasePro();
    if (success) {
      unlockProAccess();
      closePaywall();
      setShowExitOffer(false);
      setCurrentPage(1);
    }
  };

  return (
    <Modal visible={isPaywallVisible} animationType="slide" transparent={false} onRequestClose={handleDismiss}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.stepIndicatorRow}>
            <View style={[styles.stepDot, currentPage >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepDot, currentPage >= 2 && styles.stepDotActive]} />
            <View style={[styles.stepDot, currentPage >= 3 && styles.stepDotActive]} />
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss} activeOpacity={0.7}>
            <X size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Story Pages */}
        {currentPage === 1 && (
          <View style={styles.pageContent}>
            <View style={styles.iconCircle}>
              <Sparkles size={30} color={BURGUNDY.light} />
            </View>

            <Text style={styles.pageTitle}>Convert Discovered Ideas into Executable Build Plans</Text>
            <Text style={styles.pageSubtitle}>
              MindMesh AI proactively surfaces patterns in your saved thoughts and generates full PRDs, architecture schemas, and RevenueCat paywalls.
            </Text>

            <View style={styles.benefitList}>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={16} color={BURGUNDY.light} />
                <Text style={styles.benefitText}>Unlimited Serendipity Engine Discoveries</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={16} color={BURGUNDY.light} />
                <Text style={styles.benefitText}>Unlimited PRD & RevenueCat Build Plans</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={16} color={BURGUNDY.light} />
                <Text style={styles.benefitText}>Multi-Device Obsidian & Notion Vault Sync</Text>
              </View>
            </View>
          </View>
        )}

        {currentPage === 2 && (
          <View style={styles.pageContent}>
            <View style={styles.iconCircle}>
              <Zap size={30} color={BURGUNDY.light} />
            </View>

            <Text style={styles.pageTitle}>Turn Scattered Thoughts into Products 4x Faster</Text>
            <Text style={styles.pageSubtitle}>
              Stop letting screenshots rot in your camera roll. MindMesh synthesizes research fragments while you sleep.
            </Text>

            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialQuote}>
                "MindMesh discovered a connection between a voice note from 3 weeks ago and a pricing screenshot. It drafted a complete build plan with full RevenueCat paywall schemas automatically."
              </Text>
              <Text style={styles.testimonialAuthor}>Alex R., Mobile Software Engineer</Text>
            </View>
          </View>
        )}

        {currentPage === 3 && (
          <View style={styles.pageContent}>
            <View style={styles.iconCircle}>
              <Crown size={30} color={BURGUNDY.light} />
            </View>

            <Text style={styles.pageTitle}>Unlock MindMesh Pro</Text>
            <Text style={styles.pageSubtitle}>7-Day Free Trial · Cancel anytime</Text>

            {/* Pricing Cards */}
            <TouchableOpacity style={styles.planCardActive} onPress={handlePurchase} activeOpacity={0.85}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>BEST VALUE (SAVE 58%)</Text>
              </View>

              <View style={styles.planCardRow}>
                <View>
                  <Text style={styles.planTitle}>Annual Access</Text>
                  <Text style={styles.planSub}>7 Days Free, then $49.99/yr</Text>
                </View>
                <Text style={styles.planPrice}>$4.16/mo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.planCard} onPress={handlePurchase} activeOpacity={0.85}>
              <View style={styles.planCardRow}>
                <View>
                  <Text style={styles.planTitle}>Monthly Access</Text>
                  <Text style={styles.planSub}>Billed monthly</Text>
                </View>
                <Text style={styles.planPrice}>$9.99/mo</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Dynamic Exit Offer Modal */}
        {showExitOffer && (
          <View style={styles.exitOverlay}>
            <View style={styles.exitModal}>
              <Text style={styles.exitTitle}>Special Shipaton Offer</Text>
              <Text style={styles.exitSub}>Get 50% OFF your first month of MindMesh Pro or claim a 3-Day Pass.</Text>

              <TouchableOpacity style={styles.exitClaimButton} onPress={handlePurchase} activeOpacity={0.85}>
                <Text style={styles.exitClaimText}>Claim 50% Discount ($4.99)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exitDismissButton} onPress={handleDismiss} activeOpacity={0.7}>
                <Text style={styles.exitDismissText}>No thanks, continue on Free Tier</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleNextPage} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>
              {currentPage === 3 ? 'Start 7-Day Free Trial' : 'Continue'}
            </Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.guaranteeText}>Secured by RevenueCat · Restore Purchases</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030308',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  stepDotActive: {
    backgroundColor: BURGUNDY.light,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BURGUNDY.surface,
    borderWidth: 1,
    borderColor: BURGUNDY.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    maxWidth: 320,
  },
  benefitList: {
    gap: 10,
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0E1018',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F1F5F9',
    flex: 1,
  },
  testimonialCard: {
    backgroundColor: '#0E1018',
    borderRadius: 12,
    padding: 18,
    borderLeftWidth: 3,
    borderLeftColor: BURGUNDY.light,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    width: '100%',
  },
  testimonialQuote: {
    fontSize: 13,
    color: '#CBD5E1',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: BURGUNDY.light,
    letterSpacing: 0.2,
  },
  planCard: {
    width: '100%',
    backgroundColor: '#0E1018',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 12,
  },
  planCardActive: {
    width: '100%',
    backgroundColor: BURGUNDY.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BURGUNDY.border,
    marginBottom: 12,
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: BURGUNDY.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BURGUNDY.border,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  planSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  planPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: BURGUNDY.light,
  },
  exitOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(3, 3, 8, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  exitModal: {
    backgroundColor: '#0E1018',
    borderRadius: 16,
    padding: 24,
    borderColor: BURGUNDY.border,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  exitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  exitSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  exitClaimButton: {
    backgroundColor: BURGUNDY.primary,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  exitClaimText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exitDismissButton: {
    paddingVertical: 6,
  },
  exitDismissText: {
    fontSize: 11,
    color: '#64748B',
  },
  footer: {
    padding: 20,
    gap: 10,
  },
  actionBtn: {
    backgroundColor: BURGUNDY.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BURGUNDY.border,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});
