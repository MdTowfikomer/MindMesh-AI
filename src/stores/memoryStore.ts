import { create } from 'zustand';
import { MemoryItem, SerendipityConnection, BuildPlan, UserStats } from '../types/mindmesh';
import { seedMemories, seedConnection, seedBuildPlan } from '../data/seedMemories';

interface MemoryStoreState {
  memories: MemoryItem[];
  connections: SerendipityConnection[];
  activeBuildPlan: BuildPlan | null;
  selectedMemory: MemoryItem | null;
  isMemoryDetailVisible: boolean;
  activeContextSpace: string; // 'All' | 'Shipaton' | 'Pricing' | 'RevenueCat' | 'MobileUX'
  searchQuery: string;
  isRecordingVoice: boolean;
  isOnboardingCompleted: boolean;
  isPaywallVisible: boolean;
  isShareSheetVisible: boolean;
  isBuildPlanModalVisible: boolean;
  isSynapticFusing: boolean;
  userStats: UserStats;

  // Actions
  addMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => void;
  deleteMemory: (id: string) => void;
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
  unlockProAccess: () => void;
}

export const useMemoryStore = create<MemoryStoreState>((set) => ({
  memories: seedMemories,
  connections: [seedConnection],
  activeBuildPlan: seedBuildPlan,
  selectedMemory: null,
  isMemoryDetailVisible: false,
  activeContextSpace: 'All',
  searchQuery: '',
  isRecordingVoice: false,
  isOnboardingCompleted: true,
  isPaywallVisible: false,
  isShareSheetVisible: false,
  isBuildPlanModalVisible: false,
  isSynapticFusing: false,
  userStats: {
    capturesCount: 17,
    discoveriesCount: 4,
    buildPlansCount: 2,
    shippedProjectsCount: 1,
    isPro: true,
  },

  addMemory: (memoryData) => {
    const newMemory: MemoryItem = {
      ...memoryData,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      memories: [newMemory, ...state.memories],
      userStats: {
        ...state.userStats,
        capturesCount: state.userStats.capturesCount + 1,
      },
    }));
  },

  deleteMemory: (id) => {
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
      isMemoryDetailVisible: state.selectedMemory?.id === id ? false : state.isMemoryDetailVisible,
      selectedMemory: state.selectedMemory?.id === id ? null : state.selectedMemory,
    }));
  },

  openMemoryDetail: (memory) => set({ selectedMemory: memory, isMemoryDetailVisible: true }),
  closeMemoryDetail: () => set({ isMemoryDetailVisible: false, selectedMemory: null }),

  updateMemoryTags: (id, tags) => {
    set((state) => {
      const updatedMemories = state.memories.map((m) => (m.id === id ? { ...m, tags } : m));
      const updatedSelected = state.selectedMemory?.id === id ? { ...state.selectedMemory, tags } : state.selectedMemory;
      return { memories: updatedMemories, selectedMemory: updatedSelected };
    });
  },

  updateMemoryNote: (id, personalNote) => {
    set((state) => {
      const updatedMemories = state.memories.map((m) => (m.id === id ? { ...m, personalNote } : m));
      const updatedSelected = state.selectedMemory?.id === id ? { ...state.selectedMemory, personalNote } : state.selectedMemory;
      return { memories: updatedMemories, selectedMemory: updatedSelected };
    });
  },

  updateMemoryDirectory: (id, directory) => {
    set((state) => {
      const updatedMemories = state.memories.map((m) => (m.id === id ? { ...m, directory, contextSpace: directory } : m));
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

  unlockProAccess: () => {
    set((state) => ({
      userStats: { ...state.userStats, isPro: true },
      isPaywallVisible: false,
    }));
  },
}));
