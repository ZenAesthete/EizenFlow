
import React, { useState, useEffect } from 'react';
import { Task, UrgencyCurve } from '../types';
import { Slider } from './ui/Slider';
import { X, Calendar, AlertCircle, TrendingUp, Activity, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface TaskFormProps {
  initialTask?: Task;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'urgencySetAt' | 'completed'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [importance, setImportance] = useState(initialTask?.importance || 50);
  const [baseUrgency, setBaseUrgency] = useState(initialTask?.baseUrgency || 50);
  const [impact, setImpact] = useState(initialTask?.impact ?? 50);
  const [effort, setEffort] = useState(initialTask?.effort ?? 50);
  
  const [urgencyCurve, setUrgencyCurve] = useState<UrgencyCurve>(initialTask?.urgencyCurve || 'linear');
  
  const [hasDueDate, setHasDueDate] = useState(!!initialTask?.dueDate);
  // Default due date to tomorrow if not set
  const [dueDateStr, setDueDateStr] = useState(
    initialTask?.dueDate 
      ? new Date(initialTask.dueDate).toISOString().slice(0, 16) 
      : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalDueDate = hasDueDate && dueDateStr ? new Date(dueDateStr).getTime() : null;

    onSave({
      title,
      description,
      importance,
      baseUrgency,
      impact,
      effort,
      urgencyCurve,
      dueDate: finalDueDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Task Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Submit Quarterly Report"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Importance Slider */}
            <Slider
              label="Importance"
              value={importance}
              onChange={setImportance}
              leftLabel="Low"
              rightLabel="High"
              colorClass="accent-emerald-600"
            />

            {/* Urgency Slider */}
            <Slider
              label="Initial Urgency"
              value={baseUrgency}
              onChange={setBaseUrgency}
              leftLabel="Low"
              rightLabel="High"
              colorClass="accent-rose-600"
            />

            {/* Impact Slider */}
            <Slider
              label="Impact (Value)"
              value={impact}
              onChange={setImpact}
              leftLabel="Low"
              rightLabel="High"
              colorClass="accent-indigo-600"
            />

            {/* Effort Slider */}
            <Slider
              label="Effort (Cost)"
              value={effort}
              onChange={setEffort}
              leftLabel="Easy"
              rightLabel="Hard"
              colorClass="accent-amber-600"
            />
          </div>

          {/* Due Date & Curve Logic */}
          <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    <Calendar size={18} />
                    <span>Due Date</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasDueDate} 
                      onChange={(e) => setHasDueDate(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                
                {hasDueDate && (
                  <div className="animate-in slide-in-from-top-2 duration-200 space-y-4">
                    <input
                      type="datetime-local"
                      value={dueDateStr}
                      onChange={(e) => setDueDateStr(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 dark:text-slate-100 dark:[color-scheme:dark]"
                    />
                    
                    {/* Urgency Curve Selector */}
                    <div className="space-y-2 pt-2">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Urgency Ramping</label>
                        <div className="grid grid-cols-3 gap-2">
                            {/* Fast / Front-loaded */}
                            <button
                                type="button"
                                onClick={() => setUrgencyCurve('fast')}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all",
                                    urgencyCurve === 'fast' 
                                        ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400" 
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                                )}
                            >
                                <svg width="40" height="24" viewBox="0 0 40 24" className="stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M2 22 C 2 22, 10 2, 38 2" />
                                </svg>
                                <span className="text-[10px] font-bold">Fast</span>
                            </button>

                            {/* Linear */}
                            <button
                                type="button"
                                onClick={() => setUrgencyCurve('linear')}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all",
                                    urgencyCurve === 'linear' 
                                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" 
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                                )}
                            >
                                <svg width="40" height="24" viewBox="0 0 40 24" className="stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M2 22 L 38 2" />
                                </svg>
                                <span className="text-[10px] font-bold">Linear</span>
                            </button>

                            {/* Slow / Back-loaded */}
                            <button
                                type="button"
                                onClick={() => setUrgencyCurve('slow')}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all",
                                    urgencyCurve === 'slow' 
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" 
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                                )}
                            >
                                <svg width="40" height="24" viewBox="0 0 40 24" className="stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M2 22 C 30 22, 38 2, 38 2" />
                                </svg>
                                <span className="text-[10px] font-bold">Slow</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                            {urgencyCurve === 'fast' && "Urgency spikes early and stays high (Concave)."}
                            {urgencyCurve === 'linear' && "Urgency increases steadily over time."}
                            {urgencyCurve === 'slow' && "Urgency stays low then spikes near deadline (Convex)."}
                        </p>
                    </div>

                  </div>
                )}
              </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center gap-3">
          {initialTask && onDelete ? (
            <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete</span>
            </button>
          ) : <div />}
          
          <div className="flex gap-3">
            <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-500 focus:ring-4 focus:ring-slate-300 dark:focus:ring-indigo-900 transition-all shadow-lg shadow-slate-900/20"
            >
                {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
