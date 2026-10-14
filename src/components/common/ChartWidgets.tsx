import React from 'react';
import { MistakeCategory, MistakeSeverity, OutcomeStatus } from '../../types';

export const CategoryBadge: React.FC<{ category: MistakeCategory | string }> = ({ category }) => {
  const styles: Record<string, string> = {
    Coding: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    Learning: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    'Time Management': 'bg-amber-950/80 text-amber-300 border-amber-800/80',
    Communication: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
    'Decision Making': 'bg-rose-950/80 text-rose-300 border-rose-800/80',
    Other: 'bg-slate-900 text-slate-300 border-slate-700',
  };

  const currentStyle = styles[category] || styles.Other;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {category}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: MistakeSeverity }> = ({ severity }) => {
  const styles: Record<MistakeSeverity, { bg: string; dot: string }> = {
    Low: { bg: 'bg-slate-900 text-slate-300 border-slate-700', dot: 'bg-slate-400' },
    Medium: { bg: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60', dot: 'bg-cyan-400' },
    High: { bg: 'bg-amber-950/70 text-amber-300 border-amber-800/60', dot: 'bg-amber-400' },
    Critical: { bg: 'bg-rose-950/80 text-rose-300 border-rose-800/80', dot: 'bg-rose-500 animate-pulse' },
  };

  const style = styles[severity] || styles.Low;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {severity}
    </span>
  );
};

export const OutcomeBadge: React.FC<{ status: OutcomeStatus }> = ({ status }) => {
  const styles: Record<OutcomeStatus, string> = {
    Resolved: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
    'Partially Resolved': 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
    'Workaround Found': 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    Unresolved: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
  };

  const style = styles[status] || styles.Unresolved;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {status}
    </span>
  );
};

interface CategoryDistributionProps {
  data: Record<string, number>;
  total: number;
}

export const CategoryBarChart: React.FC<CategoryDistributionProps> = ({ data, total }) => {
  const categories = Object.keys(data);

  if (total === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-slate-500">
        No mistake categories recorded yet.
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    Coding: 'from-cyan-500 to-blue-600',
    Learning: 'from-emerald-500 to-teal-600',
    'Time Management': 'from-amber-500 to-yellow-600',
    Communication: 'from-purple-500 to-indigo-600',
    'Decision Making': 'from-rose-500 to-pink-600',
    Other: 'from-slate-500 to-slate-700',
  };

  return (
    <div className="space-y-3.5">
      {categories.map((cat) => {
        const count = data[cat] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        const gradient = categoryColors[cat] || 'from-purple-500 to-cyan-500';

        return (
          <div key={cat} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-300">{cat}</span>
              <span className="text-slate-400">
                {count} ({percentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                style={{ width: `${Math.max(percentage, 3)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface HealthScoreProps {
  score: number;
}

export const HealthScoreMeter: React.FC<HealthScoreProps> = ({ score }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 75
      ? 'text-cyan-400 stroke-cyan-400'
      : score >= 50
      ? 'text-purple-400 stroke-purple-400'
      : 'text-rose-400 stroke-rose-400';

  return (
    <div className="flex flex-col items-center justify-center relative p-3">
      <svg className="w-32 h-32 transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="9"
          className="text-slate-800/80"
          fill="transparent"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="9"
          className={`${color} transition-all duration-1000 ease-out`}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-100 tracking-tight">{score}</span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
          Immunity
        </span>
      </div>
    </div>
  );
};

interface TimelineTrendProps {
  timelineData: Array<{ date: string; count: number; resolvedCount: number }>;
}

export const TimelineTrendChart: React.FC<TimelineTrendProps> = ({ timelineData }) => {
  if (timelineData.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-slate-500">
        Record mistakes to populate temporal trend charts.
      </div>
    );
  }

  const maxVal = Math.max(...timelineData.map((d) => d.count), 1);
  const width = 500;
  const height = 140;
  const padding = 20;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const pointsTotal = timelineData.map((d, i) => {
    const x = padding + (i / Math.max(timelineData.length - 1, 1)) * plotWidth;
    const y = height - padding - (d.count / maxVal) * plotHeight;
    return `${x},${y}`;
  });

  const pointsResolved = timelineData.map((d, i) => {
    const x = padding + (i / Math.max(timelineData.length - 1, 1)) * plotWidth;
    const y = height - padding - (d.resolvedCount / maxVal) * plotHeight;
    return `${x},${y}`;
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36">
        {/* Subtle grid lines */}
        <line
          x1={padding}
          y1={padding}
          x2={width - padding}
          y2={padding}
          stroke="#1e293b"
          strokeDasharray="4 4"
        />
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="#1e293b"
          strokeDasharray="4 4"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#334155"
        />

        {/* Total mistakes line (Electric Purple) */}
        <polyline
          fill="none"
          stroke="#a855f7"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsTotal.join(' ')}
        />

        {/* Resolved mistakes line (Electric Cyan) */}
        <polyline
          fill="none"
          stroke="#06b6d4"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsResolved.join(' ')}
        />

        {/* Dots */}
        {timelineData.map((d, i) => {
          const x = padding + (i / Math.max(timelineData.length - 1, 1)) * plotWidth;
          const yTotal = height - padding - (d.count / maxVal) * plotHeight;
          const yRes = height - padding - (d.resolvedCount / maxVal) * plotHeight;
          return (
            <g key={i}>
              <circle cx={x} cy={yTotal} r="4" fill="#a855f7" className="hover:r-6 cursor-pointer" />
              <circle cx={x} cy={yRes} r="3.5" fill="#06b6d4" className="hover:r-5 cursor-pointer" />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-purple-500 rounded-full" />
          <span>Mistakes Recorded</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
          <span>Resolved / Mitigated</span>
        </div>
      </div>
    </div>
  );
};
