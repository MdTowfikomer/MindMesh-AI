import { create } from 'zustand';
import { MemoryItem, SerendipityConnection, BuildPlan, UserStats, SmartSpace } from '../types/mindmesh';
import { seedMemories, seedBuildPlan } from '../data/seedMemories';
import { SerendipityEngine } from '../services/serendipityEngine';
import { SQLiteDatabaseService } from '../services/sqliteDatabase';
import { SoundEffects } from '../services/soundEffects';

interface MemoryStoreState {
  memories: MemoryItem[]; // Active non-deleted memories
  trash: MemoryItem[]; // Soft deleted memories (30-day lifecycle)
  savedSmartSpaces: SmartSpace[];
  connections: SerendipityConnection[];
  activeBuildPlan: BuildPlan | null;
  selectedMemory: MemoryItem | null;
  isMemoryDetailVisible: boolean;
  isTrashModalVisible: boolean;
  isArticleReaderVisible: boolean;
  isPdfViewerVisible: boolean;
  activeContextSpace: string; // 'All' | 'Shipaton' | 'Pricing' | 'RevenueCat' | 'MobileUX'
  searchQuery: string;
  isRecordingVoice: boolean;
  isOnboardingCompleted: boolean;
  isPaywallVisible: boolean;
  isShareSheetVisible: boolean;
  isBuildPlanModalVisible: boolean;
  isSynapticFusing: boolean;
  isGeneratingConnections: boolean;
  userStats: UserStats;

  // Actions
  addMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => void;
  deleteMemory: (id: string) => void; // Soft delete -> move to trash
  restoreMemory: (id: string) => void; // Restore from trash
  purgeMemory: (id: string) => void; // Permanent deletion
  emptyTrash: () => void;
  openTrashModal: () => void;
  closeTrashModal: () => void;
  openArticleReader: (memory: MemoryItem) => void;
  closeArticleReader: () => void;
  openPdfViewer: (memory: MemoryItem) => void;
  closePdfViewer: () => void;
  saveArticleHighlight: (memoryId: string, highlightText: string) => void;
  createSmartSpace: (name: string, query: string, icon?: string) => void;
  deleteSmartSpace: (id: string) => void;
  openMemoryDetail: (memory: MemoryItem) => void;
  closeMemoryDetail: () => void;
  updateMemoryTags: (id: string, tags: string[]) => void;
  updateMemoryNote: (id: string, note: string) => void;
  updateMemoryDirectory: (id: string, directory: string) => void;
  setActiveContextSpace: (space: string) => void;
  setSearchQuery: (query: string) => void;
  setIsRecordingVoice: (recording: boolean) => void;
  completeOnboarding: () => void;
  openPaywall: () => void;
  closePaywall: () => void;
  openShareSheet: () => void;
  closeShareSheet: () => void;
  openBuildPlanModal: () => void;
  closeBuildPlanModal: () => void;
  triggerSynapticFusion: () => void;
  generateConnections: () => Promise<void>;
  deepDiveConnection: (connectionId: string) => Promise<void>;
  unlockProAccess: () => void;
  toggleNextAction: (connectionId: string, actionText: string) => void;
  loadStoredMemories: () => Promise<void>;
  isSettingsModalVisible: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  isByokPromptVisible: boolean;
  openByokPrompt: () => void;
  closeByokPrompt: () => void;
  triggerByokPromptIfNeeded: () => Promise<void>;
  byokConfig: import('../services/byokService').BYOKConfig;
  setByokConfig: (config: import('../services/byokService').BYOKConfig) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  toastMessage: string | null;
  toastType: 'success' | 'error' | null;
  showToast: (message: string, type?: 'success' | 'error', durationMs?: number) => void;
  hideToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useMemoryStore = create<MemoryStoreState>((set) => ({
  memories: seedMemories.filter((m) => !m.deletedAt),
  trash: seedMemories.filter((m) => !!m.deletedAt),
  savedSmartSpaces: [],
  connections: [],
  activeBuildPlan: seedBuildPlan,
  isSaving: false,
  setIsSaving: (saving: boolean) => set({ isSaving: saving }),
  toastMessage: null,
  toastType: null,
  isSettingsModalVisible: false,
  openSettingsModal: () => set({ isSettingsModalVisible: true }),
  closeSettingsModal: () => set({ isSettingsModalVisible: false }),
  isByokPromptVisible: false,
  openByokPrompt: () => set({ isByokPromptVisible: true }),
  closeByokPrompt: () => set({ isByokPromptVisible: false }),
  triggerByokPromptIfNeeded: async () => {
    try {
      const { ByokService } = await import('../services/byokService');
      const hasCustom = await ByokService.hasCustomKey();
      if (hasCustom) return;

      const { SQLiteDatabaseService } = await import('../services/sqliteDatabase');
      const dismissed = await SQLiteDatabaseService.getSetting('byok_prompt_dont_show_again');
      if (dismissed === 'true') return;

      set({ isByokPromptVisible: true });
    } catch (e) {
      console.warn('[MemoryStore] triggerByokPrompt error:', e);
    }
  },
  byokConfig: {
    apiKey: null,
    model: 'gemini-3.5-flash',
    isVerified: false,
  },
  setByokConfig: (config) => set({ byokConfig: config }),

  showToast: (message: string, type: 'success' | 'error' = 'success', durationMs = 3500) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastMessage: message, toastType: type });
    toastTimer = setTimeout(() => {
      set({ toastMessage: null, toastType: null });
    }, durationMs);
  },

  hideToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastMessage: null, toastType: null });
  },

  loadStoredMemories: async () => {
    try {
      await SQLiteDatabaseService.initDatabase();
      const sqliteMemories = await SQLiteDatabaseService.getAllMemories();
      const sqliteBuildPlan = await SQLiteDatabaseService.getLatestBuildPlan();

      // Load BYOK configuration
      const { ByokService } = await import('../services/byokService');
      const byok = await ByokService.loadConfig();
      set({ byokConfig: byok });

      if (sqliteMemories.length > 0) {
        set({ memories: sqliteMemories });
      } else {
        // Seed initial memories into SQLite if database is fresh
        for (const seedMem of seedMemories.filter((m) => !m.deletedAt)) {
          await SQLiteDatabaseService.saveMemory(seedMem);
        }
        const seeded = await SQLiteDatabaseService.getAllMemories();
        if (seeded.length > 0) {
          set({ memories: seeded });
        }
      }

      if (sqliteBuildPlan) {
        set({ activeBuildPlan: sqliteBuildPlan });
      }
    } catch (error) {
      console.error('[MemoryStore] Failed to load stored memories from SQLite:', error);
    }
  },
  selectedMemory: null,
  isMemoryDetailVisible: false,
  isTrashModalVisible: false,
  isArticleReaderVisible: false,
  isPdfViewerVisible: false,
  activeContextSpace: 'All',
  searchQuery: '',
  isRecordingVoice: false,
  isOnboardingCompleted: true,
  isPaywallVisible: false,
  isShareSheetVisible: false,
  isBuildPlanModalVisible: false,
  isSynapticFusing: false,
  isGeneratingConnections: false,
  userStats: {
    capturesCount: 17,
    discoveriesCount: 4,
    buildPlansCount: 2,
    shippedProjectsCount: 1,
    isPro: true,
  },

  addMemory: (memoryData) => {
    SoundEffects.playSaveSound();
    const newMemory: MemoryItem = {
      ...memoryData,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    SQLiteDatabaseService.saveMemory(newMemory);
    set((state) => ({
      memories: [newMemory, ...state.memories],
      userStats: {
        ...state.userStats,
        capturesCount: state.userStats.capturesCount + 1,
      },
    }));
  },

  deleteMemory: (id) => {
    SQLiteDatabaseService.deleteMemory(id);
    set((state) => {
      const target = state.memories.find((m) => m.id === id);
      if (!target) return state;
      const softDeleted: MemoryItem = { ...target, deletedAt: new Date().toISOString() };
      return {
        memories: state.memories.filter((m) => m.id !== id),
        trash: [softDeleted, ...state.trash],
        isMemoryDetailVisible: state.selectedMemory?.id === id ? false : state.isMemoryDetailVisible,
        selectedMemory: state.selectedMemory?.id === id ? null : state.selectedMemory,
      };
    });
  },

  restoreMemory: (id) => {
    set((state) => {
      const target = state.trash.find((m) => m.id === id);
      if (!target) return state;
      const restored: MemoryItem = { ...target, deletedAt: undefined };
      SQLiteDatabaseService.saveMemory(restored);
      return {
        trash: state.trash.filter((m) => m.id !== id),
        memories: [restored, ...state.memories],
      };
    });
  },

  purgeMemory: (id) => {
    set((state) => ({
      trash: state.trash.filter((m) => m.id !== id),
    }));
  },

  emptyTrash: () => set({ trash: [] }),

  openTrashModal: () => set({ isTrashModalVisible: true }),
  closeTrashModal: () => set({ isTrashModalVisible: false }),

  openArticleReader: (memory) => set({ selectedMemory: memory, isArticleReaderVisible: true }),
  closeArticleReader: () => set({ isArticleReaderVisible: false }),

  openPdfViewer: (memory) => set({ selectedMemory: memory, isPdfViewerVisible: true }),
  closePdfViewer: () => set({ isPdfViewerVisible: false }),

  saveArticleHighlight: (memoryId, highlightText) => {
    set((state) => {
      const updatedMemories = state.memories.map((m) => {
        if (m.id === memoryId && m.urlMetadata) {
          const currentHighlights = m.urlMetadata.highlights || [];
          return {
            ...m,
            urlMetadata: {
              ...m.urlMetadata,
              highlights: [highlightText, ...currentHighlights],
            },
          };
        }
        return m;
      });

      const updatedSelected =
        state.selectedMemory?.id === memoryId && state.selectedMemory.urlMetadata
          ? {
              ...state.selectedMemory,
              urlMetadata: {
                ...state.selectedMemory.urlMetadata,
                highlights: [highlightText, ...(state.selectedMemory.urlMetadata.highlights || [])],
              },
            }
          : state.selectedMemory;

      return { memories: updatedMemories, selectedMemory: updatedSelected };
    });
  },

  createSmartSpace: (name, query, icon) => {
    set((state) => ({
      savedSmartSpaces: [
        ...state.savedSmartSpaces,
        { id: `sp-${Date.now()}`, name, query, icon: icon || 'Bookmark', createdAt: new Date().toISOString() },
      ],
    }));
  },

  deleteSmartSpace: (id) => {
    set((state) => ({
      savedSmartSpaces: state.savedSmartSpaces.filter((sp) => sp.id !== id),
    }));
  },

  openMemoryDetail: (memory) => set({ selectedMemory: memory, isMemoryDetailVisible: true }),
  closeMemoryDetail: () => set({ isMemoryDetailVisible: false, selectedMemory: null }),

  updateMemoryTags: (id, tags) => {
    set((state) => {
      const updatedMemories = state.memories.map((m) => {
        if (m.id === id) {
          const updated = { ...m, tags };
          SQLiteDatabaseService.saveMemory(updated);
          return updated;
        }
        return m;
      });
      const updatedSelected = state.selectedMemory?.id === id ? { ...state.selectedMemory, tags } : state.selectedMemory;
      return { memories: updatedMemories, selectedMemory: updatedSelected };
    });
  },

  updateMemoryNote: (id, personalNote) => {
    set((state) => {
      const updatedMemories = state.memories.map((m) => {
        if (m.id === id) {
          const updated = { ...m, personalNote };
          SQLiteDatabaseService.saveMemory(updated);
          return updated;
        }
        return m;
      });
      const updatedSelected = state.selectedMemory?.id === id ? { ...state.selectedMemory, personalNote } : state.selectedMemory;
      return { memories: updatedMemories, selectedMemory: updatedSelected };
    });
  },

  updateMemoryDirectory: (id, directory) => {
    set((state) => {
      const updatedMemories = state.memories.map((m) => {
        if (m.id === id) {
          const updated = { ...m, directory, contextSpace: directory };
          SQLiteDatabaseService.saveMemory(updated);
          return updated;
        }
        return m;
      });
      const updatedSelected = state.selectedMemory?.id === id ? { ...state.selectedMemory, directory, contextSpace: directory } : state.selectedMemory;
      return { memories: updatedMemories, selectedMemory: updatedSelected };
    });
  },

  setActiveContextSpace: (space) => set({ activeContextSpace: space }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsRecordingVoice: (recording) => set({ isRecordingVoice: recording }),
  completeOnboarding: () => set({ isOnboardingCompleted: true }),
  openPaywall: () => set({ isPaywallVisible: true }),
  closePaywall: () => set({ isPaywallVisible: false }),
  openShareSheet: () => set({ isShareSheetVisible: true }),
  closeShareSheet: () => set({ isShareSheetVisible: false }),
  openBuildPlanModal: () => set({ isBuildPlanModalVisible: true }),
  closeBuildPlanModal: () => set({ isBuildPlanModalVisible: false }),

  triggerSynapticFusion: () => {
    set({ isSynapticFusing: true });
    setTimeout(() => {
      set({ isSynapticFusing: false });
    }, 2500);
  },

  generateConnections: async () => {
    const state = useMemoryStore.getState();
    const allMemories = state.memories;
    if (allMemories.length < 2 || state.isGeneratingConnections) return;

    set({ isGeneratingConnections: true, isSynapticFusing: true });

    try {
      // Stage 1: Fast discovery — title + guidance
      const connection = await SerendipityEngine.discoverConnection(allMemories);
      if (connection) {
        set((s) => ({
          connections: [connection, ...s.connections],
          isGeneratingConnections: false,
          isSynapticFusing: false,
          userStats: { ...s.userStats, discoveriesCount: s.userStats.discoveriesCount + 1 },
        }));
      } else {
        set({ isGeneratingConnections: false, isSynapticFusing: false });
      }
    } catch (error) {
      console.warn('generateConnections failed:', error);
      set({ isGeneratingConnections: false, isSynapticFusing: false });
    }
  },

  deepDiveConnection: async (connectionId: string) => {
    const state = useMemoryStore.getState();
    const connection = state.connections.find(c => c.id === connectionId);
    if (!connection) return;

    // Already has next steps? No need to call again
    if (connection.nextActions && connection.nextActions.length > 0) return;

    try {
      // Stage 2: Deep dive — fills next steps, evidence, explainability
      const userMemories = state.memories.filter(m => /^mem-\d+$/.test(m.id));
      const enriched = await SerendipityEngine.deepDiveConnection(connection, userMemories);
      if (enriched) {
        set((s) => ({
          connections: s.connections.map(c => c.id === connectionId ? enriched : c),
        }));
      }
    } catch (error) {
      console.warn('deepDiveConnection failed:', error);
    }
  },

  unlockProAccess: () => {
    set((state) => ({
      userStats: { ...state.userStats, isPro: true },
      isPaywallVisible: false,
    }));
  },

  toggleNextAction: (connectionId: string, actionText: string) => {
    set((state) => {
      const updatedConnections = state.connections.map((conn) => {
        if (conn.id === connectionId) {
          const currentCompleted = conn.completedNextActions || [];
          const isAlreadyCompleted = currentCompleted.includes(actionText);
          const nextCompleted = isAlreadyCompleted
            ? currentCompleted.filter((t) => t !== actionText)
            : [...currentCompleted, actionText];
          return { ...conn, completedNextActions: nextCompleted };
        }
        return conn;
      });
      return { connections: updatedConnections };
    });
  },
}));
