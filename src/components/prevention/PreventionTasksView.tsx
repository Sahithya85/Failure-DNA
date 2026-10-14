import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  Trash2,
  Edit2,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  X,
  Dna,
} from 'lucide-react';
import { useFailureDNA } from '../../context/FailureDNAContext';
import { MistakeCategory, PreventionTask } from '../../types';

export const PreventionTasksView: React.FC = () => {
  const {
    preventionTasks,
    addPreventionTask,
    updatePreventionTask,
    deletePreventionTask,
    validateTaskOutcome,
  } = useFailureDNA();

  // Filters
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');

  // New task modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MistakeCategory>('Coding');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [dueDate, setDueDate] = useState('');

  // Validate Outcome modal
  const [validatingTaskId, setValidatingTaskId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<
    'Prevented Recurrence' | 'Partial Success' | 'Mistake Recurred'
  >('Prevented Recurrence');
  const [validationNotes, setValidationNotes] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addPreventionTask({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || undefined,
      completed: false,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setIsAddModalOpen(false);
  };

  const handleCompleteValidation = () => {
    if (!validatingTaskId) return;
    validateTaskOutcome(validatingTaskId, validationResult, validationNotes);
    setValidatingTaskId(null);
    setValidationNotes('');
  };

  const filteredTasks = preventionTasks.filter((task) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'completed' ? task.completed : !task.completed;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedCount = preventionTasks.filter((t) => t.completed).length;
  const validatedPreventedCount = preventionTasks.filter(
    (t) => t.outcomeValidation?.nextAttemptResult === 'Prevented Recurrence'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/50 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">Personal Prevention Engine</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Transform AI postmortem recommendations into verifiable behavioral guardrails. Validate
            whether each safeguard actually halted recurrence on your next attempt.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            Total Safeguards
          </span>
          <div className="text-2xl font-black text-slate-100">{preventionTasks.length}</div>
          <p className="text-slate-500 text-[11px]">Checklist items tracked</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            Safeguards Implemented
          </span>
          <div className="text-2xl font-black text-cyan-400">{completedCount}</div>
          <p className="text-slate-500 text-[11px]">
            {preventionTasks.length > 0
              ? `${Math.round((completedCount / preventionTasks.length) * 100)}% completion rate`
              : '0% completion'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            Verified Recurrence Halts
          </span>
          <div className="text-2xl font-black text-emerald-400">{validatedPreventedCount}</div>
          <p className="text-slate-500 text-[11px]">Confirmed zero recidivism</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors uppercase text-[11px] tracking-wider ${
                filter === tab
                  ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter prevention tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-500 space-y-2">
          <CheckSquare className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-slate-400 font-semibold">No prevention tasks in this view.</p>
          <p>Adopt checklist items from Failure DNA or create a custom task.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border text-xs transition-all space-y-3 ${
                task.completed
                  ? 'bg-slate-950/70 border-slate-800/80'
                  : 'bg-slate-900/80 border-slate-700/80 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      updatePreventionTask(task.id, {
                        completed: !task.completed,
                        completedAt: !task.completed ? new Date().toISOString() : undefined,
                      })
                    }
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center font-bold shrink-0 transition-colors ${
                      task.completed
                        ? 'bg-emerald-500 text-slate-950'
                        : 'border border-slate-600 hover:border-cyan-400 text-transparent'
                    }`}
                  >
                    ✓
                  </button>

                  <div className="space-y-1">
                    <h4
                      className={`text-sm font-bold ${
                        task.completed ? 'text-slate-400 line-through' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-slate-400 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      task.priority === 'High'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : task.priority === 'Medium'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => deletePreventionTask(task.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Task Metadata & Origin */}
              <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                  {task.category}
                </span>

                {task.patternName && (
                  <span className="flex items-center gap-1 text-purple-400">
                    <Dna className="w-3 h-3" />
                    Pattern: {task.patternName}
                  </span>
                )}

                {task.dueDate && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Calendar className="w-3 h-3" /> Due {task.dueDate}
                  </span>
                )}
              </div>

              {/* Feedback Loop: Validate Next Attempt */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                {task.outcomeValidation ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        task.outcomeValidation.nextAttemptResult === 'Prevented Recurrence'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : task.outcomeValidation.nextAttemptResult === 'Partial Success'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      Outcome: {task.outcomeValidation.nextAttemptResult}
                    </span>
                    {task.outcomeValidation.validationNotes && (
                      <span className="text-[11px] text-slate-400 italic">
                        "{task.outcomeValidation.validationNotes}"
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Recurrence immunity not yet validated on subsequent runs.
                  </span>
                )}

                <button
                  onClick={() => {
                    setValidatingTaskId(task.id);
                    setValidationResult('Prevented Recurrence');
                    setValidationNotes(task.outcomeValidation?.validationNotes || '');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-semibold flex items-center gap-1 ml-auto"
                >
                  <ThumbsUp className="w-3 h-3" />
                  {task.outcomeValidation ? 'Update Attempt Result' : 'Record Next Attempt Outcome'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Create Prevention Task</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Add mandatory pre-push linter hook"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details on how to execute or verify this safeguard..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
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
                  <label className="font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  Save Safeguard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Validate Outcome Modal */}
      {validatingTaskId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              Evaluate Countermeasure Durability
            </h3>
            <p className="text-xs text-slate-400">
              Did this safeguard prevent the mistake from repeating during your next attempt or deployment?
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">Next Attempt Result</label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'Prevented Recurrence',
                      label: 'Prevented Recurrence (Complete Immunity)',
                      desc: 'Safeguard caught or stopped the issue completely.',
                    },
                    {
                      id: 'Partial Success',
                      label: 'Partial Success (Mitigated Impact)',
                      desc: 'Issue occurred in milder form or was caught quickly.',
                    },
                    {
                      id: 'Mistake Recurred',
                      label: 'Mistake Recurred (Safeguard Insufficient)',
                      desc: 'The failure happened again despite this task.',
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                        validationResult === opt.id
                          ? 'bg-purple-950/60 border-cyan-400 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="valRes"
                        checked={validationResult === opt.id}
                        onChange={() => setValidationResult(opt.id as any)}
                        className="mt-0.5 text-cyan-500 focus:ring-0"
                      />
                      <div>
                        <div className="font-bold text-slate-200">{opt.label}</div>
                        <div className="text-[11px] text-slate-500">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Observation Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tested on Friday sprint release; AbortController successfully canceled 3 stale responses."
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setValidatingTaskId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteValidation}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
              >
                Record Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
