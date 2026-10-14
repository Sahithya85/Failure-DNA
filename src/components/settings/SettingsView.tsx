import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Database,
  Server,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { useFailureDNA } from '../../context/FailureDNAContext';

export const SettingsView: React.FC = () => {
  const {
    mistakes,
    patterns,
    preventionTasks,
    investigations,
    serverHealth,
    refreshHealth,
    loadDemoData,
    clearAllData,
    exportDataJSON,
    exportDataCSV,
    importDataJSON,
  } = useFailureDNA();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataJSON(content);
      if (res.success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus(`Import failed: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleManualHealthCheck = async () => {
    setIsRefreshingHealth(true);
    await refreshHealth();
    setIsRefreshingHealth(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Settings Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/50 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">System & Data Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure local backup exports, restore previous datasets, and inspect Gemini API pipeline health.
          </p>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-800 text-xs text-cyan-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Grid: Server AI Status & Data Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Server Health Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-200">Gemini AI Engine Status</h3>
            </div>
            <button
              onClick={handleManualHealthCheck}
              disabled={isRefreshingHealth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Refresh connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingHealth ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Connection:</span>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                {serverHealth?.status === 'healthy' ? 'Active & Responding' : 'Offline Mode'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">API Key Injected:</span>
              <span
                className={`font-semibold ${
                  serverHealth?.hasApiKey ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {serverHealth?.hasApiKey ? 'Server Secret Configured' : 'Missing (Manual Mode)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Primary Model:</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {serverHealth?.model || 'gemini-3.8-flash'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            All AI operations run strictly through secure server endpoints (`/api/analyze-mistake`,
            `/api/detect-patterns`, `/api/investigate-mistakes`). API keys are never exposed to the
            browser.
          </p>
        </div>

        {/* Local Storage Stats */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">Local Dataset Volume</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Isolated in Browser</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Recorded Mistakes</span>
              <span className="text-lg font-bold text-slate-200">{mistakes.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Failure DNA Patterns</span>
              <span className="text-lg font-bold text-purple-400">{patterns.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Prevention Tasks</span>
              <span className="text-lg font-bold text-cyan-400">{preventionTasks.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Saved Investigations</span>
              <span className="text-lg font-bold text-emerald-400">{investigations.length}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Privacy Guarantee: Your mistake history is preserved in your private browser sandbox. No
            user data is ever shared across sessions.
          </p>
        </div>
      </div>

      {/* Export & Import Actions */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Data Portability & Backup</h3>
        <p className="text-xs text-slate-400">
          Export your entire failure history for backup, archival, or spreadsheet analysis.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportDataJSON}
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors flex flex-col justify-between group space-y-2"
          >
            <div className="flex items-center justify-between text-purple-400">
              <FileJson className="w-5 h-5" />
              <Download className="w-4 h-4 text-slate-600 group-hover:text-purple-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Export Full JSON</span>
              <span className="text-[11px] text-slate-500">
                Complete postmortems, patterns, and tasks
              </span>
            </div>
          </button>

          <button
            onClick={exportDataCSV}
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors flex flex-col justify-between group space-y-2"
          >
            <div className="flex items-center justify-between text-cyan-400">
              <FileSpreadsheet className="w-5 h-5" />
              <Download className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Export CSV Table</span>
              <span className="text-[11px] text-slate-500">Tabular format for Excel or Sheets</span>
            </div>
          </button>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer flex flex-col justify-between group space-y-2"
          >
            <div className="flex items-center justify-between text-emerald-400">
              <Upload className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-slate-500">Restore</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Import JSON Backup</span>
              <span className="text-[11px] text-slate-500">Restore from previous export file</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Demo Data & Reset Actions */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Interactive Demo & Reset Controls</h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-purple-900/40">
          <div>
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-400" />
              Load Interactive Demo Dataset (Explicitly Labeled)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Populates 5 realistic mistakes spanning async race conditions, empty file crashes,
              late-night lockouts, timezone bugs, and git demo stress.
            </p>
          </div>
          <button
            onClick={() => {
              loadDemoData();
              alert('Loaded demo dataset successfully.');
            }}
            className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700/60 text-xs font-semibold shrink-0 transition-colors"
          >
            Load Demo Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-rose-900/30">
          <div>
            <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-400" />
              Wipe All Stored Data
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Permanently purges all mistakes, detected Failure DNA patterns, prevention tasks, and
              investigation history from your browser.
            </p>
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  'Are you completely sure you want to delete all mistakes and patterns? This cannot be undone.'
                )
              ) {
                clearAllData();
                alert('All data has been cleared.');
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800/60 text-xs font-semibold shrink-0 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};
