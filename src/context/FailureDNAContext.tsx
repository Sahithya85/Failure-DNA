import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  FailurePatternProfile,
  InvestigationResult,
  MistakeRecord,
  OutcomeStatus,
  PreventionTask,
} from '../types';
import {
  checkServerHealth,
  HealthCheckResponse,
  requestMistakeAnalysis,
  requestPatternDetection,
} from '../services/api';
import { DEMO_MISTAKES, DEMO_PATTERNS, DEMO_PREVENTION_TASKS } from '../data/demoData';

interface FailureDNAContextType {
  mistakes: MistakeRecord[];
  patterns: FailurePatternProfile[];
  preventionTasks: PreventionTask[];
  investigations: InvestigationResult[];
  serverHealth: HealthCheckResponse | null;
  isAnalyzing: boolean;
  isDetectingPatterns: boolean;
  hasLoadedInitial: boolean;
  addMistake: (
    mistakeData: Omit<MistakeRecord, 'id' | 'createdAt' | 'updatedAt' | 'aiAnalysis'>,
    runAiAnalysis: boolean
  ) => Promise<{ success: boolean; mistake: MistakeRecord; error?: string }>;
  updateMistake: (id: string, updates: Partial<MistakeRecord>) => void;
  deleteMistake: (id: string) => void;
  reanalyzeMistake: (id: string) => Promise<{ success: boolean; error?: string }>;
  runPatternDetection: () => Promise<{ success: boolean; message?: string; count?: number }>;
  updatePattern: (id: string, updates: Partial<FailurePatternProfile>) => void;
  deletePattern: (id: string) => void;
  addPreventionTask: (task: Omit<PreventionTask, 'id' | 'createdAt'>) => void;
  updatePreventionTask: (id: string, updates: Partial<PreventionTask>) => void;
  deletePreventionTask: (id: string) => void;
  validateTaskOutcome: (
    id: string,
    result: 'Prevented Recurrence' | 'Partial Success' | 'Mistake Recurred',
    notes: string
  ) => void;
  saveInvestigation: (investigation: InvestigationResult) => void;
  deleteInvestigation: (id: string) => void;
  loadDemoData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => void;
  exportDataCSV: () => void;
  importDataJSON: (jsonString: string) => { success: boolean; error?: string };
  refreshHealth: () => Promise<void>;
}

const FailureDNAContext = createContext<FailureDNAContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MISTAKES: 'failuredna_mistakes_v1',
  PATTERNS: 'failuredna_patterns_v1',
  TASKS: 'failuredna_tasks_v1',
  INVESTIGATIONS: 'failuredna_investigations_v1',
  HAS_VISITED: 'failuredna_has_visited_v1',
};

export const FailureDNAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [patterns, setPatterns] = useState<FailurePatternProfile[]>([]);
  const [preventionTasks, setPreventionTasks] = useState<PreventionTask[]>([]);
  const [investigations, setInvestigations] = useState<InvestigationResult[]>([]);
  const [serverHealth, setServerHealth] = useState<HealthCheckResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDetectingPatterns, setIsDetectingPatterns] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Initialize from localStorage or first-time load
  useEffect(() => {
    try {
      const storedMistakes = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      const storedPatterns = localStorage.getItem(STORAGE_KEYS.PATTERNS);
      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const storedInvestigations = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
      const hasVisited = localStorage.getItem(STORAGE_KEYS.HAS_VISITED);

      if (storedMistakes) {
        setMistakes(JSON.parse(storedMistakes));
      } else if (!hasVisited) {
        // First time visitor gets rich demo dataset so they immediately experience the full platform
        setMistakes(DEMO_MISTAKES);
        setPatterns(DEMO_PATTERNS);
        setPreventionTasks(DEMO_PREVENTION_TASKS);
        localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(DEMO_MISTAKES));
        localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(DEMO_PATTERNS));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEMO_PREVENTION_TASKS));
        localStorage.setItem(STORAGE_KEYS.HAS_VISITED, 'true');
        setHasLoadedInitial(true);
        return;
      }

      if (storedPatterns) setPatterns(JSON.parse(storedPatterns));
      if (storedTasks) setPreventionTasks(JSON.parse(storedTasks));
      if (storedInvestigations) setInvestigations(JSON.parse(storedInvestigations));
    } catch (e) {
      console.error('Failed to load data from localStorage:', e);
    } finally {
      setHasLoadedInitial(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!hasLoadedInitial) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
    } catch (e) {
      console.error('Failed to persist mistakes:', e);
    }
  }, [mistakes, hasLoadedInitial]);

  useEffect(() => {
    if (!hasLoadedInitial) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(patterns));
    } catch (e) {
      console.error('Failed to persist patterns:', e);
    }
  }, [patterns, hasLoadedInitial]);

  useEffect(() => {
    if (!hasLoadedInitial) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(preventionTasks));
    } catch (e) {
      console.error('Failed to persist tasks:', e);
    }
  }, [preventionTasks, hasLoadedInitial]);

  useEffect(() => {
    if (!hasLoadedInitial) return;
    try {
      localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
    } catch (e) {
      console.error('Failed to persist investigations:', e);
    }
  }, [investigations, hasLoadedInitial]);

  // Check backend server health
  const refreshHealth = async () => {
    const health = await checkServerHealth();
    setServerHealth(health);
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  // 1. Add mistake with optional Gemini analysis
  const addMistake = async (
    mistakeData: Omit<MistakeRecord, 'id' | 'createdAt' | 'updatedAt' | 'aiAnalysis'>,
    runAiAnalysis: boolean
  ) => {
    const newId = `mstk_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newMistake: MistakeRecord = {
      ...mistakeData,
      id: newId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    let analysisError: string | undefined;

    if (runAiAnalysis) {
      setIsAnalyzing(true);
      const historySummary = mistakes.slice(0, 8).map((m) => ({
        id: m.id,
        title: m.title,
        category: m.category,
        suspectedReason: m.suspectedReason,
        outcomeStatus: m.outcomeStatus,
      }));

      const analysisResponse = await requestMistakeAnalysis(newMistake, historySummary);
      setIsAnalyzing(false);

      if (analysisResponse.success && analysisResponse.analysis) {
        newMistake.aiAnalysis = analysisResponse.analysis;

        // Automatically create a prevention task if a high-leverage immediate action is suggested
        if (analysisResponse.analysis.immediateCorrectiveAction) {
          const autoTask: PreventionTask = {
            id: `task_${Date.now()}`,
            title: analysisResponse.analysis.immediateCorrectiveAction,
            description: `Auto-generated from mistake: ${newMistake.title}. Suggested prevention: ${analysisResponse.analysis.longTermPreventionStrategy}`,
            category: newMistake.category,
            priority: newMistake.severity === 'Critical' ? 'High' : newMistake.severity === 'High' ? 'Medium' : 'Low',
            relatedMistakeId: newMistake.id,
            completed: false,
            createdAt: new Date().toISOString(),
          };
          setPreventionTasks((prev) => [autoTask, ...prev]);
        }
      } else {
        analysisError = analysisResponse.error || 'AI analysis could not be completed';
      }
    }

    setMistakes((prev) => [newMistake, ...prev]);

    return {
      success: true,
      mistake: newMistake,
      error: analysisError,
    };
  };

  // 2. Update mistake
  const updateMistake = (id: string, updates: Partial<MistakeRecord>) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
  };

  // 3. Delete mistake
  const deleteMistake = (id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
    // Also remove from prevention tasks relatedMistakeId references
    setPreventionTasks((prev) => prev.filter((t) => t.relatedMistakeId !== id));
  };

  // 4. Re-analyze a mistake
  const reanalyzeMistake = async (id: string) => {
    const target = mistakes.find((m) => m.id === id);
    if (!target) return { success: false, error: 'Mistake not found' };

    setIsAnalyzing(true);
    const historySummary = mistakes
      .filter((m) => m.id !== id)
      .slice(0, 8)
      .map((m) => ({
        id: m.id,
        title: m.title,
        category: m.category,
        suspectedReason: m.suspectedReason,
        outcomeStatus: m.outcomeStatus,
      }));

    const result = await requestMistakeAnalysis(target, historySummary);
    setIsAnalyzing(false);

    if (result.success && result.analysis) {
      updateMistake(id, { aiAnalysis: result.analysis });
      return { success: true };
    }

    return { success: false, error: result.error || 'Re-analysis failed' };
  };

  // 5. Run Pattern Detection across whole mistake history
  const runPatternDetection = async () => {
    if (mistakes.length < 2) {
      return {
        success: false,
        message: 'At least 2 mistake records are needed to detect recurring Failure DNA patterns.',
      };
    }

    setIsDetectingPatterns(true);
    const result = await requestPatternDetection(mistakes);
    setIsDetectingPatterns(false);

    if (result.success && result.patterns) {
      setPatterns(result.patterns);

      // Auto-extract high priority prevention tasks from newly discovered patterns
      result.patterns.forEach((pat) => {
        if (pat.preventionChecklist && pat.preventionChecklist.length > 0) {
          const firstCheck = pat.preventionChecklist[0];
          const exists = preventionTasks.some((t) => t.title === firstCheck);
          if (!exists) {
            const newTask: PreventionTask = {
              id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              title: firstCheck,
              description: `Recommended habit: ${pat.recommendedHabit || pat.description}`,
              category: (pat.category as any) || 'Decision Making',
              priority: 'High',
              patternId: pat.id,
              patternName: pat.name,
              completed: false,
              createdAt: new Date().toISOString(),
            };
            setPreventionTasks((prev) => [newTask, ...prev]);
          }
        }
      });

      return {
        success: true,
        count: result.patterns.length,
        message: `Discovered ${result.patterns.length} Failure DNA patterns across ${mistakes.length} mistakes.`,
      };
    }

    return {
      success: false,
      message: result.error || result.message || 'Pattern detection failed',
    };
  };

  // 6. Pattern updates (allow user corrections)
  const updatePattern = (id: string, updates: Partial<FailurePatternProfile>) => {
    setPatterns((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePattern = (id: string) => {
    setPatterns((prev) => prev.filter((p) => p.id !== id));
  };

  // 7. Prevention Tasks
  const addPreventionTask = (taskData: Omit<PreventionTask, 'id' | 'createdAt'>) => {
    const newTask: PreventionTask = {
      ...taskData,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPreventionTasks((prev) => [newTask, ...prev]);
  };

  const updatePreventionTask = (id: string, updates: Partial<PreventionTask>) => {
    setPreventionTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deletePreventionTask = (id: string) => {
    setPreventionTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const validateTaskOutcome = (
    id: string,
    result: 'Prevented Recurrence' | 'Partial Success' | 'Mistake Recurred',
    notes: string
  ) => {
    setPreventionTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              outcomeValidation: {
                nextAttemptResult: result,
                validationNotes: notes,
                validatedAt: new Date().toISOString(),
              },
            }
          : t
      )
    );
  };

  // 8. Investigations
  const saveInvestigation = (inv: InvestigationResult) => {
    setInvestigations((prev) => [inv, ...prev.filter((i) => i.id !== inv.id)]);
  };

  const deleteInvestigation = (id: string) => {
    setInvestigations((prev) => prev.filter((i) => i.id !== id));
  };

  // 9. Load Demo Data
  const loadDemoData = () => {
    setMistakes(DEMO_MISTAKES);
    setPatterns(DEMO_PATTERNS);
    setPreventionTasks(DEMO_PREVENTION_TASKS);
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(DEMO_MISTAKES));
    localStorage.setItem(STORAGE_KEYS.PATTERNS, JSON.stringify(DEMO_PATTERNS));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEMO_PREVENTION_TASKS));
  };

  // 10. Clear All Data
  const clearAllData = () => {
    setMistakes([]);
    setPatterns([]);
    setPreventionTasks([]);
    setInvestigations([]);
    localStorage.removeItem(STORAGE_KEYS.MISTAKES);
    localStorage.removeItem(STORAGE_KEYS.PATTERNS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.INVESTIGATIONS);
  };

  // 11. Export JSON
  const exportDataJSON = () => {
    const data = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      mistakes,
      patterns,
      preventionTasks,
      investigations,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failure-dna-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 12. Export CSV (Mistakes)
  const exportDataCSV = () => {
    if (mistakes.length === 0) return;
    const headers = [
      'ID',
      'Title',
      'Category',
      'Severity',
      'Outcome Status',
      'Date',
      'What Attempted',
      'What Went Wrong',
      'Suspected Reason',
      'Attempted Fix',
      'Final Outcome',
      'Pattern Candidate',
    ];

    const escapeCSV = (str: string = '') => `"${str.replace(/"/g, '""').replace(/\n/g, ' ')}"`;

    const rows = mistakes.map((m) => [
      m.id,
      escapeCSV(m.title),
      m.category,
      m.severity,
      m.outcomeStatus,
      m.date,
      escapeCSV(m.attempted),
      escapeCSV(m.whatWentWrong),
      escapeCSV(m.suspectedReason),
      escapeCSV(m.attemptedFix),
      escapeCSV(m.finalOutcome),
      escapeCSV(m.aiAnalysis?.detectedPatternCandidate || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failure-dna-mistakes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 13. Import JSON
  const importDataJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.mistakes)) {
        setMistakes(parsed.mistakes);
      }
      if (Array.isArray(parsed.patterns)) {
        setPatterns(parsed.patterns);
      }
      if (Array.isArray(parsed.preventionTasks)) {
        setPreventionTasks(parsed.preventionTasks);
      }
      if (Array.isArray(parsed.investigations)) {
        setInvestigations(parsed.investigations);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid JSON file' };
    }
  };

  return (
    <FailureDNAContext.Provider
      value={{
        mistakes,
        patterns,
        preventionTasks,
        investigations,
        serverHealth,
        isAnalyzing,
        isDetectingPatterns,
        hasLoadedInitial,
        addMistake,
        updateMistake,
        deleteMistake,
        reanalyzeMistake,
        runPatternDetection,
        updatePattern,
        deletePattern,
        addPreventionTask,
        updatePreventionTask,
        deletePreventionTask,
        validateTaskOutcome,
        saveInvestigation,
        deleteInvestigation,
        loadDemoData,
        clearAllData,
        exportDataJSON,
        exportDataCSV,
        importDataJSON,
        refreshHealth,
      }}
    >
      {children}
    </FailureDNAContext.Provider>
  );
};

export const useFailureDNA = () => {
  const context = useContext(FailureDNAContext);
  if (!context) {
    throw new Error('useFailureDNA must be used within a FailureDNAProvider');
  }
  return context;
};
