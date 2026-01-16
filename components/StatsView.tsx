
import React, { useMemo } from 'react';
import { Task } from '../types';
import { calculateCurrentUrgency, getQuadrant } from '../utils/urgency';
import { cn } from '../utils/cn';
import { Trophy, Target, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface StatsViewProps {
  tasks: Task[];
}

export const StatsView: React.FC<StatsViewProps> = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const winRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Quadrant Analysis (Active Tasks Only)
    const activeTasks = tasks.filter(t => !t.completed);
    const quadrants = { do: 0, schedule: 0, delegate: 0, eliminate: 0 };
    
    activeTasks.forEach(t => {
      const urgency = calculateCurrentUrgency(t);
      const q = getQuadrant(t.importance, urgency);
      quadrants[q]++;
    });

    const activeTotal = activeTasks.length || 1; // Prevent div by 0 for percentages

    return {
      total,
      completed,
      pending,
      winRate,
      activeCount: activeTasks.length,
      quadrants,
      quadrantPcts: {
        do: Math.round((quadrants.do / activeTotal) * 100),
        schedule: Math.round((quadrants.schedule / activeTotal) * 100),
        delegate: Math.round((quadrants.delegate / activeTotal) * 100),
        eliminate: Math.round((quadrants.eliminate / activeTotal) * 100),
      }
    };
  }, [tasks]);

  // Donut Chart Helpers
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const donutSegments = [
    { id: 'do', color: 'text-rose-500', pct: stats.quadrantPcts.do },
    { id: 'schedule', color: 'text-sky-500', pct: stats.quadrantPcts.schedule },
    { id: 'delegate', color: 'text-amber-500', pct: stats.quadrantPcts.delegate },
    { id: 'eliminate', color: 'text-slate-400', pct: stats.quadrantPcts.eliminate },
  ].map(seg => {
    const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += (seg.pct / 100) * circumference;
    return { ...seg, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Target size={20} />} label="Total Tasks" value={stats.total} color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Completed" value={stats.completed} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={<Clock size={20} />} label="Pending" value={stats.pending} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <StatCard icon={<Trophy size={20} />} label="Efficiency" value={`${stats.winRate}%`} color="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          {/* Win Rate / Progress Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                <CheckCircle2 size={20} className="text-indigo-500" />
                Completion Rate
             </h3>

             <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm font-medium mb-2 text-slate-500 dark:text-slate-400">
                        <span>Win Rate</span>
                        <span className="text-slate-900 dark:text-white font-bold">{stats.winRate}%</span>
                    </div>
                    {/* 100% Stacked Bar */}
                    <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div style={{ width: `${stats.winRate}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-out" />
                        <div className="flex-1 h-full bg-slate-200 dark:bg-slate-700/50" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Done</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.completed}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Remaining</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.pending}</div>
                    </div>
                </div>
             </div>
          </div>

          {/* Quadrant Distribution Donut */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
             <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                <AlertCircle size={20} className="text-indigo-500" />
                Active Distribution
             </h3>
             <p className="text-sm text-slate-500 mb-6">Where is your focus right now?</p>

             <div className="flex items-center gap-6">
                {/* SVG Donut */}
                <div className="relative w-40 h-40 shrink-0">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                         {/* Background Circle */}
                         <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                         {/* Segments */}
                         {stats.activeCount > 0 && donutSegments.map(seg => (
                             <circle 
                                key={seg.id}
                                cx="50" cy="50" r={radius}
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={seg.strokeDasharray}
                                strokeDashoffset={seg.strokeDashoffset}
                                strokeLinecap="round"
                                className={cn(seg.color, "transition-all duration-1000 ease-out")}
                             />
                         ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeCount}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Active</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                    <LegendItem label="Do First" count={stats.quadrants.do} color="bg-rose-500" />
                    <LegendItem label="Schedule" count={stats.quadrants.schedule} color="bg-sky-500" />
                    <LegendItem label="Delegate" count={stats.quadrants.delegate} color="bg-amber-500" />
                    <LegendItem label="Eliminate" count={stats.quadrants.eliminate} color="bg-slate-400" />
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</div>
        </div>
    </div>
);

const LegendItem = ({ label, count, color }: { label: string, count: number, color: string }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", color)} />
            <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
        </div>
        <span className="font-bold text-slate-900 dark:text-white">{count}</span>
    </div>
);
