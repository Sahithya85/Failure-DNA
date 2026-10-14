import React from 'react';
import { Menu, Plus, Dna, Sparkles, Database } from 'lucide-react';
import { ActiveTab } from '../../types';
import { useFailureDNA } from '../../context/FailureDNAContext';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setMobileOpen: (open: boolean) => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Failure Intelligence Dashboard',
    subtitle: 'Systemic breakdown overview, health trends, and active prevention signals.',
  },
  'log-mistake': {
    title: 'Smart Mistake Logger',
    subtitle: 'Record an incident with full context for automated Gemini root-cause postmortem.',
  },
  'my-mistakes': {
    title: 'Mistake History & Postmortems',
    subtitle: 'Search, audit, and filter historical failures and AI-validated causal deductions.',
  },
  'failure-dna': {
    title: 'Failure DNA Pattern Matrix',
    subtitle: 'Empirical recurrence patterns, environmental triggers, and behavioral countermeasures.',
  },
  investigator: {
    title: 'AI Cross-Failure Investigator',
    subtitle: 'Deep forensic comparison across multiple incidents to identify common threads.',
  },
  'prevention-tasks': {
    title: 'Actionable Prevention Engine',
    subtitle: 'Track verification tasks, test behavioral habits, and validate recurrence immunity.',
  },
  timeline: {
    title: 'Chronological Failure Timeline',
    subtitle: 'Track the evolution of fixes over time and assess whether your failure rate is declining.',
  },
  settings: {
    title: 'System & Data Management',
    subtitle: 'Import/export datasets, inspect AI connection parameters, and manage local storage.',
  },
};

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, setMobileOpen }) => {
  const { mistakes, patterns, loadDemoData } = useFailureDNA();
  const info = TAB_TITLES[activeTab] || { title: 'Failure DNA', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-100 flex items-center gap-2">
              {info.title}
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">{info.subtitle}</p>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {mistakes.length === 0 && (
            <button
              onClick={loadDemoData}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-950/80 text-purple-300 border border-purple-700/60 hover:bg-purple-900 transition-colors shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              Load Sample Data
            </button>
          )}

          {activeTab !== 'log-mistake' && (
            <button
              onClick={() => setActiveTab('log-mistake')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-950/50 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Mistake</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
