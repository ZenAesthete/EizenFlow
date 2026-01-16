
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

const QUADRANT_STYLES: Record<string, { label: string, border: string, text: string, bg: string }> = {
  do: { label: 'Do First', border: 'border-l-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
  schedule: { label: 'Schedule', border: 'border-l-sky-500', text: 'text-sky-600', bg: 'bg-sky-50' },
  delegate: { label: 'Delegate', border: 'border-l-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  eliminate: { label: 'Eliminate', border: 'border-l-slate-400', text: 'text-slate-500', bg: 'bg-slate-50' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit, showQuadrantTag }) => {
  const urgency = calculateCurrentUrgency(task);
  const isOverdue = task.dueDate && Date.now() > task.dueDate;
  const quadrant = getQuadrant(task.importance, urgency);
  const styles = QUADRANT_STYLES[quadrant];

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
    e.preventDefault(); e.stopPropagation(); onDelete(task.id);
  };
  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation(); onToggle(task.id);
  };
  const handleEdit = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation(); onEdit(task);
  };

  return (
    <div 
      onClick={() => onEdit(task)}
      className={cn(
        "group relative bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden",
        "border-l-[3px]",
        styles.border,
        task.completed && "opacity-60 grayscale bg-slate-50 dark:bg-slate-800/40 border-l-slate-300"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button 
          type="button"
          onClick={handleToggle}
          className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
        >
          {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate pr-6",
              task.completed && "line-through text-slate-500"
            )}>
              {task.title}
            </h4>
          </div>
          
          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
            {showQuadrantTag && !task.completed && (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 uppercase tracking-wide", styles.text)}>
                    {styles.label}
                </span>
            )}
            
            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider",
                isOverdue && !task.completed ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-500"
              )}>
                <Clock size={12} />
                <span>{getDueString()}</span>
              </div>
            )}

            {!task.completed && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <span className={cn("w-1.5 h-1.5 rounded-full", urgency > 80 ? "bg-rose-500" : urgency > 50 ? "bg-amber-500" : "bg-emerald-500")} />
                    <span>U:{Math.round(urgency)}</span>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-2 right-2 flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md">
            <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
