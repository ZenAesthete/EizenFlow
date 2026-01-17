
import React, { useMemo, useState } from 'react';
import { Task, QuadrantDef, SortOptionType, SortDefinition, QuadrantType } from '../types';
import { calculateCurrentUrgency, getQuadrant } from '../utils/urgency';
import { scoreBalanced, scoreDefault, scoreFrog, scoreLeverage, scoreUrgency } from '../utils/sorting';
import { TaskCard } from './TaskCard';
import { cn } from '../utils/cn';
import { CheckCheck, ListTodo, ArrowUpDown, Layers, LayoutList, Filter } from 'lucide-react';

interface MatrixProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddNew: () => void;
  viewMode: 'matrix' | 'all';
}

const QUADRANTS: QuadrantDef[] = [
  {
    id: 'do',
    label: 'Do First',
    description: 'Urgent & Important',
    color: 'bg-rose-100 dark:bg-rose-900/30',
    bg: 'bg-rose-50 dark:bg-rose-900/10',
    borderColor: 'border-rose-200 dark:border-rose-900/30',
    activeBorderColor: 'border-rose-500 ring-rose-500',
    textColor: 'text-rose-700 dark:text-rose-300'
  },
  {
    id: 'schedule',
    label: 'Schedule',
    description: 'Not Urgent & Important',
    color: 'bg-sky-100 dark:bg-sky-900/30',
    bg: 'bg-sky-50 dark:bg-sky-900/10',
    borderColor: 'border-sky-200 dark:border-sky-900/30',
    activeBorderColor: 'border-sky-500 ring-sky-500',
    textColor: 'text-sky-700 dark:text-sky-300'
  },
  {
    id: 'delegate',
    label: 'Delegate',
    description: 'Urgent & Not Important',
    color: 'bg-amber-100 dark:bg-amber-900/30',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    borderColor: 'border-amber-200 dark:border-amber-900/30',
    activeBorderColor: 'border-amber-500 ring-amber-500',
    textColor: 'text-amber-700 dark:text-amber-300'
  },
  {
    id: 'eliminate',
    label: 'Eliminate',
    description: 'Not Urgent & Not Important',
    color: 'bg-slate-100 dark:bg-slate-800/50',
    bg: 'bg-slate-50 dark:bg-slate-800/20',
    borderColor: 'border-slate-200 dark:border-slate-700',
    activeBorderColor: 'border-slate-400 ring-slate-400',
    textColor: 'text-slate-700 dark:text-slate-400'
  }
];

const SORT_OPTIONS: SortDefinition[] = [
    { id: 'default', label: 'Default', description: 'Urgency + Importance' },
    { id: 'balanced', label: 'Balanced Score', description: 'ROI & WSJF' },
    { id: 'leverage', label: 'Quick Wins', description: 'High Impact / Low Effort' },
    { id: 'frog', label: 'Eat the Frog', description: 'Hardest First' },
    { id: 'urgent', label: 'Deadline', description: 'Due Date Only' },
];

export const Matrix: React.FC<MatrixProps> = ({ tasks, onToggle, onDelete, onEdit, onAddNew, viewMode }) => {
  const [currentSort, setCurrentSort] = useState<SortOptionType>('default');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [mobileQuadrant, setMobileQuadrant] = useState<QuadrantType>('do');

  const processedTasks = useMemo(() => {
    // Helper to get sort score
    const getScore = (task: Task) => {
        switch (currentSort) {
            case 'leverage': return scoreLeverage(task);
            case 'balanced': return scoreBalanced(task);
            case 'frog': return scoreFrog(task);
            case 'urgent': return scoreUrgency(task);
            default: return scoreDefault(task);
        }
    };
    
    // Sort function
    const sorter = (a: Task, b: Task) => getScore(b) - getScore(a);

    const grouped: Record<string, { active: Task[], completed: Task[] }> = { 
      do: { active: [], completed: [] }, 
      schedule: { active: [], completed: [] }, 
      delegate: { active: [], completed: [] }, 
      eliminate: { active: [], completed: [] } 
    };
    
    const allList: { active: Task[], completed: Task[] } = { active: [], completed: [] };

    tasks.forEach(task => {
      const urgency = calculateCurrentUrgency(task);
      const q = getQuadrant(task.importance, urgency);
      
      if (task.completed) {
        grouped[q].completed.push(task);
        allList.completed.push(task);
      } else {
        grouped[q].active.push(task);
        allList.active.push(task);
      }
    });

    Object.keys(grouped).forEach(key => {
        grouped[key].active.sort(sorter);
        grouped[key].completed.sort((a, b) => b.createdAt - a.createdAt);
    });

    allList.active.sort(sorter);
    allList.completed.sort((a, b) => b.createdAt - a.createdAt);

    return { grouped, allList };
  }, [tasks, currentSort]); 

  const renderSortMenu = () => (
    <div className="relative">
        <button 
            onClick={(e) => { e.stopPropagation(); setIsSortMenuOpen(!isSortMenuOpen); }}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Sort Tasks"
        >
            <Filter size={18} />
        </button>
        {isSortMenuOpen && (
            <>
            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsSortMenuOpen(false); }} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/50">
                    Sort By
                </div>
                {SORT_OPTIONS.map(option => (
                    <button
                        key={option.id}
                        onClick={(e) => { e.stopPropagation(); setCurrentSort(option.id); setIsSortMenuOpen(false); }}
                        className={cn(
                            "w-full text-left px-3 py-2 text-sm transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0",
                            currentSort === option.id 
                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium" 
                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        )}
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className="flex items-center justify-between text-xs font-semibold">
                                {option.label}
                                {currentSort === option.id && <CheckCheck size={14} />}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal leading-tight">{option.description}</span>
                        </div>
                    </button>
                ))}
            </div>
            </>
        )}
    </div>
  );

  const renderTaskList = (active: Task[], completed: Task[], showEmptyState = true, isListMode = false) => {
    return (
        <div className="space-y-4">
             {active.length === 0 && showEmptyState ? (
               <div className="py-12 flex flex-col items-center justify-center gap-3 text-center opacity-60">
                   <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                       <LayoutList size={24} className="text-slate-400 dark:text-slate-600" />
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No active tasks in this section.</p>
               </div>
             ) : (
               <div className="space-y-2">
                  {active.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggle={onToggle} 
                        onDelete={onDelete} 
                        onEdit={onEdit} 
                        showQuadrantTag={isListMode}
                    />
                  ))}
               </div>
             )}

            {completed.length > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCheck size={14} /> Completed
                    </h4>
                    <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                        {completed.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onToggle={onToggle} 
                            onDelete={onDelete} 
                            onEdit={onEdit}
                            showQuadrantTag={isListMode}
                        />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
  }

  // --- VIEW: ALL TASKS (LIST) ---
  if (viewMode === 'all') {
    return (
        <div className="flex flex-col relative min-h-full">
            {/* Sticky Header - No negative margins needed as parent has no padding */}
            <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md dark:bg-slate-950/95 border-b border-slate-200/50 dark:border-slate-800 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h2 className="text-xl font-bold dark:text-white leading-tight">All Tasks</h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Sorted by {SORT_OPTIONS.find(o => o.id === currentSort)?.label}</p>
                </div>
                {renderSortMenu()}
            </div>
            
            {/* Scrollable Content with Padding */}
            <div className="flex-1 p-4 md:p-6 pb-24 md:pb-8 max-w-3xl mx-auto w-full">
                 {renderTaskList(processedTasks.allList.active, processedTasks.allList.completed, true, true)}
            </div>
        </div>
    )
  }

  // --- VIEW: MATRIX ---
  const activeQuadDef = QUADRANTS.find(q => q.id === mobileQuadrant);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 pb-24 md:pb-6">
        {/* MOBILE: Segmented Control & Full List */}
        <div className="md:hidden flex flex-col h-full">
            <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
                {QUADRANTS.map(q => {
                    const count = processedTasks.grouped[q.id].active.length;
                    const isActive = mobileQuadrant === q.id;
                    return (
                        <button
                            key={q.id}
                            onClick={() => setMobileQuadrant(q.id)}
                            className={cn(
                                "flex flex-col items-start p-3 rounded-xl border transition-all duration-200 relative overflow-hidden",
                                isActive 
                                    ? cn("bg-white dark:bg-slate-800 shadow-md ring-1", q.activeBorderColor) 
                                    : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                            )}
                        >
                            <div className={cn("text-xs font-bold uppercase tracking-wider mb-1", q.textColor)}>{q.label}</div>
                            <div className="text-xl font-black dark:text-white">{count}</div>
                            {/* Visual indicator bar */}
                            <div className={cn("absolute bottom-0 left-0 right-0 h-1 opacity-50", q.color)} />
                        </button>
                    )
                })}
            </div>

            <div className="flex-1 overflow-y-auto">
                 <div className={cn(
                    "bg-white dark:bg-slate-900 rounded-2xl min-h-[50vh] shadow-sm border overflow-hidden",
                    "border-slate-200 dark:border-slate-800/50"
                 )}>
                    <div className={cn(
                        "px-5 py-4 flex items-center justify-between border-b sticky top-0 z-10",
                        activeQuadDef?.bg,
                        activeQuadDef?.borderColor
                    )}>
                        <h3 className={cn("text-lg font-bold flex items-center gap-2", activeQuadDef?.textColor)}>
                            {activeQuadDef?.label}
                            <span className={cn("text-sm font-medium opacity-70", activeQuadDef?.textColor)}>Tasks</span>
                        </h3>
                        {renderSortMenu()}
                    </div>
                    
                    <div className="p-4">
                        {renderTaskList(
                            processedTasks.grouped[mobileQuadrant].active, 
                            processedTasks.grouped[mobileQuadrant].completed
                        )}
                    </div>
                 </div>
            </div>
        </div>

        {/* DESKTOP: 2x2 Grid */}
        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">
            {QUADRANTS.map(q => {
                const { active, completed } = processedTasks.grouped[q.id];
                return (
                    <div key={q.id} className={cn(
                        "flex flex-col rounded-2xl border overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow",
                        q.borderColor
                    )}>
                        <div className={cn("px-4 py-3 border-b flex justify-between items-center", q.bg, q.borderColor)}>
                            <h3 className={cn("font-bold text-sm uppercase tracking-wider", q.textColor)}>{q.label}</h3>
                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 shadow-sm border opacity-80", q.borderColor)}>
                                {active.length}
                            </span>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                             {renderTaskList(active, completed, false)}
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
  );
};
