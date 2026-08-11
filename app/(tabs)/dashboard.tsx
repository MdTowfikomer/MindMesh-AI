import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useMemoryStore } from '../../src/stores/memoryStore';
import { theme } from '../../src/theme/tokens';
import { Share2, Crown, Flame } from '../../src/components/Icons';
import { BuildStoryExport } from '../../src/components/BuildStoryExport';

export default function DashboardScreen() {
  const { userStats, openPaywall } = useMemoryStore();
  const [isExportVisible, setIsExportVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Momentum Banner */}
        <View style={styles.momentumBanner}>
          <View style={styles.bannerHeader}>
            <View style={styles.streakBadge}>
              <Flame size={14} color={theme.colors.auroraRose} />
              <Text style={styles.streakText}>5 DAY BUILD STREAK</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={() => setIsExportVisible(true)}>
              <Share2 size={14} color={theme.colors.auroraPurple} />
              <Text style={styles.shareBtnText}>Viral Card Exporter</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bannerTitle}>THIS WEEK'S MOMENTUM</Text>
          <Text style={styles.bannerStats}>
            {userStats.capturesCount} Captures · {userStats.discoveriesCount} Discoveries · {userStats.buildPlansCount} Build Plans · {userStats.shippedProjectsCount} Shipped
          </Text>
        </View>

        {/* 4 Metric Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{userStats.capturesCount}</Text>
            <Text style={styles.metricLabel}>Total Captures</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: theme.colors.auroraPurple }]}>{userStats.discoveriesCount}</Text>
            <Text style={styles.metricLabel}>Connections Found</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: theme.colors.auroraAmber }]}>{userStats.buildPlansCount}</Text>
            <Text style={styles.metricLabel}>Build Plans</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: theme.colors.auroraEmerald }]}>{userStats.shippedProjectsCount}</Text>
            <Text style={styles.metricLabel}>Shipped Products</Text>
          </View>
        </View>

        {/* RevenueCat Entitlement Status Card */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subHeader}>
            <Crown size={20} color={theme.colors.auroraAmber} />
            <View>
              <Text style={styles.subTitle}>RevenueCat Pro Tier</Text>
              <Text style={styles.subStatus}>● Active Entitlement ("Pro Access")</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.paywallPreviewBtn} onPress={openPaywall}>
            <Text style={styles.paywallPreviewText}>Preview Storytelling Paywall</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BuildStoryExport visible={isExportVisible} onClose={() => setIsExportVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  momentumBanner: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.xs,
  },
  streakText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraRose,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.xs,
  },
  shareBtnText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 10,
    color: theme.colors.auroraPurple,
  },
  bannerTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  bannerStats: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  metricNumber: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 26,
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  subscriptionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subTitle: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  subStatus: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 11,
    color: theme.colors.auroraEmerald,
  },
  paywallPreviewBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  paywallPreviewText: {
    fontFamily: theme.fonts.sansBold,
    fontSize: 12,
    color: theme.colors.auroraAmber,
  },
});
