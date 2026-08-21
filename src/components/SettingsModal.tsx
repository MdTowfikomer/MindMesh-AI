import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronDown,
  Key,
  Cpu,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  Trash2,
  Sparkles,
} from './Icons';
import { useMemoryStore } from '../stores/memoryStore';
import { ByokService, GEMINI_MODEL_PRESETS, BYOKConfig } from '../services/byokService';
import { CyberTheme } from '../theme/cyberLuxury';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalVisible, closeSettingsModal, byokConfig, setByokConfig, showToast } =
    useMemoryStore();

  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [customModelText, setCustomModelText] = useState('');
  const [isCustomModelActive, setIsCustomModelActive] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Test Connection State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (isSettingsModalVisible) {
      ByokService.loadConfig().then((cfg) => {
        setApiKey(cfg.apiKey || '');
        const isPreset = GEMINI_MODEL_PRESETS.some((p) => p.id === cfg.model);
        if (isPreset) {
          setSelectedModel(cfg.model);
          setIsCustomModelActive(false);
          setCustomModelText('');
        } else {
          setSelectedModel('custom');
          setIsCustomModelActive(true);
          setCustomModelText(cfg.model);
        }
        setTestResult(null);
      });
    }
  }, [isSettingsModalVisible]);

  const activeEffectiveModel = isCustomModelActive && customModelText.trim()
    ? customModelText.trim()
    : selectedModel;

  const handleSelectPreset = (modelId: string) => {
    CyberTheme.haptics.light();
    setSelectedModel(modelId);
    setIsCustomModelActive(false);
    setTestResult(null);
  };

  const handleSelectCustom = () => {
    CyberTheme.haptics.light();
    setSelectedModel('custom');
    setIsCustomModelActive(true);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, error: 'Please enter a Gemini API Key to test.' });
      return;
    }

    CyberTheme.haptics.medium();
    setIsTesting(true);
    setTestResult(null);

    const result = await ByokService.testConnection(apiKey.trim(), activeEffectiveModel);
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      CyberTheme.haptics.light();
    }
  };

  const handleSave = async () => {
    CyberTheme.haptics.medium();
    const cleanKey = apiKey.trim() || null;
    const finalModel = activeEffectiveModel || 'gemini-3.5-flash';

    const newConfig: BYOKConfig = {
      apiKey: cleanKey,
      model: finalModel,
      isVerified: Boolean(testResult?.success),
      lastTestedAt: testResult?.success ? Date.now() : undefined,
      latencyMs: testResult?.latencyMs,
    };

    await ByokService.saveConfig(newConfig);
    setByokConfig(newConfig);

    showToast(
      cleanKey ? '✨ Gemini BYOK credentials saved successfully!' : 'Default AI proxy mode active',
      'success'
    );
    closeSettingsModal();
  };

  const handleClearKey = async () => {
    CyberTheme.haptics.medium();
    setApiKey('');
    setSelectedModel('gemini-3.5-flash');
    setIsCustomModelActive(false);
    setCustomModelText('');
    setTestResult(null);

    await ByokService.clearConfig();
    setByokConfig({
      apiKey: null,
      model: 'gemini-3.5-flash',
      isVerified: false,
    });

    showToast('Custom API key removed. Using default proxy.', 'success');
  };

  if (!isSettingsModalVisible) return null;

  return (
    <Modal
      visible={isSettingsModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={closeSettingsModal}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconButton} onPress={closeSettingsModal}>
            <ChevronDown size={22} color="#CBD5E1" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>AI Settings & BYOK</Text>

          <TouchableOpacity
            style={[styles.saveHeaderBtn, apiKey.trim().length > 0 && styles.saveHeaderBtnActive]}
            onPress={handleSave}
          >
            <Text style={styles.saveHeaderBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* BYOK Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroIconBadge}>
                <Key size={20} color="#38BDF8" />
              </View>
              <Text style={styles.heroTitle}>Bring Your Own Key (BYOK)</Text>
              <Text style={styles.heroSub}>
                Plug in your personal Google Gemini API key to execute AI vision analysis,
                intelligent tagging, and serendipity discoveries with direct on-device speed.
              </Text>
            </View>

            {/* API Key Input Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>GEMINI API KEY</Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}
                  style={styles.getKeyLink}
                >
                  <Text style={styles.getKeyLinkText}>Get free key ↗</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.keyInput}
                  placeholder="AIzaSy..."
                  placeholderTextColor="#64748B"
                  value={apiKey}
                  onChangeText={(text) => {
                    setApiKey(text);
                    setTestResult(null);
                  }}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <EyeOff size={18} color="#94A3B8" />
                  ) : (
                    <Eye size={18} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Model Selector Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ACTIVE GEMINI MODEL</Text>
              <View style={styles.modelChipsGrid}>
                {GEMINI_MODEL_PRESETS.map((preset) => {
                  const isSelected = !isCustomModelActive && selectedModel === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[styles.modelChip, isSelected && styles.modelChipActive]}
                      onPress={() => handleSelectPreset(preset.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.modelChipTop}>
                        <Cpu size={14} color={isSelected ? '#38BDF8' : '#64748B'} />
                        <Text style={[styles.modelChipName, isSelected && styles.modelChipNameActive]}>
                          {preset.name}
                        </Text>
                      </View>
                      <Text style={[styles.modelChipDesc, isSelected && styles.modelChipDescActive]}>
                        {preset.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Custom Model Chip */}
                <TouchableOpacity
                  style={[styles.modelChip, isCustomModelActive && styles.modelChipActive]}
                  onPress={handleSelectCustom}
                  activeOpacity={0.85}
                >
                  <View style={styles.modelChipTop}>
                    <Sparkles size={14} color={isCustomModelActive ? '#38BDF8' : '#64748B'} />
                    <Text
                      style={[
                        styles.modelChipName,
                        isCustomModelActive && styles.modelChipNameActive,
                      ]}
                    >
                      Custom Model
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.modelChipDesc,
                      isCustomModelActive && styles.modelChipDescActive,
                    ]}
                  >
                    Type any fine-tuned or experimental model
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Custom Model Text Input (When custom chip selected) */}
              {isCustomModelActive && (
                <View style={styles.customModelInputBox}>
                  <Text style={styles.customModelInputLabel}>MODEL IDENTIFIER:</Text>
                  <TextInput
                    style={styles.customModelInput}
                    placeholder="e.g. gemini-2.0-flash-exp or fine-tuned model"
                    placeholderTextColor="#64748B"
                    value={customModelText}
                    onChangeText={(t) => {
                      setCustomModelText(t);
                      setTestResult(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
            </View>

            {/* Test Connection Action */}
            <View style={styles.testSection}>
              <TouchableOpacity
                style={[
                  styles.testBtn,
                  (!apiKey.trim() || isTesting) && styles.testBtnDisabled,
                ]}
                onPress={handleTestConnection}
                disabled={!apiKey.trim() || isTesting}
                activeOpacity={0.85}
              >
                {isTesting ? (
                  <ActivityIndicator size="small" color="#38BDF8" />
                ) : (
                  <ShieldCheck size={16} color="#38BDF8" />
                )}
                <Text style={styles.testBtnText}>
                  {isTesting ? 'Testing Connection...' : 'Test Connection'}
                </Text>
              </TouchableOpacity>

              {/* Test Result Indicator */}
              {testResult && (
                <View
                  style={[
                    styles.testResultBox,
                    testResult.success ? styles.testResultSuccess : styles.testResultError,
                  ]}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={16} color="#10B981" />
                  ) : (
                    <AlertCircle size={16} color="#F87171" />
                  )}
                  <Text
                    style={[
                      styles.testResultText,
                      testResult.success ? styles.testResultTextSuccess : styles.testResultTextError,
                    ]}
                  >
                    {testResult.success
                      ? `Connected Successfully • ${testResult.latencyMs}ms latency`
                      : testResult.error || 'Connection failed'}
                  </Text>
                </View>
              )}
            </View>

            {/* Security Notice */}
            <View style={styles.securityBox}>
              <ShieldCheck size={16} color="#64748B" />
              <Text style={styles.securityText}>
                Your API key is stored locally and securely in your device's on-device SQLite database.
                It is never sent to or logged on third-party servers.
              </Text>
            </View>

            {/* Remove Key / Reset Button */}
            {byokConfig.apiKey && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearKey}
                activeOpacity={0.85}
              >
                <Trash2 size={15} color="#E11D48" />
                <Text style={styles.clearBtnText}>Remove Custom API Key</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1015',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  saveHeaderBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  saveHeaderBtnActive: {
    backgroundColor: '#38BDF8',
  },
  saveHeaderBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
    gap: 8,
  },
  heroIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  heroSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  getKeyLink: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  getKeyLinkText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    height: 48,
  },
  keyInput: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeBtn: {
    padding: 6,
  },
  modelChipsGrid: {
    gap: 8,
  },
  modelChip: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 4,
  },
  modelChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
  },
  modelChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelChipName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  modelChipNameActive: {
    color: '#F8FAFC',
  },
  modelChipDesc: {
    fontSize: 11,
    color: '#64748B',
    paddingLeft: 22,
  },
  modelChipDescActive: {
    color: '#94A3B8',
  },
  customModelInputBox: {
    backgroundColor: '#181A20',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  customModelInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  customModelInput: {
    fontSize: 13,
    color: '#F8FAFC',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  testSection: {
    gap: 10,
  },
  testBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  testBtnDisabled: {
    opacity: 0.45,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38BDF8',
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  testResultSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
  },
  testResultError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 1,
  },
  testResultText: {
    fontSize: 12,
    flex: 1,
  },
  testResultTextSuccess: {
    color: '#34D399',
  },
  testResultTextError: {
    color: '#F87171',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  securityText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    flex: 1,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFE4E6',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  clearBtnText: {
    fontSize: 13,
    color: '#E11D48',
    fontWeight: '600',
  },
});
