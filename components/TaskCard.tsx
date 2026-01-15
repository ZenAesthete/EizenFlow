
import React from 'react';
import { Task } from '../types';
import { calculateCurrentUrgency, getQuadrant } from '../utils/urgency';
import { Trash2, CheckCircle2, Circle, Edit2, Clock, Check } from 'lucide-react';
import { cn } from '../utils/cn';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  showQuadrantTag?: boolean;
}

const QUADRANT_LABELS: Record<string, { label: string, color: string }> = {
  do: { label: 'DO', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  schedule: { label: 'SCHED', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  delegate: { label: 'DEL', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  eliminate: { label: 'ELIM', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit, showQuadrantTag }) => {
  const urgency = calculateCurrentUrgency(task);
  const isOverdue = task.dueDate && Date.now() > task.dueDate;
  const quadrant = getQuadrant(task.importance, urgency);
  
  const getDueString = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isOverdue) return 'Overdue';
    if (isToday) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(task.id);
  };

  const handleEdit = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(task);
  };

  return (
    <div 
      className={cn(
        "group relative bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200",
        task.completed && "opacity-70 bg-slate-50 dark:bg-slate-800/40"
      )}
    >
      {/* Urgency Progress Bar (Top) */}
      {!task.completed && (
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-slate-100 dark:bg-slate-700 overflow-hidden z-0">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              urgency > 80 ? "bg-rose-500" : urgency > 50 ? "bg-amber-500" : "bg-emerald-500"
            )}
            style={{ width: `${urgency}%` }}
          />
        </div>
      )}

      <div className="mt-1.5 flex items-start gap-3 relative z-10">
        {/* Toggle Checkmark */}
        <button 
          type="button"
          onClick={handleToggle}
          className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title={task.completed ? "Mark as active" : "Mark as completed"}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content - Click to edit specifically here */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onEdit(task)}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate",
              task.completed && "line-through text-slate-500 font-normal italic"
            )}>
              {task.title}
            </h4>
            {showQuadrantTag && !task.completed && (
              <span className={cn(
                "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0",
                QUADRANT_LABELS[quadrant].color
              )}>
                {QUADRANT_LABELS[quadrant].label}
              </span>
            )}
          </div>
          
          {task.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue && !task.completed ? "text-rose-600 dark:text-rose-400" : "text-slate-500"
              )}>
                <Clock size={10} />
                <span>{getDueString()}</span>
              </div>
            )}
            
            {!task.completed && (
               <>
                 <div className="flex items-center gap-1">
                   <span className={cn(
                     "w-1.5 h-1.5 rounded-full",
                     task.importance > 80 ? "bg-rose-500" : task.importance > 50 ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
                   )} />
                   <span>IMP: {Math.round(task.importance)}</span>
                 </div>
                 {/* Only show Impact/Effort if explicitly set or relevant */}
                 {(task.impact !== undefined || task.effort !== undefined) && (
                     <div className="flex items-center gap-1 opacity-75">
                         <span>Ef:{Math.round(task.effort ?? 50)}</span>
                         <span>Im:{Math.round(task.impact ?? 50)}</span>
                     </div>
                 )}
               </>
            )}
          </div>
        </div>
      </div>

      {/* Actions (Visible on hover) */}
      <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm">
        <button 
          type="button"
          onClick={handleToggle}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            task.completed ? "text-slate-400 hover:text-slate-600" : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          )}
          title={task.completed ? "Mark Incomplete" : "Complete"}
        >
          <Check size={14} />
        </button>
        <button 
          type="button"
          onClick={handleEdit}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button 
          type="button"
          onClick={handleDelete}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
