import React, { useState } from 'react';
import {
  Dna,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Edit2,
  Trash2,
  Plus,
  Compass,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useFailureDNA } from '../../context/FailureDNAContext';
import { FailurePatternProfile, MistakeRecord } from '../../types';

interface FailureDNAViewProps {
  onSelectMistake: (mistake: MistakeRecord) => void;
  onNavigateToTasks: () => void;
}

export const FailureDNAView: React.FC<FailureDNAViewProps> = ({
  onSelectMistake,
  onNavigateToTasks,
}) => {
  const {
    patterns,
    mistakes,
    runPatternDetection,
    isDetectingPatterns,
    updatePattern,
    deletePattern,
    addPreventionTask,
  } = useFailureDNA();

  const [notification, setNotification] = useState<string | null>(null);
  const [editingPattern, setEditingPattern] = useState<FailurePatternProfile | null>(null);
  const [customName, setCustomName] = useState('');
  const [userNote, setUserNote] = useState('');

  const handleRunScan = async () => {
    const res = await runPatternDetection();
    setNotification(res.message || (res.success ? 'Pattern scan completed' : 'Scan failed'));
    setTimeout(() => setNotification(null), 6000);
  };

  const handleAdoptChecklist = (pattern: FailurePatternProfile, item: string) => {
    addPreventionTask({
      title: item,
      description: `Countermeasure for Failure DNA pattern: ${pattern.name}. Target habit: ${pattern.recommendedHabit}`,
      category: (pattern.category as any) || 'Decision Making',
      priority: 'High',
      patternId: pattern.id,
      patternName: pattern.name,
      completed: false,
    });
    setNotification(`Added "${item}" to your Prevention Tasks.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSavePatternOverride = () => {
    if (!editingPattern) return;
    updatePattern(editingPattern.id, {
      name: customName || editingPattern.name,
      userOverride: {
        customName,
        userNote,
        isDisputed: false,
      },
    });
    setEditingPattern(null);
  };

  const hasEnoughData = mistakes.length >= 2;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Scan Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/50 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-cyan-300">
              <Dna className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Failure DNA Recurrence Matrix</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            Gemini correlates your past mistakes to detect systematic failure habits, hidden
            environmental triggers, and effective behavioral countermeasures.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isDetectingPatterns || !hasEnoughData}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isDetectingPatterns ? 'animate-spin' : ''}`} />
          <span>{isDetectingPatterns ? 'Analyzing Failure DNA...' : 'Rescan Mistake History'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-800/80 text-xs text-cyan-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Insufficient Data State */}
      {!hasEnoughData ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            More Mistake Records Needed for Pattern Synthesis
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Failure DNA requires at least 2 distinct mistake reports to extract genuine behavioral
            recurrence patterns and avoid fabricating premature conclusions.
          </p>
          <p className="text-xs text-cyan-400">
            Current recorded mistakes: <span className="font-bold">{mistakes.length}</span> / 2 minimum
          </p>
        </div>
      ) : patterns.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <Dna className="w-12 h-12 mx-auto text-purple-400 animate-pulse" />
          <h3 className="text-base font-bold text-slate-200">No Patterns Synthesized Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You have {mistakes.length} mistakes recorded. Click below to trigger the Gemini pattern
            detection engine.
          </p>
          <button
            onClick={handleRunScan}
            disabled={isDetectingPatterns}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Synthesize Failure DNA Now
          </button>
        </div>
      ) : (
        /* Patterns List */
        <div className="space-y-6">
          {patterns.map((pattern) => {
            const linkedMistakes = mistakes.filter((m) => pattern.mistakeIds.includes(m.id));

            return (
              <div
                key={pattern.id}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 transition-all space-y-5 shadow-sm"
              >
                {/* Header: Title, Category, Occurrences, Edit */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                        {pattern.userOverride?.customName || pattern.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60">
                        {pattern.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-950 text-cyan-300 border border-slate-800">
                        {pattern.mistakeIds.length} Linked Incidents
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {pattern.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingPattern(pattern);
                        setCustomName(pattern.userOverride?.customName || pattern.name);
                        setUserNote(pattern.userOverride?.userNote || '');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Adjust / Correct</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove pattern "${pattern.name}"?`)) {
                          deletePattern(pattern.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                      title="Delete pattern"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid: Triggers & Warning Signs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Triggers */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Common Trigger Conditions
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {pattern.commonTriggers.map((trig, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span className="leading-relaxed">{trig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Warning Signs */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Pre-Failure Warning Signs
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {pattern.warningSigns.map((sign, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span className="leading-relaxed">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Working vs Ineffective Fixes Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Working */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-900/40 space-y-2">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      What Fixed It in Past (Evidence)
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {pattern.effectiveFixes.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Failed */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-slate-500" />
                      Ineffective / Fragile Fixes
                    </span>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {pattern.ineffectiveFixes.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-400">✗</span>
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Prevention Engine Card: Habit, Experiment, Checklist */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-cyan-950/30 border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Personalized Prevention Protocol
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Metric: {pattern.successMetric}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="font-semibold text-purple-300 block">Recommended Habit:</span>
                      <p className="text-slate-300 leading-relaxed">{pattern.recommendedHabit}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="font-semibold text-cyan-300 block">
                        Safe 1-Week Experiment:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{pattern.experiment}</p>
                    </div>
                  </div>

                  {/* Checklist items */}
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-2">
                      Prevention Verification Checklist:
                    </span>
                    <div className="space-y-2">
                      {pattern.preventionChecklist.map((checkItem, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-center justify-between gap-3"
                        >
                          <span className="leading-relaxed">{checkItem}</span>
                          <button
                            onClick={() => handleAdoptChecklist(pattern, checkItem)}
                            className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-700/60 text-[11px] font-semibold shrink-0 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add to Tasks
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Supporting Mistake Records Citation */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Supporting Historical Incidents:</span>
                  {linkedMistakes.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onSelectMistake(m)}
                      className="px-2.5 py-1 rounded-md bg-slate-950 text-cyan-300 hover:text-cyan-200 border border-slate-800 hover:border-cyan-500/50 transition-colors font-mono text-[11px]"
                    >
                      {m.title} (#{m.id})
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Adjust Pattern Modal */}
      {editingPattern && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Adjust Pattern Classification</h3>
            <p className="text-xs text-slate-400">
              You know your workflow best. Correct the AI's pattern naming or add personal notes.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Pattern Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Your Context / Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. This happens mainly during Friday releases or when requirements change midway..."
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingPattern(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePatternOverride}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
