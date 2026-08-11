import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme/tokens';
import { X, Crown, Sparkles, CheckCircle2, ArrowRight, Zap } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import { RevenueCatService } from '../services/revenuecat';

export const PaywallStory: React.FC = () => {
  const { isPaywallVisible, closePaywall, unlockProAccess } = useMemoryStore();
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);
  const [showExitOffer, setShowExitOffer] = useState(false);

  if (!isPaywallVisible) return null;

  const handleNextPage = () => {
    if (currentPage === 1) setCurrentPage(2);
    else if (currentPage === 2) setCurrentPage(3);
    else handlePurchase();
  };

  const handleDismiss = () => {
    if (!showExitOffer && currentPage !== 3) {
      setShowExitOffer(true);
    } else {
      closePaywall();
      setShowExitOffer(false);
      setCurrentPage(1);
    }
  };

  const handlePurchase = async () => {
    const success = await RevenueCatService.purchasePro();
    if (success) {
      unlockProAccess();
    }
  };

  return (
    <Modal visible={isPaywallVisible} animationType="slide" transparent={false} onRequestClose={handleDismiss}>
      <View style={styles.container}>
        {/* Background Radial Aurora Glow */}
        <View style={styles.auroraGlowBg} />

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.stepIndicatorRow}>
            <View style={[styles.stepDot, currentPage >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepDot, currentPage >= 2 && styles.stepDotActive]} />
            <View style={[styles.stepDot, currentPage >= 3 && styles.stepDotActive]} />
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
            <X size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Story Pages */}
        {currentPage === 1 && (
          <View style={styles.pageContent}>
            <View style={styles.iconCircle}>
              <Sparkles size={36} color={theme.colors.auroraPurple} />
            </View>

            <Text style={styles.pageTitle}>Convert Discovered Ideas into Executable Build Plans</Text>
            <Text style={styles.pageSubtitle}>
              MindMesh AI proactively surfaces patterns in your saved thoughts and generates full PRDs, architecture schemas, and RevenueCat paywalls.
            </Text>

            <View style={styles.benefitList}>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={16} color={theme.colors.auroraEmerald} />
                <Text style={styles.benefitText}>Unlimited Serendipity Engine Discoveries</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={16} color={theme.colors.auroraEmerald} />
                <Text style={styles.benefitText}>Unlimited PRD & RevenueCat Build Plans</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle2 size={16} color={theme.colors.auroraEmerald} />
                <Text style={styles.benefitText}>Cloud Sync & Notion Markdown Exports</Text>
              </View>
            </View>
          </View>
        )}

        {currentPage === 2 && (
          <View style={styles.pageContent}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Zap size={36} color={theme.colors.auroraCyan} />
            </View>

            <Text style={styles.pageTitle}>Builders Turn Scattered Thoughts into Products 4x Faster</Text>
            <Text style={styles.pageSubtitle}>
              Stop letting screenshots rot in your camera roll. MindMesh synthesizes research fragments while you sleep.
            </Text>

            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialQuote}>
                "MindMesh discovered a connection between a voice note from 3 weeks ago and a pricing screenshot. It built my entire RevenueCat plan automatically!"
              </Text>
              <Text style={styles.testimonialAuthor}>— Alex R., Solo iOS Founder</Text>
            </View>
          </View>
        )}

        {currentPage === 3 && (
          <View style={styles.pageContent}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Crown size={36} color={theme.colors.auroraAmber} />
            </View>

            <Text style={styles.pageTitle}>Unlock MindMesh Pro</Text>
            <Text style={styles.pageSubtitle}>7-Day Free Trial · Cancel anytime in App Store</Text>

            {/* Pricing Cards */}
            <TouchableOpacity style={styles.planCardActive} onPress={handlePurchase}>
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

            <TouchableOpacity style={styles.planCard} onPress={handlePurchase}>
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
              <Text style={styles.exitTitle}>Special Shipaton Offer!</Text>
              <Text style={styles.exitSub}>Get 50% OFF your first month of MindMesh Pro or claim a 3-Day Pass.</Text>

              <TouchableOpacity style={styles.exitClaimButton} onPress={handlePurchase}>
                <Text style={styles.exitClaimText}>Claim 50% Discount ($4.99)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exitDismissButton} onPress={handleDismiss}>
                <Text style={styles.exitDismissText}>No thanks, continue on Free Tier</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleNextPage}>
            <Text style={styles.actionBtnText}>
              {currentPage === 3 ? 'Start 7-Day Free Trial' : 'Continue'}
            </Text>
            <ArrowRight size={16} color="#FFF" />
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
    backgroundColor: theme.colors.bg,
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  auroraGlowBg: {
    position: 'absolute',
    top: 60,
    left: '10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.auroraGlowPurple,
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
  },
  stepDotActive: {
    backgroundColor: theme.colors.auroraPurple,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 24,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
  },
  pageSubtitle: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  benefitList: {
    gap: 12,
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  benefitText: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  testimonialCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.auroraCyan,
    width: '100%',
  },
  testimonialQuote: {
    fontFamily: theme.fonts.sans,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 8,
  },
  testimonialAuthor: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: theme.colors.auroraCyan,
  },
  planCard: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  planCardActive: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.auroraAmber,
    marginBottom: 10,
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: theme.colors.auroraAmber,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planBadgeText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  planCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  planSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  planPrice: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 16,
    color: theme.colors.auroraAmber,
  },
  exitOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 100,
  },
  exitModal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: 20,
    borderColor: theme.colors.auroraPurple,
    borderWidth: 1.5,
    width: '100%',
    alignItems: 'center',
  },
  exitTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  exitSub: {
    fontFamily: theme.fonts.sans,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  exitClaimButton: {
    backgroundColor: theme.colors.auroraPurple,
    width: '100%',
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    marginBottom: 8,
  },
  exitClaimText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 13,
    color: '#FFF',
  },
  exitDismissButton: {
    paddingVertical: 8,
  },
  exitDismissText: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  footer: {
    padding: 20,
    gap: 8,
  },
  actionBtn: {
    backgroundColor: theme.colors.auroraPurple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radii.md,
  },
  actionBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: '#FFF',
  },
  guaranteeText: {
    fontFamily: theme.fonts.sans,
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
