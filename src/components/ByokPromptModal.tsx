import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Key, Sparkles, Check, X, ShieldCheck } from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import { CyberTheme } from '../theme/cyberLuxury';
import { SQLiteDatabaseService } from '../services/sqliteDatabase';

const DONT_SHOW_AGAIN_KEY = 'byok_prompt_dont_show_again';

export const ByokPromptModal: React.FC = () => {
  const {
    isByokPromptVisible,
    closeByokPrompt,
    openSettingsModal,
    byokConfig,
  } = useMemoryStore();

  const [dontShowAgain, setDontShowAgain] = useState(false);

  // If user already has a verified custom key, never show prompt
  if (!isByokPromptVisible || (byokConfig.apiKey && byokConfig.apiKey.trim().length > 10)) {
    return null;
  }

  const handleAddApiKey = async () => {
    CyberTheme.haptics.medium();
    if (dontShowAgain) {
      await SQLiteDatabaseService.saveSetting(DONT_SHOW_AGAIN_KEY, 'true');
    }
    closeByokPrompt();
    // Smoothly transition to Settings Modal
    setTimeout(() => {
      openSettingsModal();
    }, 150);
  };

  const handleContinueWithDefault = async () => {
    CyberTheme.haptics.light();
    if (dontShowAgain) {
      await SQLiteDatabaseService.saveSetting(DONT_SHOW_AGAIN_KEY, 'true');
    }
    closeByokPrompt();
  };

  return (
    <Modal
      visible={isByokPromptVisible}
      transparent
      animationType="fade"
      onRequestClose={closeByokPrompt}
    >
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          {/* Top Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={closeByokPrompt}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="#64748B" />
          </TouchableOpacity>

          {/* Icon Badge */}
          <View style={styles.iconCircle}>
            <Key size={24} color="#38BDF8" />
          </View>

          {/* Header Title & Subtitle */}
          <Text style={styles.title}>Add your Gemini API Key</Text>
          <Text style={styles.subtitle}>
            Unlock customized AI titles, high-precision topic tags, and direct on-device speed with
            your own Google Gemini credentials.
          </Text>

          {/* Benefit Bullets */}
          <View style={styles.benefitList}>
            <View style={styles.benefitRow}>
              <Sparkles size={14} color="#38BDF8" />
              <Text style={styles.benefitText}>Custom AI tags & precise summarization</Text>
            </View>
            <View style={styles.benefitRow}>
              <ShieldCheck size={14} color="#38BDF8" />
              <Text style={styles.benefitText}>Support for Gemini 3.5 Flash, 3.6 & 3.7 models</Text>
            </View>
          </View>

          {/* Don't show again Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setDontShowAgain(!dontShowAgain)}
          >
            <View style={[styles.checkboxBox, dontShowAgain && styles.checkboxBoxChecked]}>
              {dontShowAgain && <Check size={12} color="#FFF" />}
            </View>
            <Text style={styles.checkboxLabel}>Don't show this again</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonCol}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.88}
              onPress={handleAddApiKey}
            >
              <Key size={16} color="#0F1015" />
              <Text style={styles.primaryBtnText}>Add API Key</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.8}
              onPress={handleContinueWithDefault}
            >
              <Text style={styles.secondaryBtnText}>Continue with Default</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#16181F',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  benefitList: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  checkboxBoxChecked: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '400',
  },
  buttonCol: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F1015',
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
