export type MistakeCategory =
  | 'Coding'
  | 'Learning'
  | 'Time Management'
  | 'Communication'
  | 'Decision Making'
  | 'Other';

export type MistakeSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type OutcomeStatus =
  | 'Resolved'
  | 'Partially Resolved'
  | 'Unresolved'
  | 'Workaround Found';

export interface RootCauseItem {
  cause: string;
  evidence: string;
  confidence: 'High' | 'Medium' | 'Low';
  uncertaintyExplanation: string;
  isHypothesisOnly: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  likelyRootCauses: RootCauseItem[];
  contributingFactors: string[];
  immediateCorrectiveAction: string;
  longTermPreventionStrategy: string;
  practicalVerificationTest: string;
  detectedPatternCandidate: string;
  analyzedAt: string;
  modelUsed: string;
  userCorrection?: {
    correctedPatternName?: string;
    notes?: string;
    correctedAt: string;
  };
}

export interface MistakeRecord {
  id: string;
  title: string;
  category: MistakeCategory;
  severity: MistakeSeverity;
  attempted: string;
  whatWentWrong: string;
  expectedResult: string;
  actualResult: string;
  suspectedReason: string;
  attemptedFix: string;
  finalOutcome: string;
  outcomeStatus: OutcomeStatus;
  date: string; // YYYY-MM-DD
  tags: string[];
  aiAnalysis?: AIAnalysisResult;
  userNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FailurePatternProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  mistakeIds: string[];
  mistakeCount: number;
  commonTriggers: string[];
  warningSigns: string[];
  effectiveFixes: string[];
  ineffectiveFixes: string[];
  preventionChecklist: string[];
  recommendedHabit: string;
  experiment: string;
  successMetric: string;
  status: 'Active' | 'Improving' | 'Resolved';
  userOverride?: {
    customName?: string;
    isDisputed?: boolean;
    userNote?: string;
  };
  lastDetectedAt: string;
}

export interface PreventionTask {
  id: string;
  title: string;
  description: string;
  category: MistakeCategory;
  priority: 'Low' | 'Medium' | 'High';
  patternId?: string;
  patternName?: string;
  relatedMistakeId?: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
  outcomeValidation?: {
    nextAttemptResult: 'Prevented Recurrence' | 'Partial Success' | 'Mistake Recurred';
    validationNotes: string;
    validatedAt: string;
  };
  createdAt: string;
}

export interface InvestigationResult {
  id: string;
  question: string;
  selectedMistakeIds: string[];
  connectionSummary: string;
  evidenceCorrelation: Array<{
    mistakeId: string;
    title: string;
    observedConnection: string;
  }>;
  sharedRootCauses: string[];
  solutionComparison: {
    bestWorkingApproach: string;
    ineffectiveApproaches: string;
    keyDifferentiator: string;
  };
  actionableProtocol: string[];
  confidenceAndLimitations: string;
  createdAt: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'log-mistake'
  | 'my-mistakes'
  | 'failure-dna'
  | 'investigator'
  | 'prevention-tasks'
  | 'timeline'
  | 'settings';
