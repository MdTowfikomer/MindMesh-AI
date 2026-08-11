import { BuildPlan, SerendipityConnection } from '../types/mindmesh';

/**
 * Hallmark Anti-AI-Slop Engine & Quality Gate
 * Enforces crisp, grounded, minimalistic language. Rejects fluff, buzzwords, and AI cliches.
 */

// Dictionary of prohibited AI slop terms and their direct anti-slop replacements
const SLOP_DICTIONARY: Record<string, string> = {
  'delve into': 'explore',
  'delve': 'examine',
  'leverage': 'use',
  'leveraging': 'using',
  'game-changer': 'key feature',
  'game changer': 'key feature',
  'seamlessly integrate': 'connect',
  'seamlessly': 'directly',
  'seamless': 'simple',
  'tapestry': 'network',
  'rich tapestry': 'combination',
  'synergy': 'fit',
  'synergies': 'fits',
  'paradigm shift': 'major change',
  'transformative': 'effective',
  'supercharge': 'accelerate',
  'unleash': 'enable',
  'unleashing': 'enabling',
  'holistic': 'complete',
  'empower': 'allow',
  'empowers': 'allows',
  'cutting-edge': 'modern',
  'cutting edge': 'modern',
  'state-of-the-art': 'modern',
  'testament to': 'proof of',
  'testament': 'proof',
  'pivotal': 'important',
  'beacon': 'signal',
  'realm': 'area',
  'revolutionize': 'improve',
  'elevate': 'upgrade',
  'foster': 'build',
  'curated experience': 'workflow',
  'groundbreaking': 'novel',
  'spearhead': 'lead',
  'harness': 'use',
  'harnessing': 'using',
  'robust': 'reliable',
  'unparalleled': 'strong',
  'nexus': 'center',
  'unlock your potential': 'ship faster',
  'supercharged': 'fast',
};

export interface SlopAudit {
  slopScore: number; // 100% = 100/100 Hallmark Clean
  isPassed: boolean;
  flaggedWords: string[];
  cleanText: string;
  slopCount: number;
  wordCount: number;
  hallmarkGrade: 'A+' | 'A' | 'B' | 'F';
}

export class SlopGate {
  /**
   * Audits raw text against the Hallmark Anti-AI-Slop dictionary
   */
  public static auditText(text: string): SlopAudit {
    if (!text) {
      return {
        slopScore: 100,
        isPassed: true,
        flaggedWords: [],
        cleanText: '',
        slopCount: 0,
        wordCount: 0,
        hallmarkGrade: 'A+'
      };
    }

    const lowerText = text.toLowerCase();
    const words = text.trim().split(/\s+/);
    const wordCount = words.length;

    const flaggedWords: string[] = [];
    let sanitized = text;

    // Scan for slop patterns
    Object.keys(SLOP_DICTIONARY).forEach((slopTerm) => {
      const regex = new RegExp(`\\b${slopTerm}\\b`, 'gi');
      if (regex.test(sanitized)) {
        flaggedWords.push(slopTerm);
        const replacement = SLOP_DICTIONARY[slopTerm];
        sanitized = sanitized.replace(regex, (match) => {
          // Preserve capitalization rule
          if (match[0] === match[0].toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }
          return replacement;
        });
      }
    });

    const slopCount = flaggedWords.length;
    // Score calculation: 100% minus 15% penalty per slop word found (min 0%)
    const slopScore = Math.max(0, 100 - slopCount * 15);
    const isPassed = slopScore >= 80;

    let hallmarkGrade: 'A+' | 'A' | 'B' | 'F' = 'A+';
    if (slopScore === 100) hallmarkGrade = 'A+';
    else if (slopScore >= 85) hallmarkGrade = 'A';
    else if (slopScore >= 70) hallmarkGrade = 'B';
    else hallmarkGrade = 'F';

    return {
      slopScore,
      isPassed,
      flaggedWords,
      cleanText: sanitized,
      slopCount,
      wordCount,
      hallmarkGrade
    };
  }

  /**
   * Verifies and cleans a BuildPlan object through Hallmark Slop-Test Gates
   */
  public static verifyBuildPlan(plan: BuildPlan): { plan: BuildPlan; audit: SlopAudit } {
    let totalSlopCount = 0;
    const allFlagged: string[] = [];

    // Audit PRD
    const prdProb = this.auditText(plan.prd.problemStatement);
    const prdPersona = this.auditText(plan.prd.targetPersona);
    totalSlopCount += prdProb.slopCount + prdPersona.slopCount;
    allFlagged.push(...prdProb.flaggedWords, ...prdPersona.flaggedWords);

    const cleanFeatures = plan.prd.coreFeatures.map(f => {
      const titleAudit = this.auditText(f.title);
      const descAudit = this.auditText(f.description);
      totalSlopCount += titleAudit.slopCount + descAudit.slopCount;
      allFlagged.push(...titleAudit.flaggedWords, ...descAudit.flaggedWords);
      return {
        ...f,
        title: titleAudit.cleanText,
        description: descAudit.cleanText
      };
    });

    // Audit RevenueCat strategy
    const freeRules = plan.revenueCatStrategy.freeTierRules.map(r => {
      const a = this.auditText(r);
      totalSlopCount += a.slopCount;
      allFlagged.push(...a.flaggedWords);
      return a.cleanText;
    });

    const proBenefits = plan.revenueCatStrategy.proTierBenefits.map(b => {
      const a = this.auditText(b);
      totalSlopCount += a.slopCount;
      allFlagged.push(...a.flaggedWords);
      return a.cleanText;
    });

    // Compute overall gate score
    const finalScore = Math.max(0, 100 - totalSlopCount * 10);
    const isPassed = finalScore >= 80;

    const cleanedPlan: BuildPlan = {
      ...plan,
      title: this.auditText(plan.title).cleanText,
      subtitle: this.auditText(plan.subtitle).cleanText,
      prd: {
        problemStatement: prdProb.cleanText,
        targetPersona: prdPersona.cleanText,
        coreFeatures: cleanFeatures
      },
      revenueCatStrategy: {
        ...plan.revenueCatStrategy,
        freeTierRules: freeRules,
        proTierBenefits: proBenefits
      },
      slopGateScore: finalScore,
      slopGateStatus: isPassed ? 'PASSED' : 'REJECTED',
      slopWordsRemoved: totalSlopCount,
      hallmarkVerified: true
    };

    return {
      plan: cleanedPlan,
      audit: {
        slopScore: finalScore,
        isPassed,
        flaggedWords: Array.from(new Set(allFlagged)),
        cleanText: cleanedPlan.prd.problemStatement,
        slopCount: totalSlopCount,
        wordCount: 150,
        hallmarkGrade: finalScore === 100 ? 'A+' : finalScore >= 85 ? 'A' : 'B'
      }
    };
  }

  /**
   * Verifies and cleans a SerendipityConnection object through Hallmark Slop-Test Gates
   */
  public static verifyConnection(conn: SerendipityConnection): { connection: SerendipityConnection; audit: SlopAudit } {
    let totalSlopCount = 0;
    const allFlagged: string[] = [];

    const titleAudit = this.auditText(conn.title);
    totalSlopCount += titleAudit.slopCount;
    allFlagged.push(...titleAudit.flaggedWords);

    const cleanWhy = conn.explainabilityWhy.map(w => {
      const a = this.auditText(w);
      totalSlopCount += a.slopCount;
      allFlagged.push(...a.flaggedWords);
      return a.cleanText;
    });

    const quoteAudit = this.auditText(conn.evidenceProof.quoteSnippet);
    totalSlopCount += quoteAudit.slopCount;
    allFlagged.push(...quoteAudit.flaggedWords);

    const buildIdeaAudit = this.auditText(conn.suggestedBuildIdea);
    totalSlopCount += buildIdeaAudit.slopCount;
    allFlagged.push(...buildIdeaAudit.flaggedWords);

    let cleanGuidance = conn.actionableGuidance;
    if (conn.actionableGuidance) {
      const p1 = this.auditText(conn.actionableGuidance.paragraph1);
      const p2 = this.auditText(conn.actionableGuidance.paragraph2);
      totalSlopCount += p1.slopCount + p2.slopCount;
      allFlagged.push(...p1.flaggedWords, ...p2.flaggedWords);
      cleanGuidance = { paragraph1: p1.cleanText, paragraph2: p2.cleanText };
    }

    let cleanNextActions = conn.nextActions;
    if (conn.nextActions) {
      cleanNextActions = conn.nextActions.map(action => {
        const a = this.auditText(action);
        totalSlopCount += a.slopCount;
        allFlagged.push(...a.flaggedWords);
        return a.cleanText;
      });
    }

    const finalScore = Math.max(0, 100 - totalSlopCount * 12);
    const isPassed = finalScore >= 80;

    const cleanedConnection: SerendipityConnection = {
      ...conn,
      title: titleAudit.cleanText,
      explainabilityWhy: cleanWhy,
      evidenceProof: {
        ...conn.evidenceProof,
        quoteSnippet: quoteAudit.cleanText
      },
      suggestedBuildIdea: buildIdeaAudit.cleanText,
      actionableGuidance: cleanGuidance,
      nextActions: cleanNextActions,
      slopGateScore: finalScore,
      slopGateStatus: isPassed ? 'PASSED' : 'REJECTED',
      slopWordsRemoved: totalSlopCount,
      hallmarkVerified: true
    };

    return {
      connection: cleanedConnection,
      audit: {
        slopScore: finalScore,
        isPassed,
        flaggedWords: Array.from(new Set(allFlagged)),
        cleanText: cleanedConnection.title,
        slopCount: totalSlopCount,
        wordCount: 80,
        hallmarkGrade: finalScore === 100 ? 'A+' : finalScore >= 85 ? 'A' : 'B'
      }
    };
  }
}
