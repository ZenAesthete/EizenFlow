
import React, { useState } from 'react';
import { Task, UrgencyCurve } from '../types';
import { Slider } from './ui/Slider';
import { Calendar } from 'lucide-react';
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
      title, description, importance, baseUrgency, impact, effort, urgencyCurve, dueDate: finalDueDate,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/20 backdrop-blur-[2px] sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-950 w-full max-w-[400px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transition-all overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-slate-800/50 shrink-0">
          <button 
            type="button" 
            onClick={onCancel} 
            className="text-[15px] font-normal text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
             Cancel
          </button>
          <h2 className="text-[16px] font-semibold text-slate-900 dark:text-white">
            {initialTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="text-[15px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
              Save
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          <div className="mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              className="w-full text-xl font-semibold bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 px-0 text-slate-900 dark:text-white leading-tight"
              autoFocus
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full mt-2 text-sm text-slate-500 dark:text-slate-400 bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 px-0"
            />
          </div>

          <div className="space-y-8">
            <Slider label="Importance" value={importance} onChange={setImportance} leftLabel="Low" rightLabel="High" colorClass="accent-indigo-500" />
            <Slider label="Initial Urgency" value={baseUrgency} onChange={setBaseUrgency} leftLabel="Low" rightLabel="High" colorClass="accent-indigo-500" />
            
            {/* Due Date Card */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 transition-all">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                        <Calendar size={20} className="text-slate-400" />
                        <span className="text-sm">Due Date</span>
                    </div>
                    <div className="relative flex items-center">
                      <input 
                          type="checkbox" 
                          checked={hasDueDate} 
                          onChange={(e) => setHasDueDate(e.target.checked)} 
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800 cursor-pointer transition-all" 
                      />
                    </div>
                </div>
                
                {hasDueDate && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 fade-in duration-200 space-y-3">
                    <input
                      type="datetime-local"
                      value={dueDateStr}
                      onChange={(e) => setDueDateStr(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl px-3 py-2.5 text-sm dark:text-white dark:[color-scheme:dark]"
                    />
                     <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-800 rounded-lg p-1">
                        {['fast', 'linear', 'slow'].map((c) => (
                                 <button key={c} type="button" onClick={() => setUrgencyCurve(c as any)} 
                                    className={cn("flex-1 py-1.5 text-[11px] font-medium rounded-md uppercase transition-all", 
                                        urgencyCurve === c ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                    )}>
                                     {c}
                                 </button>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            <Slider label="Impact" value={impact} onChange={setImpact} leftLabel="Low" rightLabel="High" colorClass="accent-indigo-500" />
            <Slider label="Effort" value={effort} onChange={setEffort} leftLabel="Easy" rightLabel="Hard" colorClass="accent-indigo-500" />
          </div>
          
           {initialTask && onDelete && (
             <div className="pt-8 pb-2 flex justify-center">
                 <button 
                  type="button" 
                  onClick={onDelete} 
                  className="text-rose-500 text-sm font-medium hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                >
                    Delete Task
                 </button>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};
