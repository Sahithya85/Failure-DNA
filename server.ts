import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Initialize Google Gen AI with telemetry User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const MODEL_NAME = 'gemini-3.8-flash';

async function createServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      hasApiKey: !!apiKey,
      model: MODEL_NAME,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Analyze single mistake
  app.post('/api/analyze-mistake', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API key not configured on server. Manual entry is supported.',
          isConfigError: true,
        });
      }

      const { mistake, historySummary } = req.body;
      if (!mistake || !mistake.title || !mistake.whatWentWrong) {
        return res.status(400).json({ error: 'Incomplete mistake details provided.' });
      }

      const prompt = `
You are the AI Engine of "Failure DNA" — an intelligent postmortem and root-cause diagnostic system.
Analyze the following recorded mistake objectively without blaming or judging the user.
Distinguish strictly between OBSERVED FACTS / EVIDENCE and INFERRED CAUSES / HYPOTHESES.
Never state certainty if facts are partial or ambiguous; acknowledge uncertainty explicitly.

Mistake Details:
- Title: ${mistake.title}
- Category: ${mistake.category}
- Severity: ${mistake.severity}
- What was attempted: ${mistake.attempted}
- What went wrong: ${mistake.whatWentWrong}
- Expected result: ${mistake.expectedResult}
- Actual result: ${mistake.actualResult}
- Suspected reason (user view): ${mistake.suspectedReason}
- What user tried to fix it: ${mistake.attemptedFix}
- Final outcome: ${mistake.finalOutcome}
- Outcome status: ${mistake.outcomeStatus}

${
  historySummary && historySummary.length > 0
    ? `Recent user mistakes context for pattern awareness:\n${JSON.stringify(historySummary.slice(0, 8), null, 2)}`
    : 'No previous history provided yet.'
}

Respond strictly in valid JSON matching this structure:
{
  "summary": "Concise 2-sentence summary of what failed and the core breakdown point",
  "likelyRootCauses": [
    {
      "cause": "Specific underlying reason (e.g. Asynchronous state update race condition)",
      "evidence": "Concrete facts from the report that substantiate this cause",
      "confidence": "High" | "Medium" | "Low",
      "uncertaintyExplanation": "Why this cause might not be complete or what information is missing",
      "isHypothesisOnly": boolean
    }
  ],
  "contributingFactors": [
    "External or situational factor 1 (e.g. time pressure, ambiguous requirements, skipping edge testing)"
  ],
  "immediateCorrectiveAction": "Direct step to resolve or mitigate the immediate impact",
  "longTermPreventionStrategy": "Systemic procedure, lint rule, checklist item, or workflow adjustment to permanently prevent recurrence",
  "practicalVerificationTest": "One concrete test, experiment, or sanity check to verify if the suspected root cause is indeed the true culprit",
  "detectedPatternCandidate": "Short 2-4 word pattern candidate name (e.g., 'Rushed Execution', 'Incomplete Edge-Case Testing', 'Premature Optimization', 'State Mutation Drift', 'Unvalidated External Assumptions')"
}
`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a rigorous, scientific systems reliability and cognitive failure analyst. You construct disciplined root cause postmortems with high empirical rigor and zero fluff.',
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsedAnalysis = JSON.parse(responseText);

      return res.json({
        success: true,
        analysis: {
          ...parsedAnalysis,
          analyzedAt: new Date().toISOString(),
          modelUsed: MODEL_NAME,
        },
      });
    } catch (err: any) {
      console.error('Error in /api/analyze-mistake:', err);
      return res.status(500).json({
        error: err.message || 'Failed to analyze mistake with Gemini API',
      });
    }
  });

  // 2. Failure DNA Pattern Detection across entire history
  app.post('/api/detect-patterns', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API key not configured on server.',
          isConfigError: true,
        });
      }

      const { mistakes } = req.body;
      if (!Array.isArray(mistakes) || mistakes.length < 2) {
        return res.json({
          success: true,
          patterns: [],
          insufficientData: true,
          message: 'At least 2 mistake records are needed to detect recurring Failure DNA patterns.',
        });
      }

      // Compact the mistakes representation for optimal prompt payload
      const sanitizedMistakes = mistakes.map((m: any) => ({
        id: m.id,
        title: m.title,
        category: m.category,
        date: m.date,
        severity: m.severity,
        attempted: m.attempted,
        whatWentWrong: m.whatWentWrong,
        suspectedReason: m.suspectedReason,
        attemptedFix: m.attemptedFix,
        finalOutcome: m.finalOutcome,
        outcomeStatus: m.outcomeStatus,
        detectedPatternCandidate: m.aiAnalysis?.detectedPatternCandidate || '',
      }));

      const prompt = `
You are the Failure DNA Pattern Engine.
You analyze an engineer/creator's historical mistake records to identify RECURRING FAILURE PATTERNS, common trigger conditions, warning signs, and which previous fixes worked or failed.

Rules:
1. Generate patterns ONLY from real evidence in the provided mistakes. Never invent or hallucinate patterns or past mistakes not present in the input.
2. If there are not enough recurring themes to justify a pattern, return only genuine patterns. Do not fabricate patterns.
3. Every pattern MUST reference the EXACT mistake IDs that belong to it.
4. Separate what fixes worked vs what fixes failed based on the outcomeStatus and finalOutcome in the data.

Mistakes Data:
${JSON.stringify(sanitizedMistakes, null, 2)}

Respond strictly in valid JSON matching this structure:
{
  "patterns": [
    {
      "id": "pat_1",
      "name": "Distinctive Pattern Name (e.g. 'Rushed Execution', 'Incomplete Testing', 'Repeated Configuration Errors', 'Overlooking Edge Cases', 'Knowledge Gaps', etc.)",
      "category": "Primary category (e.g., Coding, Time Management, Decision Making, etc.)",
      "description": "Clear explanation of how this recurring pattern manifests across the user's history",
      "mistakeIds": ["mstk_id_1", "mstk_id_2"],
      "mistakeCount": 2,
      "commonTriggers": [
        "Identified recurring environmental/situational triggers (e.g. deadline pressure, late-night deploys, unverified documentation)"
      ],
      "warningSigns": [
        "Early warning signs or red flags that preceded these mistakes"
      ],
      "effectiveFixes": [
        "Fixes in history that successfully resolved or prevented the issue"
      ],
      "ineffectiveFixes": [
        "Fixes that failed or were merely temporary workarounds"
      ],
      "preventionChecklist": [
        "Concrete checklist item 1",
        "Concrete checklist item 2",
        "Concrete checklist item 3"
      ],
      "recommendedHabit": "Actionable daily/weekly micro-habit or workflow change",
      "experiment": "A safe 1-week experiment to test if this recommendation fixes the root pattern",
      "successMetric": "A measurable metric to track whether this pattern is improving (e.g. 0 race condition bugs in next 3 releases)"
    }
  ],
  "insights": {
    "primaryVulnerability": "Brief summary of the user's most critical recurring vulnerability",
    "strengthsNoted": "What the user actually does well when resolving mistakes",
    "dnaHealthScore": 78
  }
}
`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert behavioural systems engineer and Failure DNA analyst. You detect empirical correlations and recurring structural patterns in postmortems.',
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        patterns: parsedData.patterns || [],
        insights: parsedData.insights || null,
      });
    } catch (err: any) {
      console.error('Error in /api/detect-patterns:', err);
      return res.status(500).json({
        error: err.message || 'Failed to detect patterns with Gemini API',
      });
    }
  });

  // 3. AI Failure Investigator: Multi-mistake correlation & deep postmortem
  app.post('/api/investigate-mistakes', async (req, res) => {
    try {
      if (!ai) {
        return res.status(503).json({
          error: 'Gemini API key not configured on server.',
          isConfigError: true,
        });
      }

      const { mistakes, userQuestion } = req.body;
      if (!Array.isArray(mistakes) || mistakes.length < 2) {
        return res.status(400).json({
          error: 'Please select at least 2 mistakes to investigate connections.',
        });
      }

      const prompt = `
You are the Failure DNA Deep Investigator.
The user has selected ${mistakes.length} specific mistakes from their history and wants an objective, evidence-grounded comparative investigation.

Selected Mistakes:
${JSON.stringify(mistakes, null, 2)}

User Question / Investigation Angle:
${userQuestion || 'Are these mistakes connected? What common cause could explain them? Which previous solution worked best? What should I change next time?'}

Provide a rigorous comparative investigation adhering to these requirements:
1. Reference the selected records by ID and title directly.
2. Explain reasoning using the available evidence. Clearly distinguish proven facts from hypotheses.
3. Compare the attempted solutions: evaluate which approach resolved the problem best and why.
4. Formulate an actionable prevention protocol tailored to these specific mistakes.

Respond strictly in valid JSON matching this structure:
{
  "connectionSummary": "Direct verdict on whether and how these mistakes are fundamentally linked",
  "evidenceCorrelation": [
    {
      "mistakeId": "id",
      "title": "title",
      "observedConnection": "Concrete factor or mechanism linking this mistake to the others"
    }
  ],
  "sharedRootCauses": [
    "Underlying systemic or cognitive cause common to these incidents"
  ],
  "solutionComparison": {
    "bestWorkingApproach": "Which solution from these mistakes had the best long-term outcome and why",
    "ineffectiveApproaches": "Which attempts proved fragile, temporary, or failed",
    "keyDifferentiator": "The crucial difference between the successful fix and the failed ones"
  },
  "actionableProtocol": [
    "Step 1 of the unified prevention protocol",
    "Step 2",
    "Step 3"
  ],
  "confidenceAndLimitations": "Explicit statement of confidence level and what assumptions were made due to missing data"
}
`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior forensic systems engineer conducting cross-incident investigations.',
          responseMimeType: 'application/json',
          temperature: 0.25,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsedInvestigation = JSON.parse(responseText);

      return res.json({
        success: true,
        investigation: parsedInvestigation,
      });
    } catch (err: any) {
      console.error('Error in /api/investigate-mistakes:', err);
      return res.status(500).json({
        error: err.message || 'Failed to conduct investigation with Gemini API',
      });
    }
  });

  // In development, hook Vite middleware; in production, serve built dist files
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Failure DNA] Server running on http://0.0.0.0:${PORT} (Mode: ${isProduction ? 'prod' : 'dev'})`);
  });
}

createServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
