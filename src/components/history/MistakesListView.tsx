import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit3,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Loader2,
  Dna,
  FileText,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';
import { useFailureDNA } from '../../context/FailureDNAContext';
import { MistakeCategory, MistakeRecord, MistakeSeverity, OutcomeStatus } from '../../types';
import { CategoryBadge, OutcomeBadge, SeverityBadge } from '../common/ChartWidgets';

interface MistakesListViewProps {
  onSelectMistake: (mistake: MistakeRecord) => void;
  selectedMistakeModal: MistakeRecord | null;
  setSelectedMistakeModal: (m: MistakeRecord | null) => void;
}

export const MistakesListView: React.FC<MistakesListViewProps> = ({
  onSelectMistake,
  selectedMistakeModal,
  setSelectedMistakeModal,
}) => {
  const {
    mistakes,
    deleteMistake,
    updateMistake,
    reanalyzeMistake,
    isAnalyzing,
  } = useFailureDNA();

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'severity-desc' | 'title'>('date-desc');

  // Edit inline modal
  const [editingMistake, setEditingMistake] = useState<MistakeRecord | null>(null);

  // User correction for AI classification in modal
  const [isEditingCorrection, setIsEditingCorrection] = useState(false);
  const [correctedPattern, setCorrectedPattern] = useState('');
  const [userCorrectionNotes, setUserCorrectionNotes] = useState('');

  // Filtering
  const filteredMistakes = mistakes.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.whatWentWrong.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.attempted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSeverity = selectedSeverity === 'All' || m.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'All' || m.outcomeStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  // Sorting
  const sortedMistakes = [...filteredMistakes].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'severity-desc') {
      const order: Record<MistakeSeverity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (order[b.severity] || 0) - (order[a.severity] || 0);
    }
    return a.title.localeCompare(b.title);
  });

  const handleSaveCorrection = (m: MistakeRecord) => {
    if (!m.aiAnalysis) return;
    const updatedAnalysis = {
      ...m.aiAnalysis,
      detectedPatternCandidate: correctedPattern || m.aiAnalysis.detectedPatternCandidate,
      userCorrection: {
        correctedPatternName: correctedPattern,
        notes: userCorrectionNotes,
        correctedAt: new Date().toISOString(),
      },
    };
    updateMistake(m.id, { aiAnalysis: updatedAnalysis });
    setSelectedMistakeModal({ ...m, aiAnalysis: updatedAnalysis });
    setIsEditingCorrection(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Controls Bar: Search, Category, Severity, Status, Sort */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search mistakes by title, text, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <option value="All">All Categories</option>
              <option value="Coding">Coding</option>
              <option value="Learning">Learning</option>
              <option value="Time Management">Time Management</option>
              <option value="Communication">Communication</option>
              <option value="Decision Making">Decision Making</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="severity-desc">Highest Severity First</option>
              <option value="title">Title Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap text-xs text-slate-400">
          <span className="font-semibold text-slate-400">Status:</span>
          {['All', 'Resolved', 'Partially Resolved', 'Workaround Found', 'Unresolved'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedStatus === st
                  ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500">
            Showing {sortedMistakes.length} of {mistakes.length} entries
          </span>
        </div>
      </div>

      {/* Mistakes Card Grid */}
      {sortedMistakes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-semibold text-slate-300">No matching mistakes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {mistakes.length === 0
              ? 'No mistakes recorded yet. Record an incident to begin discovering your Failure DNA.'
              : 'Try clearing your search query or adjusting active filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedMistakes.map((mistake) => (
            <div
              key={mistake.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between group space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={mistake.category} />
                    <SeverityBadge severity={mistake.severity} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{mistake.date}</span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setSelectedMistakeModal(mistake)}
                  className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors cursor-pointer leading-snug line-clamp-2"
                >
                  {mistake.title}
                </h3>

                {/* Breakdown Summary */}
                <div className="text-xs text-slate-400 space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <p>
                    <span className="font-semibold text-slate-300">Attempted: </span>
                    <span className="line-clamp-2">{mistake.attempted}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-rose-400">What went wrong: </span>
                    <span className="line-clamp-2 text-slate-300">{mistake.whatWentWrong}</span>
                  </p>
                </div>

                {/* AI Candidate Tag */}
                {mistake.aiAnalysis?.detectedPatternCandidate && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-purple-400 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Candidate Pattern:
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-200 border border-purple-800/60 font-mono text-[11px]">
                      {mistake.aiAnalysis.detectedPatternCandidate}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {mistake.tags && mistake.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {mistake.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Status & Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <OutcomeBadge status={mistake.outcomeStatus} />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMistakeModal(mistake)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Postmortem</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEditingMistake(mistake)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Edit record"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete mistake: "${mistake.title}"?`)) {
                        deleteMistake(mistake.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deep Postmortem Inspection Modal */}
      {selectedMistakeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-y-auto flex flex-col my-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 line-clamp-1">
                    Failure Postmortem & Root Cause Audit
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedMistakeModal.id} • {selectedMistakeModal.date}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMistakeModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Title & Badges */}
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <CategoryBadge category={selectedMistakeModal.category} />
                  <SeverityBadge severity={selectedMistakeModal.severity} />
                  <OutcomeBadge status={selectedMistakeModal.outcomeStatus} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-100">
                  {selectedMistakeModal.title}
                </h2>
              </div>

              {/* Observed Facts Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Observed Facts & Reconstruction
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">Attempted Goal:</span>
                    <p className="text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {selectedMistakeModal.attempted}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-rose-400 block mb-1">What Went Wrong:</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {selectedMistakeModal.whatWentWrong}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">Expected:</span>
                    <p className="text-slate-400 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800/80">
                      {selectedMistakeModal.expectedResult}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">Actual:</span>
                    <p className="text-slate-400 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800/80">
                      {selectedMistakeModal.actualResult}
                    </p>
                  </div>
                </div>

                <div className="text-xs pt-2 border-t border-slate-800/80">
                  <span className="font-semibold text-slate-300">Attempted Fix & Outcome: </span>
                  <span className="text-slate-400">
                    {selectedMistakeModal.attemptedFix} → {selectedMistakeModal.finalOutcome}
                  </span>
                </div>
              </div>

              {/* Gemini AI Root Cause Postmortem Section */}
              {selectedMistakeModal.aiAnalysis ? (
                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-cyan-950/30 border border-purple-500/40 space-y-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Gemini Causal Postmortem
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Analyzed at {new Date(selectedMistakeModal.aiAnalysis.analyzedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <span className="font-semibold text-cyan-300 block mb-1">Breakdown Summary:</span>
                    {selectedMistakeModal.aiAnalysis.summary}
                  </div>

                  {/* Root Causes: Evidence vs Hypotheses */}
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Root Causes (Evidence vs Inferred Hypothesis)
                    </span>
                    <div className="space-y-3">
                      {selectedMistakeModal.aiAnalysis.likelyRootCauses.map((rc, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-100 text-sm">{rc.cause}</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  rc.confidence === 'High'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : rc.confidence === 'Medium'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                                }`}
                              >
                                {rc.confidence} Confidence
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  rc.isHypothesisOnly
                                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                }`}
                              >
                                {rc.isHypothesisOnly ? 'Hypothesis' : 'Substantiated Fact'}
                              </span>
                            </div>
                          </div>

                          <div className="text-slate-300 leading-relaxed">
                            <span className="font-semibold text-cyan-400">Direct Evidence: </span>
                            {rc.evidence}
                          </div>

                          {rc.uncertaintyExplanation && (
                            <div className="text-slate-400 text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800/60">
                              <span className="font-semibold text-slate-500">Uncertainty Boundary: </span>
                              {rc.uncertaintyExplanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practical Verification Test */}
                  {selectedMistakeModal.aiAnalysis.practicalVerificationTest && (
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs space-y-1">
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        Practical Test to Verify Suspected Cause
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedMistakeModal.aiAnalysis.practicalVerificationTest}
                      </p>
                    </div>
                  )}

                  {/* Action & Strategy Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                      <span className="font-semibold text-rose-300 block">
                        Immediate Corrective Action:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedMistakeModal.aiAnalysis.immediateCorrectiveAction}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                      <span className="font-semibold text-emerald-300 block">
                        Long-Term Prevention Strategy:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {selectedMistakeModal.aiAnalysis.longTermPreventionStrategy}
                      </p>
                    </div>
                  </div>

                  {/* Candidate Pattern & User Correction */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-800/40 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Dna className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold text-slate-200">
                          Failure DNA Pattern Candidate:{' '}
                          <span className="text-cyan-400 font-mono">
                            {selectedMistakeModal.aiAnalysis.detectedPatternCandidate}
                          </span>
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setIsEditingCorrection(!isEditingCorrection);
                          setCorrectedPattern(
                            selectedMistakeModal.aiAnalysis?.detectedPatternCandidate || ''
                          );
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        {isEditingCorrection ? 'Cancel Edit' : 'Adjust Pattern'}
                      </button>
                    </div>

                    {isEditingCorrection && (
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <input
                          type="text"
                          placeholder="Override pattern name (e.g. Incomplete Testing, Rushed Execution)..."
                          value={correctedPattern}
                          onChange={(e) => setCorrectedPattern(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                        <textarea
                          rows={2}
                          placeholder="Why are you adjusting this classification?"
                          value={userCorrectionNotes}
                          onChange={(e) => setUserCorrectionNotes(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                        <button
                          onClick={() => handleSaveCorrection(selectedMistakeModal)}
                          className="px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save Correction
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <p className="text-xs text-slate-400">
                    No AI postmortem attached yet for this mistake.
                  </p>
                  <button
                    onClick={async () => {
                      const res = await reanalyzeMistake(selectedMistakeModal.id);
                      if (res.success) {
                        const refreshed = mistakes.find((m) => m.id === selectedMistakeModal.id);
                        if (refreshed) setSelectedMistakeModal(refreshed);
                      }
                    }}
                    disabled={isAnalyzing}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Run Gemini Postmortem Analysis
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  if (confirm(`Delete mistake: "${selectedMistakeModal.title}"?`)) {
                    deleteMistake(selectedMistakeModal.id);
                    setSelectedMistakeModal(null);
                  }
                }}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Entry
              </button>

              <button
                onClick={() => setSelectedMistakeModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingMistake && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Edit Mistake Entry</h3>
              <button
                onClick={() => setEditingMistake(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  value={editingMistake.title}
                  onChange={(e) => setEditingMistake({ ...editingMistake, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={editingMistake.category}
                    onChange={(e) =>
                      setEditingMistake({ ...editingMistake, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
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
                  <label className="font-semibold text-slate-300 block mb-1">Severity</label>
                  <select
                    value={editingMistake.severity}
                    onChange={(e) =>
                      setEditingMistake({ ...editingMistake, severity: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Outcome Status</label>
                <select
                  value={editingMistake.outcomeStatus}
                  onChange={(e) =>
                    setEditingMistake({ ...editingMistake, outcomeStatus: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="Resolved">Resolved</option>
                  <option value="Partially Resolved">Partially Resolved</option>
                  <option value="Workaround Found">Workaround Found</option>
                  <option value="Unresolved">Unresolved</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Final Outcome</label>
                <textarea
                  rows={2}
                  value={editingMistake.finalOutcome}
                  onChange={(e) =>
                    setEditingMistake({ ...editingMistake, finalOutcome: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingMistake(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateMistake(editingMistake.id, editingMistake);
                  setEditingMistake(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
