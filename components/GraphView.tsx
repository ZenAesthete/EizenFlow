
import React, { useMemo } from 'react';
import { Task } from '../types';
import { calculateCurrentUrgency, getQuadrant } from '../utils/urgency';
import { cn } from '../utils/cn';

interface GraphViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ tasks, onEdit }) => {
  // Categorize tasks for counting
  const quadrantCounts = useMemo(() => {
    const counts = { do: 0, schedule: 0, delegate: 0, eliminate: 0 };
    tasks.forEach(task => {
      const urgency = calculateCurrentUrgency(task);
      const q = getQuadrant(task.importance, urgency);
      counts[q]++;
    });
    return counts;
  }, [tasks]);

  return (
    <div className="h-full w-full p-2 md:p-4 flex flex-col">
       {/* Axis Labels Container */}
       <div className="flex-1 grid grid-cols-[30px_1fr] grid-rows-[1fr_30px] gap-2">
          
          {/* Y-Axis Label (Importance) */}
          <div className="flex items-center justify-center">
            <div className="-rotate-90 whitespace-nowrap text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] select-none">
               Importance &rarr;
            </div>
          </div>

          {/* Main Graph Box */}
          <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-inner">
             
             {/* Background Quadrants */}
             <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-0">
                {/* Top Left: Schedule */}
                <div className="bg-sky-100/50 dark:bg-sky-900/25 border-r-2 border-b-2 border-slate-300 dark:border-slate-700 relative p-3 transition-colors">
                   <span className="text-sky-900 dark:text-sky-300 text-[10px] font-black uppercase tracking-widest opacity-40 select-none">Schedule</span>
                   <span className="absolute bottom-2 right-2 text-[9px] font-bold px-1 py-0.5 rounded bg-sky-200/60 dark:bg-sky-800/60 text-sky-700 dark:text-sky-400 min-w-[1rem] text-center shadow-sm">
                      {quadrantCounts.schedule}
                   </span>
                </div>

                {/* Top Right: Do First */}
                <div className="bg-rose-100/50 dark:bg-rose-900/25 border-b-2 border-slate-300 dark:border-slate-700 relative p-3 transition-colors text-right">
                   <span className="text-rose-900 dark:text-rose-300 text-[10px] font-black uppercase tracking-widest opacity-40 select-none">Do First</span>
                   <span className="absolute bottom-2 left-2 text-[9px] font-bold px-1 py-0.5 rounded bg-rose-200/60 dark:bg-rose-800/60 text-rose-700 dark:text-rose-400 min-w-[1rem] text-center shadow-sm">
                      {quadrantCounts.do}
                   </span>
                </div>

                {/* Bottom Left: Eliminate */}
                <div className="bg-slate-200/50 dark:bg-slate-800/50 border-r-2 border-slate-300 dark:border-slate-700 relative p-3 transition-colors flex items-end">
                   <span className="text-slate-900 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-40 select-none">Eliminate</span>
                   <span className="absolute top-2 right-2 text-[9px] font-bold px-1 py-0.5 rounded bg-slate-300/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 min-w-[1rem] text-center shadow-sm">
                      {quadrantCounts.eliminate}
                   </span>
                </div>

                {/* Bottom Right: Delegate */}
                <div className="bg-amber-100/50 dark:bg-amber-900/25 relative p-3 transition-colors flex items-end justify-end">
                   <span className="text-amber-900 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest opacity-40 select-none">Delegate</span>
                   <span className="absolute top-2 left-2 text-[9px] font-bold px-1 py-0.5 rounded bg-amber-200/60 dark:bg-amber-800/60 text-amber-700 dark:text-amber-400 min-w-[1rem] text-center shadow-sm">
                      {quadrantCounts.delegate}
                   </span>
                </div>
             </div>

             {/* Tasks Points */}
             <div className="absolute inset-0 z-10">
               {tasks.map(task => {
                  const urgency = calculateCurrentUrgency(task); 
                  const importance = task.importance; 
                  
                  const x = Math.min(94, Math.max(6, urgency));
                  const y = Math.min(94, Math.max(6, importance));
                  
                  // Alignment logic for extreme edges
                  const isTop = y > 75;
                  const isLeft = x < 20;
                  const isRight = x > 80;

                  return (
                    <button
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                      }}
                      className="absolute w-8 h-8 -ml-4 -mb-4 group focus:outline-none z-20 transition-all hover:scale-125 hover:z-50"
                      style={{
                        left: `${x}%`,
                        bottom: `${y}%`,
                      }}
                      aria-label={`Edit task: ${task.title}`}
                    >
                       <span className={cn(
                           "block w-full h-full rounded-full shadow-lg border-2 border-white dark:border-slate-800 ring-2 ring-transparent group-hover:ring-slate-400 dark:group-hover:ring-slate-500 transition-all",
                           task.completed ? "opacity-30 grayscale" : "opacity-100"
                       )}
                       style={{ backgroundColor: getPointColor(importance, urgency) }}
                       />
                      
                      {/* Enhanced Edge-Aware Tooltip */}
                      <div className={cn(
                        "absolute w-max max-w-[180px] hidden group-hover:flex flex-col z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150",
                        isTop ? "top-full mt-3" : "bottom-full mb-3",
                        isLeft ? "left-0 translate-x-0 items-start" : 
                        isRight ? "right-0 translate-x-0 items-end" : 
                        "left-1/2 -translate-x-1/2 items-center"
                      )}>
                         {/* Triangle pointing to the dot */}
                         {isTop && (
                            <div className={cn(
                                "w-2 h-2 bg-slate-900 dark:bg-white rotate-45 -mb-1 relative z-10",
                                isLeft ? "ml-3" : isRight ? "mr-3" : ""
                            )} />
                         )}
                         
                         <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs py-2 px-3 rounded-xl shadow-2xl ring-1 ring-white/20 dark:ring-black/10 backdrop-blur-md">
                           <p className="font-bold truncate">{task.title}</p>
                           <div className="flex gap-2 mt-1 opacity-70 text-[10px] font-mono">
                             <span>U:{Math.round(urgency)}</span>
                             <span>I:{Math.round(importance)}</span>
                           </div>
                         </div>

                         {!isTop && (
                            <div className={cn(
                                "w-2 h-2 bg-slate-900 dark:bg-white rotate-45 -mt-1",
                                isLeft ? "ml-3" : isRight ? "mr-3" : ""
                            )} />
                         )}
                      </div>
                    </button>
                  );
               })}
             </div>
          </div>

          <div />

          {/* X-Axis Label (Urgency) */}
          <div className="flex items-center justify-center">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] select-none">
               Urgency &rarr;
            </div>
          </div>
       </div>
    </div>
  );
};

const getPointColor = (imp: number, urg: number) => {
  if (imp >= 50 && urg >= 50) return '#f43f5e'; // Rose-500
  if (imp >= 50 && urg < 50) return '#0ea5e9'; // Sky-500
  if (imp < 50 && urg >= 50) return '#f59e0b'; // Amber-500
  return '#64748b'; // Slate-500
}
