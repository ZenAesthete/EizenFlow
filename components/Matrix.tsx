
import React, { useMemo, useState } from 'react';
import { Task, QuadrantDef, SortOptionType, SortDefinition, MatrixTab } from '../types';
import { calculateCurrentUrgency, getQuadrant } from '../utils/urgency';
import { scoreBalanced, scoreDefault, scoreFrog, scoreLeverage, scoreUrgency } from '../utils/sorting';
import { TaskCard } from './TaskCard';
import { cn } from '../utils/cn';
import { CheckCheck, ListTodo, ArrowUpDown, Layers, LayoutList } from 'lucide-react';

interface MatrixProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddNew: () => void;
  currentTab: MatrixTab;
}

const QUADRANTS: QuadrantDef[] = [
  {
    id: 'do',
    label: 'Do First',
    description: 'Urgent & Important',
    color: 'bg-rose-100 dark:bg-rose-900/30',
    bg: 'bg-rose-50/50 dark:bg-rose-900/10',
    borderColor: 'border-rose-200 dark:border-rose-900/30',
    textColor: 'text-rose-800 dark:text-rose-300'
  },
  {
    id: 'schedule',
    label: 'Schedule',
    description: 'Not Urgent & Important',
    color: 'bg-sky-100 dark:bg-sky-900/30',
    bg: 'bg-sky-50/50 dark:bg-sky-900/10',
    borderColor: 'border-sky-200 dark:border-sky-900/30',
    textColor: 'text-sky-800 dark:text-sky-300'
  },
  {
    id: 'delegate',
    label: 'Delegate',
    description: 'Urgent & Not Important',
    color: 'bg-amber-100 dark:bg-amber-900/30',
    bg: 'bg-amber-50/50 dark:bg-amber-900/10',
    borderColor: 'border-amber-200 dark:border-amber-900/30',
    textColor: 'text-amber-800 dark:text-amber-300'
  },
  {
    id: 'eliminate',
    label: 'Eliminate',
    description: 'Not Urgent & Not Important',
    color: 'bg-slate-100 dark:bg-slate-800/50',
    bg: 'bg-slate-50/50 dark:bg-slate-800/20',
    borderColor: 'border-slate-200 dark:border-slate-700',
    textColor: 'text-slate-800 dark:text-slate-400'
  }
];

const SORT_OPTIONS: SortDefinition[] = [
    { id: 'default', label: 'Default', description: 'Sorted by Urgency + Importance (Eisenhower)' },
    { id: 'balanced', label: 'Balanced Score', description: 'Maximize ROI while respecting urgency (WSJF-inspired)' },
    { id: 'leverage', label: 'Impact Density', description: 'Quick Wins: High Impact with Low Effort' },
    { id: 'frog', label: 'Eat the Frog', description: 'Hardest & Most Important tasks first' },
    { id: 'urgent', label: 'Deadline Only', description: 'Strictly by due date proximity' },
];

export const Matrix: React.FC<MatrixProps> = ({ tasks, onToggle, onDelete, onEdit, onAddNew, currentTab }) => {
  const [currentSort, setCurrentSort] = useState<SortOptionType>('default');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

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

    // 1. Group by Quadrant
    const grouped: Record<string, { active: Task[], completed: Task[] }> = { 
      do: { active: [], completed: [] }, 
      schedule: { active: [], completed: [] }, 
      delegate: { active: [], completed: [] }, 
      eliminate: { active: [], completed: [] } 
    };
    
    // 2. All List (for 'all' tab)
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

    // Apply Sorting
    Object.keys(grouped).forEach(key => {
        grouped[key].active.sort(sorter);
        grouped[key].completed.sort((a, b) => b.createdAt - a.createdAt);
    });

    allList.active.sort(sorter);
    allList.completed.sort((a, b) => b.createdAt - a.createdAt);

    return { grouped, allList };
  }, [tasks, currentSort]); 

  const renderColumn = (active: Task[], completed: Task[], def?: QuadrantDef) => {
    // If def is undefined, it's the 'All' view
    const isAllView = !def;
    const label = def ? def.label : "All Tasks";
    const description = def ? def.description : "Unified list of all tasks sorted by priority";
    
    // Custom styling for the All Tasks view to make it distinct
    const bg = def ? def.bg : "bg-indigo-50/30 dark:bg-indigo-950/10";
    const borderColor = def ? def.borderColor : "border-indigo-100 dark:border-indigo-900/30";
    const textColor = def ? def.textColor : "text-indigo-900 dark:text-indigo-300";

    return (
      <div 
        className={cn(
            "flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm",
            bg,
            borderColor,
            // If it's the All view, ensure it takes full height/width nicely
            isAllView && "col-span-1 md:col-span-2 row-span-2 bg-white dark:bg-slate-900"
        )}
      >
        <div className={cn("px-4 py-3 border-b flex justify-between items-center transition-colors bg-white/60 dark:bg-slate-900/40 backdrop-blur-md", borderColor)}>
          <div className="flex items-center gap-2">
            {isAllView && <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400"><Layers size={16} /></div>}
            <div>
                <h3 className={cn("font-extrabold text-sm uppercase tracking-widest", textColor)}>
                {label}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold opacity-75">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border", borderColor, textColor)}>
              {active.length}
            </span>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-6 scroll-smooth scrollbar-thin">
          {/* Active Section */}
          <section className="space-y-3">
             <div className="flex items-center gap-2 mb-2 px-1">
                <ListTodo size={12} className="text-slate-400" />
                <h4 className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Active</h4>
             </div>
             {active.length === 0 ? (
               <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/50 rounded-xl gap-2">
                   <LayoutList size={24} className="text-slate-300 dark:text-slate-700" />
                   <p className="text-xs text-slate-400 dark:text-slate-600 font-medium">No active tasks</p>
               </div>
             ) : (
               active.map(task => (
                 <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggle} 
                    onDelete={onDelete} 
                    onEdit={onEdit} 
                    showQuadrantTag={isAllView} // Only show tag in 'All' view
                 />
               ))
             )}
          </section>

          {/* Completed Section */}
          {completed.length > 0 && (
            <section className="space-y-3 opacity-80">
               <div className="flex items-center gap-2 mb-2 px-1">
                  <CheckCheck size={12} className="text-emerald-500/50" />
                  <h4 className="text-[10px] font-black uppercase tracking-tighter text-emerald-600/50">Completed ({completed.length})</h4>
               </div>
               <div className="space-y-2">
                 {completed.map(task => (
                   <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggle} 
                    onDelete={onDelete} 
                    onEdit={onEdit}
                    showQuadrantTag={isAllView}
                   />
                 ))}
               </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4">
        {/* Sort Controls */}
        <div className="flex justify-end px-2 md:px-0 z-20">
            <div className="relative">
                <button 
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowUpDown size={14} />
                    <span>Sort: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{SORT_OPTIONS.find(o => o.id === currentSort)?.label}</span></span>
                </button>
                
                {isSortMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsSortMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Prioritization Strategy</span>
                            </div>
                            <div className="p-1">
                                {SORT_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => { setCurrentSort(option.id); setIsSortMenuOpen(false); }}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex flex-col gap-0.5",
                                            currentSort === option.id 
                                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" 
                                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                        )}
                                    >
                                        <span className="font-bold flex items-center justify-between">
                                            {option.label}
                                            {currentSort === option.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                                        </span>
                                        <span className="text-[10px] opacity-70 leading-tight">
                                            {option.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* View Content */}
        <div className="flex-1 min-h-0 animate-in fade-in duration-500 pb-2">
            {currentTab === 'matrix' ? (
                <div className="h-full flex flex-col md:grid md:grid-cols-2 md:grid-rows-2 gap-4 overflow-y-auto md:overflow-visible">
                     {/* In 'matrix' mode on mobile, we stack all 4. On desktop we grid them. */}
                     {QUADRANTS.map(def => {
                         const { active, completed } = processedTasks.grouped[def.id];
                         return <React.Fragment key={def.id}>{renderColumn(active, completed, def)}</React.Fragment>;
                     })}
                </div>
            ) : currentTab === 'all' ? (
                <div className="h-full">
                    {renderColumn(processedTasks.allList.active, processedTasks.allList.completed)}
                </div>
            ) : (
                <div className="h-full">
                    {/* Render specific quadrant */}
                    {(() => {
                        const def = QUADRANTS.find(q => q.id === currentTab);
                        if (!def) return null;
                        const { active, completed } = processedTasks.grouped[def.id];
                        return renderColumn(active, completed, def);
                    })()}
                </div>
            )}
        </div>
    </div>
  );
};
