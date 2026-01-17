
import React, { useMemo } from 'react';
import { Task } from '../types';
import { calculateCurrentUrgency, getQuadrant } from '../utils/urgency';
import { cn } from '../utils/cn';

interface GraphViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({ tasks, onEdit }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 md:p-6 pb-24 md:pb-6">
       {/* Container keeps graph square */}
       <div className="w-full max-w-[600px] aspect-square relative flex flex-col">
           
           <div className="flex-1 grid grid-cols-[20px_1fr] grid-rows-[1fr_20px] gap-1 h-full">
              {/* Y-Axis Label */}
              <div className="flex items-center justify-center">
                <div className="-rotate-90 whitespace-nowrap text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] select-none">
                   Importance &rarr;
                </div>
              </div>

              {/* Main Graph Box */}
              {/* Removed overflow-hidden from here to let tooltips spill out */}
              <div className="relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm z-0">
                 
                 {/* Background Quadrants - Clipped to corners */}
                 <div className="absolute inset-0 rounded-xl overflow-hidden z-0 pointer-events-none">
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                        <div className="bg-sky-50/50 dark:bg-sky-900/20 border-r border-b border-slate-200 dark:border-slate-800 p-2">
                            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 opacity-50">SCHEDULE</span>
                        </div>
                        <div className="bg-rose-50/50 dark:bg-rose-900/20 border-b border-slate-200 dark:border-slate-800 p-2 text-right">
                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 opacity-50">DO FIRST</span>
                        </div>
                        <div className="bg-slate-100/50 dark:bg-slate-800/20 border-r border-slate-200 dark:border-slate-800 p-2 flex items-end">
                            <span className="text-[10px] font-bold text-slate-500 opacity-50">ELIMINATE</span>
                        </div>
                        <div className="bg-amber-50/50 dark:bg-amber-900/20 p-2 flex items-end justify-end">
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 opacity-50">DELEGATE</span>
                        </div>
                    </div>
                    
                    {/* Center Crosshair lines */}
                    <div className="absolute inset-0">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600 border-l border-dashed border-slate-400/50" />
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300 dark:bg-slate-600 border-t border-dashed border-slate-400/50" />
                    </div>
                 </div>

                 {/* Tasks Points */}
                 <div className="absolute inset-0 z-10">
                   {tasks.map(task => {
                      const urgency = calculateCurrentUrgency(task); 
                      const importance = task.importance; 
                      
                      const x = Math.min(96, Math.max(4, urgency));
                      const y = Math.min(96, Math.max(4, importance));
                      
                      // Dynamic Tooltip Positioning Logic
                      const isTop = importance > 80;
                      const isLeft = urgency < 20;
                      const isRight = urgency > 80;

                      // Vertical Placement (Above or Below)
                      const verticalClass = isTop ? "top-full mt-2.5" : "bottom-full mb-2.5";
                      
                      // Horizontal Alignment & Arrow Position
                      let horizontalClass = "left-1/2 -translate-x-1/2";
                      let arrowPosClass = "left-1/2 -translate-x-1/2";
                      
                      if (isLeft) {
                        horizontalClass = "left-0 -translate-x-1"; 
                        arrowPosClass = "left-1.5";
                      } else if (isRight) {
                        horizontalClass = "right-0 translate-x-1";
                        arrowPosClass = "right-1.5";
                      }

                      // Arrow Direction (Points Up if tooltip is below, Points Down if tooltip is above)
                      // Using border trick for triangle
                      const arrowDirClass = isTop 
                        ? "bottom-full border-b-slate-800 dark:border-b-slate-700" // Points Up
                        : "top-full border-t-slate-800 dark:border-t-slate-700";   // Points Down

                      return (
                        <button
                          key={task.id}
                          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                          className="absolute w-4 h-4 md:w-6 md:h-6 -ml-2 -mb-2 md:-ml-3 md:-mb-3 group focus:outline-none z-20 hover:z-50 hover:scale-110 transition-transform"
                          style={{ left: `${x}%`, bottom: `${y}%` }}
                        >
                           <span className="block w-full h-full rounded-full shadow-sm border border-white dark:border-slate-900"
                           style={{ backgroundColor: getPointColor(importance, urgency) }}
                           />
                           
                           {/* Tooltip */}
                           <div className={cn(
                               "absolute hidden group-hover:block bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-medium py-1.5 px-3 rounded-lg shadow-xl w-max max-w-[150px] whitespace-normal break-words z-50 pointer-events-none cursor-default",
                               verticalClass,
                               horizontalClass
                           )}>
                               {task.title}
                               {/* CSS Triangle Arrow */}
                               <div className={cn(
                                   "absolute w-0 h-0 border-[6px] border-transparent",
                                   arrowDirClass,
                                   arrowPosClass
                               )} />
                           </div>
                        </button>
                      );
                   })}
                 </div>
              </div>

              <div />

              {/* X-Axis Label */}
              <div className="flex items-center justify-center">
                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] select-none">
                   Urgency &rarr;
                </div>
              </div>
           </div>
       </div>
    </div>
  );
};

const getPointColor = (imp: number, urg: number) => {
  if (imp >= 50 && urg >= 50) return '#f43f5e';
  if (imp >= 50 && urg < 50) return '#0ea5e9';
  if (imp < 50 && urg >= 50) return '#f59e0b';
  return '#64748b';
}
