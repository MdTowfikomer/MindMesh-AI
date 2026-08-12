export type MemoryType = 
  | 'image' 
  | 'voice' 
  | 'text' 
  | 'pricing' 
  | 'code' 
  | 'whiteboard' 
  | 'article' 
  | 'quote' 
  | 'video' 
  | 'gif' 
  | 'pdf' 
  | 'bookmark';

export interface EntityTag {
  id: string;
  name: string;
  category: 'topic' | 'feature' | 'pricing' | 'tech' | 'action';
}

export interface DominantColor {
  name: string;
  hex: string;
}

export interface UrlMetadata {
  url: string;
  domain: string;
  author?: string;
  siteName?: string;
  fullText?: string;
  highlights?: string[];
  readTime?: string;
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
  invisibleTags?: string[];
  dominantColors?: DominantColor[];
  urlMetadata?: UrlMetadata;
  mediaUrl?: string;
  fileSize?: string;
  pageCount?: number;
  contextSpace: string; // e.g. "Shipaton", "Pricing", "RevenueCat"
  directory?: string; // e.g. "Shipaton", "Pricing", "MobileUX", "Startup Ideas"
  personalNote?: string;
  createdAt: string;
  deletedAt?: string; // Soft delete timestamp (30-day trash lifecycle)
  confidenceScore?: number; // e.g. 94%
  aspectRatio?: number; // e.g. 1.2 for visual card height calculation
  entities?: EntityTag[];
}

export interface SmartSpace {
  id: string;
  name: string;
  query: string;
  icon?: string;
  createdAt: string;
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
  completedNextActions?: string[]; // Array of completed step texts
  isDeepDiveExpanded?: boolean; // Progressive disclosure state
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
