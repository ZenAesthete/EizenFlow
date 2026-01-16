
import React, { useState } from 'react';
import { Task, UrgencyCurve } from '../types';
import { Slider } from './ui/Slider';
import { 
  Calendar, 
  Star, 
  Flame, 
  Coffee,
  Feather,
  Dumbbell,
  Target,
  ChevronDown,
  TrendingDown
} from 'lucide-react';
import { cn } from '../utils/cn';

interface TaskFormProps {
  initialTask?: Task;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'urgencySetAt' | 'completed'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const CurveIcon = ({ type, active }: { type: UrgencyCurve, active: boolean }) => {
  const color = active ? "stroke-indigo-600 dark:stroke-indigo-400" : "stroke-slate-400 dark:stroke-slate-500";
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300">
      {type === 'linear' && (
        <path d="M4 16L28 4" strokeWidth="2.5" strokeLinecap="round" className={color} />
      )}
      {type === 'fast' && (
        <path d="M4 16C4 6 10 4 28 4" strokeWidth="2.5" strokeLinecap="round" className={color} />
      )}
      {type === 'slow' && (
        <path d="M4 16C22 16 28 12 28 4" strokeWidth="2.5" strokeLinecap="round" className={color} />
      )}
    </svg>
  );
};

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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    const finalDueDate = hasDueDate && dueDateStr ? new Date(dueDateStr).getTime() : null;
    onSave({
      title, description, importance, baseUrgency, impact, effort, urgencyCurve, dueDate: finalDueDate,
    });
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div 
        className="bg-white dark:bg-slate-950 w-full max-w-[400px] rounded-[28px] shadow-2xl flex flex-col max-h-[90vh] transition-all overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-950 shrink-0">
          <button 
            type="button" 
            onClick={onCancel} 
            className="text-[15px] font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
             Cancel
          </button>
          <h2 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">
            {initialTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button 
            type="button" 
            onClick={() => handleSubmit()} 
            className="text-[15px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
              Save
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          
          {/* Title and Description */}
          <div className="space-y-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 px-0 text-slate-900 dark:text-white leading-tight"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={1}
              className="w-full text-sm text-slate-500 dark:text-slate-400 bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 px-0 resize-none min-h-[1.2em]"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
               <div>
                  <Slider 
                    label="Importance" 
                    value={importance} 
                    onChange={setImportance} 
                    leftLabel="LOW" 
                    rightLabel="HIGH" 
                    leftIcon={<ChevronDown size={16} className={importance < 30 ? "text-indigo-500" : ""} />}
                    rightIcon={<Star size={16} className={importance > 70 ? "fill-amber-400 text-amber-400" : ""} />}
                    colorClass="accent-indigo-500" 
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1 mt-1">
                    Significance. Does this align with your long-term goals?
                  </p>
               </div>

               <div>
                  <Slider 
                    label="Initial Urgency" 
                    value={baseUrgency} 
                    onChange={setBaseUrgency} 
                    leftLabel="LOW" 
                    rightLabel="HIGH"
                    leftIcon={<Coffee size={16} className={baseUrgency < 30 ? "text-emerald-500" : ""} />}
                    rightIcon={<Flame size={16} className={baseUrgency > 70 ? "fill-rose-500 text-rose-500" : ""} />}
                    colorClass="accent-indigo-500" 
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1 mt-1">
                    Time Pressure. How soon does this need attention?
                  </p>
               </div>
            </div>
            
            {/* Due Date Card */}
            <div className={cn(
                "rounded-2xl transition-all duration-200 border",
                hasDueDate 
                    ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 p-1"
                    : "bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 p-4"
            )}>
                {!hasDueDate ? (
                     <div className="flex items-center justify-between cursor-pointer" onClick={() => setHasDueDate(true)}>
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold">
                            <Calendar size={18} className="text-slate-400" />
                            <span className="text-[14px]">Add Due Date</span>
                        </div>
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" />
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 space-y-5 animate-in zoom-in-95 duration-200">
                         {/* Header */}
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                                 <Calendar size={16} className="text-indigo-500" />
                                 <span>Due Date</span>
                             </div>
                             <input 
                                type="checkbox" 
                                checked={hasDueDate} 
                                onChange={(e) => setHasDueDate(e.target.checked)} 
                                className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 cursor-pointer transition-all" 
                            />
                         </div>
                         
                         {/* Date Input */}
                         <input
                           type="datetime-local"
                           value={dueDateStr}
                           onChange={(e) => setDueDateStr(e.target.value)}
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:[color-scheme:dark]"
                         />

                         {/* Curve Selector */}
                         <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Urgency Curve</label>
                             <div className="grid grid-cols-3 gap-2">
                                {(['fast', 'linear', 'slow'] as UrgencyCurve[]).map((c) => (
                                    <button 
                                        key={c} 
                                        type="button" 
                                        onClick={() => setUrgencyCurve(c)} 
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden",
                                            urgencyCurve === c 
                                              ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-500/50" 
                                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                         <CurveIcon type={c} active={urgencyCurve === c} />
                                         <span className={cn(
                                             "text-[10px] font-bold uppercase tracking-widest",
                                             urgencyCurve === c ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                         )}>{c}</span>
                                    </button>
                                ))}
                             </div>
                         </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
              <div>
                  <Slider 
                    label="Impact" 
                    value={impact} 
                    onChange={setImpact} 
                    leftLabel="LOW" 
                    rightLabel="HIGH" 
                    leftIcon={<TrendingDown size={16} className={impact < 30 ? "text-amber-500" : ""} />}
                    rightIcon={<Target size={16} className={impact > 70 ? "text-amber-500" : ""} />}
                    colorClass="accent-indigo-500" 
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1 mt-1">
                    Value. How big is the payoff or outcome?
                  </p>
              </div>

              <div>
                  <Slider 
                    label="Effort" 
                    value={effort} 
                    onChange={setEffort} 
                    leftLabel="EASY" 
                    rightLabel="HARD" 
                    leftIcon={<Feather size={16} className={effort < 30 ? "text-emerald-500" : ""} />}
                    rightIcon={<Dumbbell size={16} className={effort > 70 ? "text-slate-700 dark:text-slate-300" : ""} />}
                    colorClass="accent-indigo-500" 
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1 mt-1">
                    Cost. How much energy or time is required?
                  </p>
              </div>
            </div>
          </div>
          
           {initialTask && onDelete && (
             <div className="pt-2 pb-1 flex justify-center">
                 <button 
                  type="button" 
                  onClick={onDelete} 
                  className="text-rose-500 text-[11px] font-bold hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors uppercase tracking-widest"
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
