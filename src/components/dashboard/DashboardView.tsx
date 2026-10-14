import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Dna,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Target,
  Plus,
  RefreshCw,
  FolderGit2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useFailureDNA } from '../../context/FailureDNAContext';
import { ActiveTab, MistakeRecord } from '../../types';
import {
  CategoryBadge,
  CategoryBarChart,
  HealthScoreMeter,
  OutcomeBadge,
  SeverityBadge,
  TimelineTrendChart,
} from '../common/ChartWidgets';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectMistake: (mistake: MistakeRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onSelectMistake }) => {
  const {
    mistakes,
    patterns,
    preventionTasks,
    updatePreventionTask,
    runPatternDetection,
    isDetectingPatterns,
    loadDemoData,
  } = useFailureDNA();

  // Metrics calculation
  const totalMistakes = mistakes.length;
  const resolvedMistakes = mistakes.filter(
    (m) => m.outcomeStatus === 'Resolved' || m.outcomeStatus === 'Partially Resolved'
  ).length;
  const resolutionRate = totalMistakes > 0 ? Math.round((resolvedMistakes / totalMistakes) * 100) : 0;

  // Category distribution
  const categoryCounts: Record<string, number> = {
    Coding: 0,
    Learning: 0,
    'Time Management': 0,
    Communication: 0,
    'Decision Making': 0,
    Other: 0,
  };
  mistakes.forEach((m) => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
  });

  // Top category
  let topCategory = 'None yet';
  let maxCatCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat;
    }
  });

  // Timeline aggregated by date
  const sortedMistakes = [...mistakes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const dateMap: Record<string, { count: number; resolvedCount: number }> = {};
  sortedMistakes.forEach((m) => {
    const key = m.date || 'Undated';
    if (!dateMap[key]) {
      dateMap[key] = { count: 0, resolvedCount: 0 };
    }
    dateMap[key].count += 1;
    if (m.outcomeStatus === 'Resolved' || m.outcomeStatus === 'Partially Resolved') {
      dateMap[key].resolvedCount += 1;
    }
  });

  const timelineData = Object.entries(dateMap).map(([date, data]) => ({
    date,
    count: data.count,
    resolvedCount: data.resolvedCount,
  }));

  // Effective fixes aggregated
  const effectiveFixes = patterns.flatMap((p) => p.effectiveFixes).slice(0, 4);

  // Pending prevention tasks
  const pendingTasks = preventionTasks.filter((t) => !t.completed).slice(0, 5);

  // Immunity health score calculation
  const immunityScore = Math.min(
    100,
    Math.max(
      20,
      Math.round(
        (resolutionRate * 0.5) +
          (patterns.length > 0 ? 30 : 10) +
          (preventionTasks.filter((t) => t.completed).length * 5)
      )
    )
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner / Zero-state callout */}
      {totalMistakes === 0 ? (
        <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/40 border border-purple-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-center mx-auto text-cyan-300">
            <Dna className="w-9 h-9 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome to Failure DNA</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Record your past mistakes, code breakages, and miscalculations. Gemini synthesizes them
            into a permanent Failure DNA profile to expose blind spots and prevent repeat incidents.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('log-mistake')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-950/60 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Your First Mistake
            </button>
            <button
              onClick={loadDemoData}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-600/50 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Load Interactive Demo Dataset
            </button>
          </div>
        </div>
      ) : (
        /* Top Quick Status Bar */
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-purple-950/30 to-slate-900/90 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-base font-semibold text-slate-100">
                Failure DNA Profile:{' '}
                <span className="text-cyan-400">
                  {patterns.length > 0 ? `${patterns.length} Recurring Patterns` : 'Synthesizing'}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Top vulnerability category: <span className="text-purple-300 font-medium">{topCategory}</span>
              {patterns.length > 0 && ` • Primary pattern: ${patterns[0].name}`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => runPatternDetection()}
              disabled={isDetectingPatterns}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 border border-purple-500/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDetectingPatterns ? 'animate-spin' : ''}`} />
              {isDetectingPatterns ? 'Scanning DNA...' : 'Rescan Failure DNA'}
            </button>
            <button
              onClick={() => setActiveTab('investigator')}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Investigate Links
            </button>
          </div>
        </div>
      )}

      {/* KPI Stat Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Mistakes */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Mistakes Logged</span>
            <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-100">{totalMistakes}</span>
            <span className="text-xs text-slate-400">entries recorded</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span>Critical Severity:</span>
            <span className="font-semibold text-rose-400">
              {mistakes.filter((m) => m.severity === 'Critical').length}
            </span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved Rate</span>
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400">{resolutionRate}%</span>
            <span className="text-xs text-slate-400">
              ({resolvedMistakes}/{totalMistakes})
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span>Unresolved Cases:</span>
            <span className="font-semibold text-amber-400">
              {mistakes.filter((m) => m.outcomeStatus === 'Unresolved').length}
            </span>
          </div>
        </div>

        {/* Failure DNA Patterns */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Patterns Detected</span>
            <Dna className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-300">{patterns.length}</span>
            <span className="text-xs text-slate-400">systemic habits</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span>Actionable Checklists:</span>
            <span className="font-semibold text-cyan-300">
              {patterns.reduce((acc, p) => acc + (p.preventionChecklist?.length || 0), 0)}
            </span>
          </div>
        </div>

        {/* Prevention Tasks Pending */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Tasks</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-300">
              {preventionTasks.filter((t) => !t.completed).length}
            </span>
            <span className="text-xs text-slate-400">
              ({preventionTasks.filter((t) => t.completed).length} validated)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span>High Priority:</span>
            <span className="font-semibold text-rose-300">
              {preventionTasks.filter((t) => !t.completed && t.priority === 'High').length}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics & Health Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Breakdown & Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Frequency Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Failure Domain Breakdown</h3>
                <p className="text-xs text-slate-400">
                  Distribution of breakdowns across operational domains
                </p>
              </div>
              <span className="text-xs text-cyan-400 font-semibold px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/40">
                Top: {topCategory}
              </span>
            </div>
            <CategoryBarChart data={categoryCounts} total={totalMistakes} />
          </div>

          {/* Temporal Trend Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Improvement Trajectory</h3>
                <p className="text-xs text-slate-400">
                  Chronological progression of incidents vs successful resolutions
                </p>
              </div>
              <button
                onClick={() => setActiveTab('timeline')}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
              >
                View Full Timeline <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <TimelineTrendChart timelineData={timelineData} />
          </div>
        </div>

        {/* Right Col: Failure Immunity Meter & Effective Fixes */}
        <div className="space-y-6">
          {/* Failure Immunity Health Score */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-200">Failure Immunity Index</h3>
              <span className="text-xs text-purple-400 font-semibold">Gemini Calibrated</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Composite score derived from resolution fidelity, prevention tasks, and recurrence immunity.
            </p>
            <HealthScoreMeter score={immunityScore} />
            <div className="w-full mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Recurrence Risk:</span>
              <span
                className={`font-semibold ${
                  immunityScore > 75
                    ? 'text-cyan-400'
                    : immunityScore > 50
                    ? 'text-purple-400'
                    : 'text-rose-400'
                }`}
              >
                {immunityScore > 75 ? 'Low (Guarded)' : immunityScore > 50 ? 'Moderate' : 'High (Unchecked)'}
              </span>
            </div>
          </div>

          {/* Proven Effective Fixes */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-200 mb-1">Most Effective Historical Fixes</h3>
            <p className="text-xs text-slate-400 mb-3">
              Proven remedies extracted from your resolved incidents
            </p>

            {effectiveFixes.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Scan Failure DNA or resolve incidents to record proven fixes.
              </p>
            ) : (
              <div className="space-y-2.5">
                {effectiveFixes.map((fix, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 flex items-center justify-center shrink-0 text-[10px] font-bold">
                      ✓
                    </span>
                    <span className="leading-relaxed">{fix}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Mistakes & Actionable Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mistakes List */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Recent Recorded Incidents</h3>
              <p className="text-xs text-slate-400">Latest breakdowns evaluated by Gemini</p>
            </div>
            <button
              onClick={() => setActiveTab('my-mistakes')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              All Mistakes ({totalMistakes}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {mistakes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No mistakes recorded yet. Click "Log a Mistake" above to start.
            </div>
          ) : (
            <div className="space-y-2.5">
              {mistakes.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMistake(m)}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {m.title}
                      </span>
                      <SeverityBadge severity={m.severity} />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{m.date}</span>
                      <span>•</span>
                      <CategoryBadge category={m.category} />
                      <span>•</span>
                      <OutcomeBadge status={m.outcomeStatus} />
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Prevention Tasks */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Active Prevention Tasks</h3>
              <p className="text-xs text-slate-400">Countermeasures generated from root causes</p>
            </div>
            <button
              onClick={() => setActiveTab('prevention-tasks')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              Manage Tasks ({preventionTasks.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {preventionTasks.length > 0
                ? 'All prevention tasks completed! Excellent work.'
                : 'No prevention tasks queued. Tasks will generate automatically from your postmortems.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() =>
                        updatePreventionTask(task.id, {
                          completed: true,
                          completedAt: new Date().toISOString(),
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded border border-slate-600 hover:border-cyan-400 flex items-center justify-center shrink-0 transition-colors"
                      title="Mark as done"
                    >
                      <CheckCircle2 className="w-3 h-3 text-transparent hover:text-cyan-400" />
                    </button>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{task.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 ${
                      task.priority === 'High'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
