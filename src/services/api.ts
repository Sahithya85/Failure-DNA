import { AIAnalysisResult, FailurePatternProfile, InvestigationResult, MistakeRecord } from '../types';

export interface HealthCheckResponse {
  status: string;
  hasApiKey: boolean;
  model: string;
  timestamp: string;
}

export async function checkServerHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'error',
      hasApiKey: false,
      model: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function requestMistakeAnalysis(
  mistake: MistakeRecord,
  historySummary?: Array<{ id: string; title: string; category: string; suspectedReason: string; outcomeStatus: string }>
): Promise<{ success: boolean; analysis?: AIAnalysisResult; error?: string }> {
  try {
    const res = await fetch('/api/analyze-mistake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mistake, historySummary }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP error ${res.status}` };
    }

    return { success: true, analysis: data.analysis };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

export async function requestPatternDetection(
  mistakes: MistakeRecord[]
): Promise<{
  success: boolean;
  patterns?: FailurePatternProfile[];
  insights?: { primaryVulnerability: string; strengthsNoted: string; dnaHealthScore: number };
  insufficientData?: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/detect-patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mistakes }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP error ${res.status}` };
    }

    return {
      success: true,
      patterns: data.patterns,
      insights: data.insights,
      insufficientData: data.insufficientData,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

export async function requestInvestigation(
  mistakes: MistakeRecord[],
  userQuestion?: string
): Promise<{ success: boolean; investigation?: InvestigationResult; error?: string }> {
  try {
    const res = await fetch('/api/investigate-mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mistakes, userQuestion }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP error ${res.status}` };
    }

    return {
      success: true,
      investigation: {
        id: `inv_${Date.now()}`,
        ...data.investigation,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}
