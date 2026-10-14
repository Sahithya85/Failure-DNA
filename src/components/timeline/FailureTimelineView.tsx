import React, { useState } from 'react';
import {
  GitCommit,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useFailureDNA } from '../../context/FailureDNAContext';
import { MistakeRecord } from '../../types';
import { CategoryBadge, OutcomeBadge, SeverityBadge } from '../common/ChartWidgets';

interface FailureTimelineViewProps {
  onSelectMistake: (mistake: MistakeRecord) => void;
}

export const FailureTimelineView: React.FC<FailureTimelineViewProps> = ({ onSelectMistake }) => {
  const { mistakes } = useFailureDNA();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter mistakes
  const filteredMistakes = mistakes.filter(
    (m) => selectedCategory === 'All' || m.category === selectedCategory
  );

  // Chronological sort (oldest to newest for forward journey)
  const chronologicalMistakes = [...filteredMistakes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Evaluate pattern trajectory
  const resolvedCount = chronologicalMistakes.filter(
    (m) => m.outcomeStatus === 'Resolved' || m.outcomeStatus === 'Partially Resolved'
  ).length;
  const recentMistakes = chronologicalMistakes.slice(-3);
  const recentResolvedRate =
    recentMistakes.length > 0
      ? recentMistakes.filter(
          (m) => m.outcomeStatus === 'Resolved' || m.outcomeStatus === 'Partially Resolved'
        ).length / recentMistakes.length
      : 0;

  const trajectory =
    recentResolvedRate >= 0.66 ? 'Improving' : recentResolvedRate >= 0.33 ? 'Unchanged' : 'Worsening';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/50 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-400 flex items-center justify-center text-cyan-300">
              <GitCommit className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Chronological Failure Timeline</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Track how your breakdowns, fix attempts, and outcomes evolve over time. Compare earlier
            approaches against later attempts to evaluate if your failure recurrence is subsiding.
          </p>
        </div>

        {/* Trajectory Badge */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              trajectory === 'Improving'
                ? 'bg-emerald-400 animate-pulse'
                : trajectory === 'Unchanged'
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
          />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Trajectory Status
            </span>
            <span
              className={`text-sm font-black ${
                trajectory === 'Improving'
                  ? 'text-emerald-400'
                  : trajectory === 'Unchanged'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {trajectory} ({Math.round(recentResolvedRate * 100)}% recent resolution)
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-300">Filter Domain:</span>
          {['All', 'Coding', 'Learning', 'Time Management', 'Communication', 'Decision Making'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
        <span className="text-slate-500 text-xs">
          Showing {chronologicalMistakes.length} timeline milestones
        </span>
      </div>

      {/* Timeline Journey Nodes */}
      {chronologicalMistakes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500 space-y-2">
          <Clock className="w-10 h-10 mx-auto text-slate-600" />
          <p className="font-semibold text-slate-400">No mistakes logged in this category.</p>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-8 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-cyan-500 before:to-emerald-500">
          {chronologicalMistakes.map((m, index) => {
            const isLatest = index === chronologicalMistakes.length - 1;
            const isResolved =
              m.outcomeStatus === 'Resolved' || m.outcomeStatus === 'Partially Resolved';

            return (
              <div key={m.id} className="relative group">
                {/* Node Dot */}
                <div
                  className={`absolute -left-6 md:-left-10 top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-125 ${
                    isResolved
                      ? 'bg-slate-950 border-cyan-400 text-cyan-400 shadow-md shadow-cyan-950'
                      : 'bg-slate-950 border-rose-500 text-rose-400 shadow-md shadow-rose-950'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                </div>

                {/* Milestone Card */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-3.5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-cyan-400">
                        Milestone #{index + 1}
                      </span>
                      <span>•</span>
                      <CategoryBadge category={m.category} />
                      <SeverityBadge severity={m.severity} />
                      <OutcomeBadge status={m.outcomeStatus} />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>{m.date}</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectMistake(m)}
                    className="text-base font-bold text-slate-100 hover:text-cyan-300 cursor-pointer transition-colors"
                  >
                    {m.title}
                  </h3>

                  {/* Attempted vs Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <div>
                      <span className="font-semibold text-slate-300 block mb-0.5">Attempted:</span>
                      <p className="text-slate-400 line-clamp-2">{m.attempted}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-rose-400 block mb-0.5">
                        What Broke / Failed:
                      </span>
                      <p className="text-slate-300 line-clamp-2">{m.whatWentWrong}</p>
                    </div>
                  </div>

                  {/* Remediation & Subsequent Outcome */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Attempted Fix & Subsequent Result:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {m.attemptedFix} →{' '}
                      <span className="text-cyan-300 font-semibold">{m.finalOutcome}</span>
                    </p>
                  </div>

                  {/* Candidate Pattern Link */}
                  {m.aiAnalysis?.detectedPatternCandidate && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-purple-300 flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Identified Habit: {m.aiAnalysis.detectedPatternCandidate}
                      </span>
                      <button
                        onClick={() => onSelectMistake(m)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                      >
                        Inspect Postmortem <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
