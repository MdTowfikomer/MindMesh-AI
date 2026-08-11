import { MemoryItem, SerendipityConnection, BuildPlan } from '../types/mindmesh';

export const seedMemories: MemoryItem[] = [
  {
    id: 'mem-linkedin',
    type: 'image',
    title: 'A LinkedIn post listing 10 open source programs for engineering students in 2026.',
    content: 'A LinkedIn post listing top 10 open source programs for engineering students in 2026. Includes GSoC, GitHub Externship, Linux Foundation, MLH Fellowship, and LFX Mentorships.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    ocrText: 'A LinkedIn post listing top 10 open source programs for engineering students in 2026.',
    tags: ['Screenshot', 'tech', 'student opportunity', 'GitHub', 'career', 'programming', 'internship', 'GSoC', 'engineering'],
    contextSpace: 'Shipaton',
    createdAt: '2026-08-11T12:00:00Z',
    confidenceScore: 0.98,
    aspectRatio: 1.25,
  },
  {
    id: 'mem-1',
    type: 'pricing',
    title: 'RevenueCat Dynamic Paywall Inspo',
    content: 'Multi-page storytelling paywalls convert 3.4x better than single pricing tables. Page 1 = Outcome Gate, Page 2 = Social Proof, Page 3 = Trial Pass.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    ocrText: 'REVENUECAT PAYWALL ANALYTICS: 3-Page Storytelling Flow + Swipe Exit Discount (50% OFF)',
    tags: ['Pricing', 'RevenueCat', 'Conversion', 'MobileUX'],
    contextSpace: 'Pricing',
    createdAt: '2026-07-15T14:30:00Z',
    confidenceScore: 0.96,
    aspectRatio: 1.3,
  },
  {
    id: 'mem-2',
    type: 'voice',
    title: 'Voice Note: Synaptic Idea Fusion',
    content: 'What if we don\'t just store notes like mymind, but use local embeddings to physically converge connected ideas into executable PRDs and RevenueCat paywalls on tap?',
    audioDuration: '0:42',
    audioWaveform: [20, 45, 80, 60, 95, 30, 75, 90, 40, 60, 85, 100, 50, 30, 70, 85, 40],
    tags: ['Idea', 'VoiceMemo', 'AI', 'SynapticFusion', 'BuildPlan'],
    contextSpace: 'Idea',
    createdAt: '2026-08-11T10:15:00Z',
    confidenceScore: 0.94,
    aspectRatio: 0.9,
  },
  {
    id: 'mem-3',
    type: 'text',
    title: 'White Minimalist & Luxury Editorial UI',
    content: 'Combine Cormorant Garamond serif headers with Plus Jakarta Sans body. Clean white background (#FFFFFF) with subtle radial gradients in indigo & purple.',
    tags: ['Minimalism', 'Design', 'Typography', 'SwissMinimalism', 'Editorial'],
    contextSpace: 'MobileUX',
    createdAt: '2026-08-09T18:20:00Z',
    confidenceScore: 0.89,
    aspectRatio: 1.1,
  },
  {
    id: 'mem-4',
    type: 'image',
    title: 'Tactile Node Connection Particle UI',
    content: 'Skia canvas particle nodes connecting related notes. Glowing synaptic threads connecting pricing models with voice note blurbs.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    ocrText: 'SYNAPTIC PARTICLES: Physics-driven node graph with spring tension',
    tags: ['UI', 'Skia', 'Particles', 'Serendipity'],
    contextSpace: 'Shipaton',
    createdAt: '2026-08-04T09:00:00Z',
    confidenceScore: 0.91,
    aspectRatio: 1.4,
  },
  {
    id: 'mem-5',
    type: 'code',
    title: 'RevenueCat Entitlement Check Snippet',
    content: `import Purchases from 'react-native-purchases';

const checkProAccess = async () => {
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.entitlements.active['Pro Access'] !== undefined;
};`,
    tags: ['Code', 'RevenueCat', 'SDK', 'MobileSDK'],
    contextSpace: 'RevenueCat',
    createdAt: '2026-08-02T16:45:00Z',
    confidenceScore: 0.98,
    aspectRatio: 1.2,
  },
  {
    id: 'mem-6',
    type: 'whiteboard',
    title: 'Serendipity Engine Explainability Flow',
    content: 'Explainable AI connection: 1) Extract entities 2) Calculate cosine distance 3) Highlight exact quotes from past notes to prove relationship.',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    ocrText: 'EXPLAINABILITY PROOF: [ Screenshot Aug 1 ] + [ Voice Note July 14 ]',
    tags: ['Architecture', 'Serendipity', 'Explainability'],
    contextSpace: 'Shipaton',
    createdAt: '2026-07-28T11:20:00Z',
    confidenceScore: 0.88,
    aspectRatio: 1.25,
  }
];

export const seedConnection: SerendipityConnection = {
  id: 'conn-1',
  sourceMemoryId: 'mem-1',
  targetMemoryId: 'mem-2',
  confidenceScore: 0.95,
  title: 'Dynamic RevenueCat Storytelling Paywall + AI Synaptic Build Plan',
  explainabilityWhy: [
    'Both thoughts focus on converting captured ideas directly into product features.',
    'Mem-1 provides the pricing strategy (3-Page Storytelling Paywall + Swipe Exit Offer).',
    'Mem-2 provides the core AI engine (Local embedding convergence into executable Build Plans).'
  ],
  evidenceProof: {
    sourceTitle: 'RevenueCat Dynamic Paywall Inspo (Screenshot)',
    sourceDate: 'July 15, 2026',
    targetTitle: 'Voice Note: Synaptic Idea Fusion (Audio)',
    targetDate: 'August 11, 2026',
    quoteSnippet: 'Connects RevenueCat 3-Page Storytelling Paywall with auto-generated PRD specs in under 60 seconds.'
  },
  contextSpace: 'Shipaton',
  suggestedBuildIdea: 'MindMesh AI — Turn scattered thoughts into executable build plans & RevenueCat paywalls.',
  actionableGuidance: {
    paragraph1: 'Pattern Discovered: Your RevenueCat pricing screenshot from July 15 directly connects with your voice note recorded today. Together, they form a clear product opportunity around automated subscription onboarding and storytelling paywalls.',
    paragraph2: 'What To Do Next: Rather than letting these saved fragments rot in your camera roll, you can combine the pricing mechanics from your screenshot with your voice note concept to ship a high-converting mobile feature.'
  },
  nextActions: [
    '1. Validate pricing model (3-Page Storytelling Paywall + 7-Day Free Trial offer).',
    '2. Configure RevenueCat SDK entitlement checks to gate premium Build Plan exports.',
    '3. Launch a dynamic 50% discount exit offer to capture undecided trial users.'
  ],
  slopGateScore: 100,
  slopGateStatus: 'PASSED',
  slopWordsRemoved: 0,
  hallmarkVerified: true,
};

export const seedBuildPlan: BuildPlan = {
  id: 'plan-1',
  title: 'MindMesh AI Mobile App & Paywall Spec',
  subtitle: 'Generated from 2 connected thoughts: RevenueCat Paywall Inspo + Synaptic Voice Note',
  connectedMemoryIds: ['mem-1', 'mem-2', 'mem-5'],
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
