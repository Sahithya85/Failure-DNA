import React, { useState } from 'react';
import {
  SearchCode,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  HelpCircle,
  Dna,
  Layers,
  History,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { useFailureDNA } from '../../context/FailureDNAContext';
import { InvestigationResult, MistakeRecord } from '../../types';
import { requestInvestigation } from '../../services/api';
import { CategoryBadge, SeverityBadge } from '../common/ChartWidgets';

interface InvestigatorViewProps {
  onSelectMistake: (mistake: MistakeRecord) => void;
}

export const InvestigatorView: React.FC<InvestigatorViewProps> = ({ onSelectMistake }) => {
  const { mistakes, investigations, saveInvestigation, deleteInvestigation } = useFailureDNA();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationError, setInvestigationError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<InvestigationResult | null>(null);

  const QUESTION_PRESETS = [
    'Are these mistakes connected by an underlying root cause or blind spot?',
    'Which previous solution worked best, and which fixes were merely temporary patches?',
    'What single workflow safeguard will prevent all of these mistakes simultaneously?',
    'What early warning signs appeared in the first mistake that repeated in the second?',
  ];

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRunInvestigation = async (questionText?: string) => {
    const q = questionText || customQuestion || QUESTION_PRESETS[0];
    if (selectedIds.length < 2) {
      setInvestigationError('Please select at least 2 mistakes to investigate connections.');
      return;
    }

    setInvestigationError(null);
    setIsInvestigating(true);

    const chosenMistakes = mistakes.filter((m) => selectedIds.includes(m.id));
    const res = await requestInvestigation(chosenMistakes, q);
    setIsInvestigating(false);

    if (res.success && res.investigation) {
      setCurrentResult(res.investigation);
      saveInvestigation(res.investigation);
    } else {
      setInvestigationError(res.error || 'Failed to complete comparative investigation.');
    }
  };

  const selectedMistakes = mistakes.filter((m) => selectedIds.includes(m.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/50 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <SearchCode className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">AI Cross-Failure Investigator</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Select 2 or more historical incidents to determine whether they share an unaddressed
            systemic cause, evaluate which previous fix was most durable, and build a unified
            countermeasure.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
          {selectedIds.length} incidents selected (minimum 2)
        </div>
      </div>

      {/* Step 1: Select Incidents Grid */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Step 1: Choose Mistake Incidents to Compare
            </h3>
            <p className="text-xs text-slate-400">
              Pick 2 or more incidents you suspect might share a common root cause.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(mistakes.slice(0, 3).map((m) => m.id))}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Select Top 3
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {mistakes.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No mistakes recorded yet to investigate. Log mistakes first.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mistakes.map((m) => {
              const isSelected = selectedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => handleToggleSelect(m.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-2 select-none ${
                    isSelected
                      ? 'bg-purple-950/40 border-cyan-400 shadow-sm shadow-purple-950/60'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[10px] ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950'
                          : 'border border-slate-700 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{m.date}</span>
                  </div>

                  <h4 className="font-bold text-slate-200 line-clamp-2 leading-snug">{m.title}</h4>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CategoryBadge category={m.category} />
                    <SeverityBadge severity={m.severity} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2: Investigation Angle & Execution */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">
          Step 2: Define Investigation Angle or Core Question
        </h3>

        {/* Preset Question Chips */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">Common Investigation Questions:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUESTION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomQuestion(preset);
                  handleRunInvestigation(preset);
                }}
                disabled={selectedIds.length < 2 || isInvestigating}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 transition-colors flex items-center justify-between gap-2 disabled:opacity-40"
              >
                <span>{preset}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Question Input */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            placeholder="Or ask a custom question (e.g. Why did our test suite fail to catch both of these bugs?)..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          <button
            onClick={() => handleRunInvestigation()}
            disabled={selectedIds.length < 2 || isInvestigating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isInvestigating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span>Investigating Cross-Incidents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Conduct Forensic Investigation</span>
              </>
            )}
          </button>
        </div>

        {investigationError && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{investigationError}</span>
          </div>
        )}
      </div>

      {/* Investigation Results Box */}
      {currentResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-cyan-950/30 border border-cyan-500/40 space-y-6 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">
                Cross-Incident Forensic Postmortem
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Evaluated {new Date(currentResult.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Connection Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              Connection Summary & Verdict
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {currentResult.connectionSummary}
            </p>
          </div>

          {/* Evidence Correlation Breakdown */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Evidence Correlation by Incident Record
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentResult.evidenceCorrelation.map((ec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-purple-300">
                    <span className="font-bold">Record ID: {ec.mistakeId}</span>
                  </div>
                  <h5 className="font-bold text-slate-200">{ec.title}</h5>
                  <p className="text-slate-400 leading-relaxed">
                    <span className="text-cyan-400 font-semibold">Observed Link: </span>
                    {ec.observedConnection}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Root Causes */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
              Shared Systemic or Cognitive Causes
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {currentResult.sharedRootCauses.map((cause, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span className="leading-relaxed">{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution Comparison: Best vs Ineffective */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-900/50 space-y-2">
              <span className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Best Working Remedy & Why
              </span>
              <p className="text-slate-300 leading-relaxed">
                {currentResult.solutionComparison.bestWorkingApproach}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-2">
              <span className="font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Ineffective or Fragile Attempts
              </span>
              <p className="text-slate-300 leading-relaxed">
                {currentResult.solutionComparison.ineffectiveApproaches}
              </p>
            </div>
          </div>

          {/* Key Differentiator */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="font-bold text-slate-300 block mb-1">Crucial Differentiator:</span>
            <p className="text-slate-400 leading-relaxed">
              {currentResult.solutionComparison.keyDifferentiator}
            </p>
          </div>

          {/* Unified Actionable Prevention Protocol */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              Unified Prevention Protocol
            </span>
            <div className="space-y-2">
              {currentResult.actionableProtocol.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-200 border border-slate-800 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/60 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence and Uncertainty Limitations */}
          <div className="text-[11px] text-slate-500 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
            <span className="font-semibold text-slate-400">Confidence & Empirical Limits: </span>
            {currentResult.confidenceAndLimitations}
          </div>
        </div>
      )}

      {/* Past Saved Investigations History */}
      {investigations.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              Saved Investigation Postmortems ({investigations.length})
            </h3>
          </div>

          <div className="space-y-3">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-cyan-300 line-clamp-1">{inv.question}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => deleteInvestigation(inv.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed line-clamp-2">
                  {inv.connectionSummary}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span>Compared records: {inv.selectedMistakeIds.join(', ')}</span>
                  <button
                    onClick={() => setCurrentResult(inv)}
                    className="ml-auto text-purple-400 hover:text-purple-300 font-medium"
                  >
                    View Analysis →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
