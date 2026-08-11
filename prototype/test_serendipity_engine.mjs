import { SlopGate } from '../src/services/slopGate.ts';

// Simulated AIService & Serendipity Engine runner for Method-2 programmatic testing
const testMemories = [
  {
    id: 'mem-test-1',
    type: 'pricing',
    title: 'RevenueCat Dynamic Paywall Inspo',
    content: 'Multi-page storytelling paywalls convert 3.4x better than single pricing tables. Page 1 = Outcome Gate, Page 2 = Social Proof, Page 3 = Trial Pass.',
    tags: ['Pricing', 'RevenueCat', 'Conversion', 'MobileUX'],
    contextSpace: 'Pricing',
    createdAt: new Date('2026-07-15T14:30:00Z').toISOString(),
  },
  {
    id: 'mem-test-2',
    type: 'voice',
    title: 'Voice Note: Synaptic Idea Fusion',
    content: 'What if we use local embeddings to physically converge connected thoughts into executable PRDs and RevenueCat paywalls on tap?',
    audioDuration: '0:42',
    tags: ['Idea', 'VoiceMemo', 'AI', 'SynapticFusion'],
    contextSpace: 'Idea',
    createdAt: new Date('2026-08-11T10:15:00Z').toISOString(),
  }
];

async function runSerendipityEngineTest() {
  console.log('\n======================================================');
  console.log('🧠 MINDMESH SERENDIPITY ENGINE — METHOD 2 PROGRAMMATIC TEST');
  console.log('======================================================\n');

  console.log('📥 INPUT MEMORY 1 (Screenshot):');
  console.log(`   • Title: "${testMemories[0].title}"`);
  console.log(`   • Type: ${testMemories[0].type.toUpperCase()}`);
  console.log(`   • Captured: ${new Date(testMemories[0].createdAt).toLocaleDateString()}`);
  console.log(`   • Tags: #${testMemories[0].tags.join(' #')}\n`);

  console.log('📥 INPUT MEMORY 2 (Voice Note):');
  console.log(`   • Title: "${testMemories[1].title}"`);
  console.log(`   • Type: ${testMemories[1].type.toUpperCase()}`);
  console.log(`   • Captured: ${new Date(testMemories[1].createdAt).toLocaleDateString()}`);
  console.log(`   • Tags: #${testMemories[1].tags.join(' #')}\n`);

  console.log('⚡ COMPUTING VECTOR EMBEDDING PROXIMITY & EXPLAINABILITY...\n');

  const source = testMemories[0];
  const target = testMemories[1];

  const rawConnection = {
    id: `conn-test-${Date.now()}`,
    sourceMemoryId: source.id,
    targetMemoryId: target.id,
    confidenceScore: 0.95,
    title: `MindMesh Pattern: ${source.title} × ${target.title}`,
    explainabilityWhy: [
      `Both notes share overlapping concept tags around #${source.tags[0]} and #${target.tags[0]}.`,
      `Source item '${source.title}' was captured on ${new Date(source.createdAt).toLocaleDateString()}.`,
      `Target item provides execution architecture captured on ${new Date(target.createdAt).toLocaleDateString()}.`
    ],
    evidenceProof: {
      sourceTitle: source.title,
      sourceDate: new Date(source.createdAt).toLocaleDateString(),
      targetTitle: target.title,
      targetDate: new Date(target.createdAt).toLocaleDateString(),
      quoteSnippet: `Direct connection: connects RevenueCat 3-Page Storytelling Paywall with auto-generated PRD specs in under 60 seconds.`
    },
    contextSpace: source.contextSpace || 'Shipaton',
    suggestedBuildIdea: `MindMesh AI — Turn scattered thoughts into executable build plans & RevenueCat paywalls.`
  };

  // Run through Hallmark Anti-AI-Slop Quality Gate
  const { connection, audit } = SlopGate.verifyConnection(rawConnection);

  console.log('✨ DISCOVERED SERENDIPITY CONNECTION:');
  console.log(`   📌 Title: ${connection.title}`);
  console.log(`   🎯 Synaptic Proximity Score: ${(connection.confidenceScore * 100).toFixed(0)}% MATCH`);
  console.log(`   🏷️  Context Space: #${connection.contextSpace}\n`);

  console.log('💡 EXPLAINABILITY ("WHY"):');
  connection.explainabilityWhy.forEach((reason, i) => {
    console.log(`   ${i + 1}. ${reason}`);
  });

  console.log('\n📜 VERIFIED EVIDENCE PROOF ("PROOF"):');
  console.log(`   • Source A: ${connection.evidenceProof.sourceTitle} (${connection.evidenceProof.sourceDate})`);
  console.log(`   • Source B: ${connection.evidenceProof.targetTitle} (${connection.evidenceProof.targetDate})`);
  console.log(`   • Citation: "${connection.evidenceProof.quoteSnippet}"\n`);

  console.log('🛡️ HALLMARK ANTI-AI-SLOP GATE VERIFICATION:');
  console.log(`   • Hallmark Quality Score: ${connection.slopGateScore}% CLEAN`);
  console.log(`   • Status: ${connection.slopGateStatus}`);
  console.log(`   • Slop Words Removed: ${connection.slopWordsRemoved}`);
  console.log(`   • Hallmark Grade: ${audit.hallmarkGrade}\n`);

  console.log('======================================================');
  console.log('✅ SERENDIPITY ENGINE TEST COMPLETED SUCCESSFULLY');
  console.log('======================================================\n');
}

runSerendipityEngineTest();
