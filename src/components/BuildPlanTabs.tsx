import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { BuildPlan } from '../types/mindmesh';
import { theme } from '../theme/tokens';
import { X, FileText, Database, DollarSign, CheckSquare, Copy, Check, ShieldCheck } from './Icons';

interface BuildPlanTabsProps {
  plan: BuildPlan | null;
  visible: boolean;
  onClose: () => void;
  onOpenPaywall?: () => void;
}

export const BuildPlanTabs: React.FC<BuildPlanTabsProps> = ({ plan, visible, onClose, onOpenPaywall }) => {
  const [activeTab, setActiveTab] = useState<'prd' | 'tech' | 'revenuecat' | 'tasks'>('prd');
  const [copied, setCopied] = useState(false);
  const [tasks, setTasks] = useState(plan?.taskChecklist || []);

  if (!visible || !plan) return null;

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleColumn}>
            <Text style={styles.headerTag}>HERO BUILD PLAN</Text>
            <Text style={styles.title} numberOfLines={1}>{plan.title}</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>{plan.subtitle}</Text>

        {/* 4 Navigation Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'prd' && styles.tabButtonActive]}
            onPress={() => setActiveTab('prd')}
          >
            <FileText size={13} color={activeTab === 'prd' ? theme.colors.auroraIndigo : theme.colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'prd' && styles.tabTextActive]}>1. PRD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tech' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tech')}
          >
            <Database size={13} color={activeTab === 'tech' ? theme.colors.auroraPurple : theme.colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'tech' && styles.tabTextActive]}>2. Schema</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'revenuecat' && styles.tabButtonActive]}
            onPress={() => setActiveTab('revenuecat')}
          >
            <DollarSign size={13} color={activeTab === 'revenuecat' ? theme.colors.auroraAmber : theme.colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'revenuecat' && styles.tabTextActive]}>3. RevenueCat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tasks' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tasks')}
          >
            <CheckSquare size={13} color={activeTab === 'tasks' ? theme.colors.auroraEmerald : theme.colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>4. Tasks</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Body Content */}
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          {activeTab === 'prd' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionHeading}>Problem Statement</Text>
              <Text style={styles.paragraph}>{plan.prd.problemStatement}</Text>

              <Text style={styles.sectionHeading}>Target Persona</Text>
              <Text style={styles.paragraph}>{plan.prd.targetPersona}</Text>

              <Text style={styles.sectionHeading}>Core Features Spec</Text>
              {plan.prd.coreFeatures.map((feat, idx) => (
                <View key={idx} style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureTitle}>{feat.title}</Text>
                    <Text style={styles.priorityBadge}>{feat.priority}</Text>
                  </View>
                  <Text style={styles.featureDesc}>{feat.description}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'tech' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionHeading}>Recommended Tech Stack</Text>
              <Text style={styles.paragraph}>{plan.techStackSchema.architecture}</Text>

              <View style={styles.chipRow}>
                {plan.techStackSchema.stack.map((item, idx) => (
                  <Text key={idx} style={styles.techChip}>{item}</Text>
                ))}
              </View>

              <Text style={styles.sectionHeading}>Database Tables & Schemas</Text>
              {plan.techStackSchema.databaseTables.map((table, idx) => (
                <View key={idx} style={styles.codeBlock}>
                  <Text style={styles.tableName}>TABLE {table.tableName}</Text>
                  <Text style={styles.tableFields}>{table.fields}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'revenuecat' && (
            <View style={styles.tabSection}>
              <View style={styles.rcHeaderBanner}>
                <ShieldCheck size={18} color={theme.colors.auroraAmber} />
                <Text style={styles.rcBannerTitle}>RevenueCat Business Model Strategy</Text>
              </View>

              <Text style={styles.sectionHeading}>Free Tier Rules</Text>
              {plan.revenueCatStrategy.freeTierRules.map((rule, idx) => (
                <Text key={idx} style={styles.bulletItem}>• {rule}</Text>
              ))}

              <Text style={styles.sectionHeading}>Pro Tier Entitlements</Text>
              {plan.revenueCatStrategy.proTierBenefits.map((benefit, idx) => (
                <Text key={idx} style={styles.bulletItem}>✓ {benefit}</Text>
              ))}

              <Text style={styles.sectionHeading}>Pricing Structure</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceCard}>
                  <Text style={styles.priceTitle}>Monthly</Text>
                  <Text style={styles.priceValue}>{plan.revenueCatStrategy.monthlyPrice}</Text>
                </View>
                <View style={[styles.priceCard, styles.priceCardActive]}>
                  <Text style={styles.priceTitle}>Annual (Save 58%)</Text>
                  <Text style={styles.priceValue}>{plan.revenueCatStrategy.annualPrice}</Text>
                </View>
              </View>

              <Text style={styles.sectionHeading}>RevenueCat SDK Integration Code</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.tableFields}>{plan.revenueCatStrategy.sdkSnippet}</Text>
              </View>

              {onOpenPaywall && (
                <TouchableOpacity style={styles.previewPaywallButton} onPress={onOpenPaywall}>
                  <Text style={styles.previewPaywallText}>Preview Multipage HAMM Paywall</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {activeTab === 'tasks' && (
            <View style={styles.tabSection}>
              <Text style={styles.sectionHeading}>Actionable Development Checklist</Text>
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.checkItem}
                  onPress={() => toggleTask(task.id)}
                >
                  <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
                    {task.completed && <Check size={12} color="#FFF" />}
                  </View>
                  <Text style={[styles.checkText, task.completed && styles.checkTextDone]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            {copied ? <Check size={16} color={theme.colors.auroraEmerald} /> : <Copy size={16} color={theme.colors.textPrimary} />}
            <Text style={styles.copyButtonText}>{copied ? 'Copied Spec!' : 'Copy Markdown Spec'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  headerTitleColumn: {
    flex: 1,
  },
  headerTag: {
    fontSize: 9,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraIndigo,
    letterSpacing: 1,
  },
  title: {
    fontFamily: theme.fonts.serif,
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontFamily: theme.fonts.sans,
    fontSize: 11,
    color: theme.colors.textMuted,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: theme.colors.auroraIndigo,
  },
  tabText: {
    fontSize: 11,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.sansBold,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tabSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraPurple,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
  },
  paragraph: {
    fontSize: 13,
    fontFamily: theme.fonts.sans,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  featureCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.textPrimary,
  },
  priorityBadge: {
    fontSize: 9,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraAmber,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featureDesc: {
    fontSize: 11,
    fontFamily: theme.fonts.sans,
    color: theme.colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techChip: {
    fontSize: 11,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.auroraCyan,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.xs,
  },
  codeBlock: {
    backgroundColor: '#0F172A',
    borderRadius: theme.radii.xs,
    padding: 10,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  tableName: {
    fontSize: 10,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraAmber,
    marginBottom: 4,
  },
  tableFields: {
    fontSize: 11,
    fontFamily: theme.fonts.mono,
    color: '#38BDF8',
  },
  rcHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: 10,
    borderRadius: theme.radii.sm,
  },
  rcBannerTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraAmber,
  },
  bulletItem: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  priceCardActive: {
    borderColor: theme.colors.auroraAmber,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  priceTitle: {
    fontSize: 10,
    fontFamily: theme.fonts.sansMedium,
    color: theme.colors.textMuted,
  },
  priceValue: {
    fontSize: 13,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  previewPaywallButton: {
    backgroundColor: theme.colors.auroraAmber,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    marginTop: 8,
  },
  previewPaywallText: {
    fontSize: 12,
    fontFamily: theme.fonts.sansBold,
    color: '#000',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: theme.radii.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: theme.colors.auroraEmerald,
    borderColor: theme.colors.auroraEmerald,
  },
  checkText: {
    fontSize: 12,
    fontFamily: theme.fonts.sans,
    color: theme.colors.textPrimary,
  },
  checkTextDone: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  copyButton: {
    backgroundColor: theme.colors.auroraIndigo,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
  },
  copyButtonText: {
    fontSize: 13,
    fontFamily: theme.fonts.sansBold,
    color: '#FFF',
  },
  slopGateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  slopGateText: {
    fontSize: 9,
    fontFamily: theme.fonts.sansBold,
    color: theme.colors.auroraEmerald,
    letterSpacing: 0.5,
  },
});
