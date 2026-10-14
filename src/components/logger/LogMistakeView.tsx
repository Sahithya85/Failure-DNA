import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Tag,
  Dna,
} from 'lucide-react';
import { useFailureDNA } from '../../context/FailureDNAContext';
import { ActiveTab, MistakeCategory, MistakeRecord, MistakeSeverity, OutcomeStatus } from '../../types';

interface LogMistakeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectMistake: (mistake: MistakeRecord) => void;
}

export const LogMistakeView: React.FC<LogMistakeViewProps> = ({ setActiveTab, onSelectMistake }) => {
  const { addMistake, isAnalyzing, serverHealth } = useFailureDNA();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MistakeCategory>('Coding');
  const [severity, setSeverity] = useState<MistakeSeverity>('Medium');
  const [attempted, setAttempted] = useState('');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [suspectedReason, setSuspectedReason] = useState('');
  const [attemptedFix, setAttemptedFix] = useState('');
  const [finalOutcome, setFinalOutcome] = useState('');
  const [outcomeStatus, setOutcomeStatus] = useState<OutcomeStatus>('Resolved');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tagsInput, setTagsInput] = useState('');
  const [runAi, setRunAi] = useState(true);

  // Status & feedback state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdMistake, setCreatedMistake] = useState<MistakeRecord | null>(null);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!attempted.trim()) errors.attempted = 'Please describe what you attempted';
    if (!whatWentWrong.trim()) errors.whatWentWrong = 'Please describe what went wrong';
    if (!expectedResult.trim()) errors.expectedResult = 'Please describe the expected outcome';
    if (!actualResult.trim()) errors.actualResult = 'Please describe what actually happened';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const result = await addMistake(
      {
        title: title.trim(),
        category,
        severity,
        attempted: attempted.trim(),
        whatWentWrong: whatWentWrong.trim(),
        expectedResult: expectedResult.trim(),
        actualResult: actualResult.trim(),
        suspectedReason: suspectedReason.trim() || 'Not specified',
        attemptedFix: attemptedFix.trim() || 'None attempted yet',
        finalOutcome: finalOutcome.trim() || 'Investigation pending',
        outcomeStatus,
        date,
        tags,
      },
      runAi
    );

    if (result.success && result.mistake) {
      setCreatedMistake(result.mistake);
      if (result.error) {
        setSubmitError(`Mistake saved manually. Note: ${result.error}`);
      }
    } else {
      setSubmitError(result.error || 'Failed to record mistake.');
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setAttempted('');
    setWhatWentWrong('');
    setExpectedResult('');
    setActualResult('');
    setSuspectedReason('');
    setAttemptedFix('');
    setFinalOutcome('');
    setTagsInput('');
    setCreatedMistake(null);
    setSubmitError(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Success Modal / Banner */}
      {createdMistake && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/70 border border-cyan-500/50 shadow-xl shadow-purple-950/50 space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Incident Recorded & Evaluated Successfully!
                </h3>
                <p className="text-xs text-slate-400">{createdMistake.title}</p>
              </div>
            </div>
            <button
              onClick={handleResetForm}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800"
            >
              Log Another
            </button>
          </div>

          {createdMistake.aiAnalysis ? (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Gemini Postmortem Synthesis
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {createdMistake.aiAnalysis.detectedPatternCandidate}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {createdMistake.aiAnalysis.summary}
              </p>

              {createdMistake.aiAnalysis.likelyRootCauses.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Primary Root Cause Identified:
                  </span>
                  <div className="text-xs text-cyan-300 font-medium">
                    {createdMistake.aiAnalysis.likelyRootCauses[0].cause}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    <span className="text-slate-500">Supporting Evidence: </span>
                    {createdMistake.aiAnalysis.likelyRootCauses[0].evidence}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => onSelectMistake(createdMistake)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-950/90 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5"
                >
                  Inspect Full Postmortem <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('failure-dna')}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-950/80 text-purple-300 hover:bg-purple-900 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Dna className="w-3.5 h-3.5" />
                  Check Failure DNA Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              Saved manually to your history. You can run AI diagnostics at any time from My Mistakes.
            </div>
          )}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-5">
          {/* Section 1: Core Mistake Overview */}
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              1. Incident Identification
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Name the breakdown and classify its severity and domain.
            </p>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mistake Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Unhandled Null Pointer Exception on Stripe Webhook Payload"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                  validationErrors.title ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {validationErrors.title && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.title}
                </p>
              )}
            </div>

            {/* Category & Severity & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MistakeCategory)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="Coding">Coding</option>
                  <option value="Learning">Learning</option>
                  <option value="Time Management">Time Management</option>
                  <option value="Communication">Communication</option>
                  <option value="Decision Making">Decision Making</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as MistakeSeverity)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="Low">Low (Trivial glitch)</option>
                  <option value="Medium">Medium (Feature blocked)</option>
                  <option value="High">High (Service degraded)</option>
                  <option value="Critical">Critical (Outage / Data loss)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Empirical Reconstruction */}
          <div className="border-b border-slate-800/80 pb-4 pt-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              2. Empirical Reconstruction
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Provide exact details on what you attempted versus what actually happened.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                What Were You Attempting to Accomplish? <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Add idempotency key verification to webhook handler..."
                value={attempted}
                onChange={(e) => setAttempted(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  validationErrors.attempted ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {validationErrors.attempted && (
                <p className="text-xs text-rose-400 mt-1">{validationErrors.attempted}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                What Went Wrong? <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. When the event payload lacked an event.data.object field, an unhandled exception occurred..."
                value={whatWentWrong}
                onChange={(e) => setWhatWentWrong(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  validationErrors.whatWentWrong ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {validationErrors.whatWentWrong && (
                <p className="text-xs text-rose-400 mt-1">{validationErrors.whatWentWrong}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Expected Result <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Expected system behavior..."
                  value={expectedResult}
                  onChange={(e) => setExpectedResult(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    validationErrors.expectedResult ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Actual Result <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Actual outcome observed..."
                  value={actualResult}
                  onChange={(e) => setActualResult(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                    validationErrors.actualResult ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic Reasoning & Fixes */}
          <div className="border-b border-slate-800/80 pb-4 pt-2">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              3. Diagnostic Reasoning & Fix Attempt
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Record your initial hypothesis, attempted remediation, and resolution state.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Suspected Reason (Your Initial Theory)
              </label>
              <input
                type="text"
                placeholder="e.g. Assumed all Stripe payloads include data.object without optional chaining"
                value={suspectedReason}
                onChange={(e) => setSuspectedReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  What Did You Try to Fix It?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Added optional chaining payload?.data?.object and schema guard..."
                  value={attemptedFix}
                  onChange={(e) => setAttemptedFix(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Final Outcome
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Webhook parser handles partial payloads cleanly without throwing 500..."
                  value={finalOutcome}
                  onChange={(e) => setFinalOutcome(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Outcome Status
                </label>
                <select
                  value={outcomeStatus}
                  onChange={(e) => setOutcomeStatus(e.target.value as OutcomeStatus)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="Resolved">Resolved (Fully remediated)</option>
                  <option value="Partially Resolved">Partially Resolved (Mitigated)</option>
                  <option value="Workaround Found">Workaround Found (Temporary patch)</option>
                  <option value="Unresolved">Unresolved (Still failing)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tags (comma-separated)
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="webhook, stripe, null-check, api"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Option & Submission Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={runAi}
                onChange={(e) => setRunAi(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-700"
              />
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Analyze with Gemini Postmortem Engine (Deduce root cause & tests)
              </span>
            </label>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-950/60 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Synthesizing Postmortem...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Mistake Entry</span>
                </>
              )}
            </button>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
