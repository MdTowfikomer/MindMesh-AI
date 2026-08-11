export type MemoryType = 'image' | 'voice' | 'text' | 'pricing' | 'code' | 'whiteboard';

export interface EntityTag {
  id: string;
  name: string;
  category: 'topic' | 'feature' | 'pricing' | 'tech' | 'action';
}

export interface MemoryItem {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  imageUrl?: string;
  audioDuration?: string;
  audioWaveform?: number[];
  ocrText?: string;
  tags: string[];
  contextSpace: string; // e.g. "Shipaton", "Pricing", "RevenueCat"
  directory?: string; // e.g. "Shipaton", "Pricing", "MobileUX", "Startup Ideas"
  personalNote?: string;
  createdAt: string;
  confidenceScore?: number; // e.g. 94%
  aspectRatio?: number; // e.g. 1.2 for visual card height calculation
  entities?: EntityTag[];
}

export interface SerendipityConnection {
  id: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  confidenceScore: number; // e.g., 0.94
  title: string;
  explainabilityWhy: string[];
  evidenceProof: {
    sourceTitle: string;
    sourceDate: string;
    targetTitle: string;
    targetDate: string;
    quoteSnippet: string;
  };
  contextSpace: string;
  suggestedBuildIdea: string;
  actionableGuidance?: {
    paragraph1: string;
    paragraph2: string;
  };
  nextActions?: string[];
  slopGateScore?: number;
  slopGateStatus?: 'PASSED' | 'WARNING' | 'REJECTED';
  slopWordsRemoved?: number;
  hallmarkVerified?: boolean;
}

export interface BuildPlan {
  id: string;
  title: string;
  subtitle: string;
  connectedMemoryIds: string[];
  prd: {
    problemStatement: string;
    targetPersona: string;
    coreFeatures: { title: string; description: string; priority: 'P0' | 'P1' | 'P2' }[];
  };
  techStackSchema: {
    architecture: string;
    stack: string[];
    databaseTables: { tableName: string; fields: string }[];
  };
  revenueCatStrategy: {
    freeTierRules: string[];
    proTierBenefits: string[];
    monthlyPrice: string;
    annualPrice: string;
    paywallTriggerRules: string;
    sdkSnippet: string;
  };
  taskChecklist: { id: string; title: string; completed: boolean; category: string }[];
  slopGateScore?: number;
  slopGateStatus?: 'PASSED' | 'WARNING' | 'REJECTED';
  slopWordsRemoved?: number;
  hallmarkVerified?: boolean;
}

export interface UserStats {
  capturesCount: number;
  discoveriesCount: number;
  buildPlansCount: number;
  shippedProjectsCount: number;
  isPro: boolean;
}
