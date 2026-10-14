import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Dna,
  SearchCode,
  CheckSquare,
  GitCommit,
  Settings,
  Sparkles,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useFailureDNA } from '../../context/FailureDNAContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const { mistakes, patterns, preventionTasks, serverHealth } = useFailureDNA();

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'log-mistake', label: 'Log a Mistake', icon: <PlusCircle className="w-5 h-5" /> },
    {
      id: 'my-mistakes',
      label: 'My Mistakes',
      icon: <History className="w-5 h-5" />,
      badge: mistakes.length,
    },
    {
      id: 'failure-dna',
      label: 'Failure DNA',
      icon: <Dna className="w-5 h-5" />,
      badge: patterns.length > 0 ? patterns.length : undefined,
    },
    { id: 'investigator', label: 'Investigate Patterns', icon: <SearchCode className="w-5 h-5" /> },
    {
      id: 'prevention-tasks',
      label: 'Prevention Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: preventionTasks.filter((t) => !t.completed).length || undefined,
    },
    { id: 'timeline', label: 'Failure Timeline', icon: <GitCommit className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 shadow-lg shadow-purple-950/50 text-white font-bold">
              <Dna className="w-6 h-6 animate-pulse text-cyan-200" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-slate-100 uppercase">
                  Failure <span className="text-cyan-400">DNA</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">AI Postmortem Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-900/60 to-cyan-950/40 text-cyan-300 border border-purple-500/40 shadow-sm shadow-purple-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-purple-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-purple-950/60 group-hover:text-purple-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI & System Status Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Gemini 3.8 Flash
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  serverHealth?.hasApiKey ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {serverHealth?.hasApiKey
                ? 'Server AI pipeline operational'
                : 'Offline mode active (manual mode)'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
