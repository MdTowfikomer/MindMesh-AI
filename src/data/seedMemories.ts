import { MemoryItem, SerendipityConnection, BuildPlan } from '../types/mindmesh';

export const seedMemories: MemoryItem[] = [
  {
    id: 'mem-shipathon-official',
    type: 'article',
    title: 'RevenueCat Shipathon 2026: Compete for $1M in Prizes',
    content: 'Join the world’s biggest mobile hackathon. Build and ship your app with in-app purchases, compete for $1M in prizes, and launch on the App Store.',
    imageUrl: 'https://pbs.twimg.com/media/HO8Yt-gXwAAEUVJ.jpg?name=orig',
    tags: ['Shipaton', 'RevenueCat', 'Hackathon', 'Mobile'],
    invisibleTags: ['shipathon 2026', 'revenuecat hackathon', 'in-app purchases', 'mobile developer'],
    dominantColors: [
      { name: 'dark', hex: '#0F1015' },
      { name: 'amber', hex: '#F59E0B' }
    ],
    urlMetadata: {
      url: 'https://x.com/RevenueCat/status/2084912626392543637',
      domain: 'x.com',
      author: 'RevenueCat (@RevenueCat)',
      siteName: 'X (formerly Twitter)',
      readTime: '1 min read',
    },
    contextSpace: 'Shipaton',
    createdAt: '2026-08-11T14:10:00Z',
    confidenceScore: 0.99,
    aspectRatio: 1.0,
  },
  {
    id: 'mem-paywall-inspo',
    type: 'pricing',
    title: 'RevenueCat Dashboard, Paywalls & Charts',
    content: 'Learn how to configure RevenueCat in-app subscriptions, track MRR & churn cohorts, and deploy dynamic paywalls in real-time.',
    imageUrl: 'https://i.ytimg.com/vi/hCmUEb4hwHA/hqdefault.jpg',
    ocrText: 'REVENUECAT DASHBOARD AND CHARTS: Real-time MRR, Active Trials, and Paywall Optimization',
    tags: ['Pricing', 'RevenueCat', 'Analytics', 'MobileUX'],
    invisibleTags: ['subscription revenue', 'freemium conversion', 'in-app purchases', 'revenuecat dashboard'],
    dominantColors: [
      { name: 'red', hex: '#EF4444' },
      { name: 'warm tone', hex: '#F97316' }
    ],
    urlMetadata: {
      url: 'https://www.youtube.com/watch?v=hCmUEb4hwHA',
      domain: 'youtube.com',
      author: 'RevenueCat',
      siteName: 'YouTube',
    },
    contextSpace: 'Pricing',
    createdAt: '2026-08-10T14:30:00Z',
    confidenceScore: 0.96,
    aspectRatio: 1.33,
  },
  {
    id: 'mem-voice-shipathon',
    type: 'voice',
    title: 'Voice Note: Shipathon Submission Vision',
    content: 'What if we build an AI note-taking vault that doesn’t just archive ideas, but automatically detects monetization opportunities and drafts RevenueCat paywall blueprints?',
    audioDuration: '0:38',
    audioWaveform: [20, 45, 80, 60, 95, 30, 75, 90, 40, 60, 85, 100, 50, 30, 70, 85, 40],
    tags: ['Ideas', 'VoiceMemo', 'RevenueCat', 'Shipaton'],
    invisibleTags: ['vector similarity', 'on-device ai', 'autonomous synthesis'],
    contextSpace: 'Ideas',
    createdAt: '2026-08-10T10:15:00Z',
    confidenceScore: 0.94,
    aspectRatio: 0.9,
  },
  {
    id: 'mem-quote-pg',
    type: 'quote',
    title: 'Paul Graham on Building Great Products',
    content: '“Simple things should be simple, complex things should be possible. The rarest quality in software is discipline.”',
    tags: ['Ideas', 'Quote', 'Philosophy', 'Startup'],
    invisibleTags: ['ycombinator', 'simplicity', 'design principles', 'discipline'],
    urlMetadata: {
      url: 'https://paulgraham.com/simplicity.html',
      domain: 'paulgraham.com',
      author: 'Paul Graham',
      siteName: 'Paul Graham Essays'
    },
    contextSpace: 'Ideas',
    createdAt: '2026-08-07T09:30:00Z',
    confidenceScore: 0.97,
    aspectRatio: 0.85,
  }
];

export const seedConnection: SerendipityConnection = {
  id: 'conn-1',
  sourceMemoryId: 'mem-paywall-inspo',
  targetMemoryId: 'mem-voice-shipathon',
  confidenceScore: 0.95,
  title: 'RevenueCat Dashboard Paywalls + AI Synaptic Fusion',
  explainabilityWhy: [
    'Both thoughts focus on converting captured ideas directly into product features.',
    'RevenueCat Dashboard breakdown provides the monetization architecture.',
    'Voice note provides the core AI engine (Local embedding convergence into executable mobile apps).'
  ],
  evidenceProof: {
    sourceTitle: 'RevenueCat Dashboard, Paywalls & Charts (YouTube)',
    sourceDate: 'August 10, 2026',
    targetTitle: 'Voice Note: Shipathon Submission Vision (Audio)',
    targetDate: 'August 10, 2026',
    quoteSnippet: 'Connects RevenueCat Dashboard with AI note-taking vault monetization in under 60 seconds.'
  },
  contextSpace: 'Shipaton',
  suggestedBuildIdea: 'MindMesh AI — Turn scattered thoughts into executable build plans & RevenueCat paywalls.',
  actionableGuidance: {
    paragraph1: 'Pattern Discovered: Your RevenueCat Dashboard & Paywall research directly connects with your voice note recorded for the Shipathon. Together, they form a clear product opportunity around automated subscription onboarding.',
    paragraph2: 'What To Do Next: Combine the RevenueCat analytics & paywall mechanics with your voice note concept to ship a high-converting mobile feature.'
  },
  nextActions: [
    '1. Validate pricing model (3-Page Storytelling Paywall + 7-Day Free Trial offer).',
    '2. Configure RevenueCat SDK entitlement checks to gate premium exports.',
    '3. Launch a dynamic 50% discount exit offer to capture undecided trial users.'
  ],
  slopGateScore: 100,
  slopGateStatus: 'PASSED',
  slopWordsRemoved: 0,
  hallmarkVerified: true,
  npuInferenceMs: 34,
};

export const seedBuildPlan: BuildPlan = {
  id: 'plan-1',
  title: 'MindMesh AI Mobile App & Paywall Spec',
  subtitle: 'Generated from 2 connected thoughts: RevenueCat Dashboard + Synaptic Voice Note',
  connectedMemoryIds: ['mem-paywall-inspo', 'mem-voice-shipathon'],
  prd: {
    problemStatement: 'Founders save dozens of screenshots and voice notes weekly but fail to synthesize them into product specs.',
    targetPersona: 'Indie Hackers, Solo Founders, and Mobile Engineers building for hackathons.',
    coreFeatures: [
      { title: '1-Minute Cold-Start Onboarding', description: 'Guided 3-drop capture (Screenshot, Note, Voice) with instant serendipitous connection.', priority: 'P0' },
      { title: 'Synaptic Fusion Skia Reveal', description: 'Physics particle animation merging connected thoughts into a single Build Plan card.', priority: 'P0' },
      { title: 'RevenueCat Storytelling Paywall', description: 'Multipage HAMM narrative paywall flow with entitlement checks and exit offer.', priority: 'P0' },
      { title: 'Build Story Social Exporter', description: 'Generates viral visual cards formatted for X/Twitter, LinkedIn, and Instagram.', priority: 'P1' }
    ]
  },
  techStackSchema: {
    architecture: 'React Native + Expo Router + Zustand + React Native Skia + RevenueCat SDK',
    stack: ['Expo Router v3', 'React Native 0.74', 'Zustand Store', 'React Native Purchases', 'Expo AV'],
    databaseTables: [
      { tableName: 'memories', fields: 'id, type, content, image_url, audio_url, embedding_vec, created_at' },
      { tableName: 'connections', fields: 'id, source_id, target_id, confidence_score, explainability_json, created_at' },
      { tableName: 'build_plans', fields: 'id, title, prd_json, tech_schema_json, revenuecat_json, tasks_json' }
    ]
  },
  revenueCatStrategy: {
    freeTierRules: ['Unlimited Dumps (Text, Voice, Image)', 'Local OCR & Vector Search', '1 Active Connection / week'],
    proTierBenefits: ['Unlimited Serendipity Connections', 'Unlimited Build Plans Export', 'Notion & Markdown Sync'],
    monthlyPrice: '$9.99 / month',
    annualPrice: '$49.99 / year (Save 58%)',
    paywallTriggerRules: 'Triggered when tapping "Generate Build Plan" or viewing Pro Serendipity Insights.',
    sdkSnippet: `import Purchases from 'react-native-purchases';

export const configureRevenueCat = async () => {
  if (Platform.OS === 'ios') {
    await Purchases.configure({ apiKey: 'appl_mock_revenuecat_api_key' });
  }
};`
  },
  taskChecklist: [
    { id: 't1', title: 'Initialize Expo Router with Dark Minimalist tokens', completed: true, category: 'Setup' },
    { id: 't2', title: 'Implement Masonry Visual Memory Feed with seed data', completed: true, category: 'UI' },
    { id: 't3', title: 'Build Synaptic Particle Convergence Animation', completed: true, category: 'Animation' },
    { id: 't4', title: 'Integrate RevenueCat Multipage Storytelling Paywall', completed: true, category: 'Monetization' },
    { id: 't5', title: 'Add Build Story Card Exporter for social sharing', completed: true, category: 'Viral Growth' }
  ],
  slopGateScore: 100,
  slopGateStatus: 'PASSED',
  slopWordsRemoved: 0,
  hallmarkVerified: true,
};
