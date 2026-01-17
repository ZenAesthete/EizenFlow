
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

    const activeTotal = activeTasks.length || 1; 

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
    <div className="w-full p-4 md:p-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
          {/* Header Area */}
          <div className="pb-2">
               <h2 className="text-2xl font-bold dark:text-white">Your Insights</h2>
               <p className="text-slate-500 text-sm">Track your progress and productivity metrics.</p>
          </div>

          {/* 4-Column Metric Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={<Target size={22} />} 
              label="Total Tasks" 
              value={stats.total} 
              color="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" 
            />
            <StatCard 
              icon={<CheckCircle2 size={22} />} 
              label="Completed" 
              value={stats.completed} 
              color="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" 
            />
            <StatCard 
              icon={<Clock size={22} />} 
              label="Pending" 
              value={stats.pending} 
              color="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" 
            />
            <StatCard 
              icon={<Trophy size={22} />} 
              label="Efficiency" 
              value={`${stats.winRate}%`} 
              color="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400" 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
              {/* Completion Rate - 100% Stacked Bar Section */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                 <h3 className="text-lg font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <CheckCircle2 size={18} />
                    </div>
                    Completion Rate
                 </h3>

                 <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-baseline mb-3">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Win Rate</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.winRate}%</span>
                        </div>
                        
                        {/* 100% Stacked Horizontal Bar - Redesigned */}
                        <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex shadow-inner">
                            <div 
                              style={{ width: `${stats.winRate}%` }} 
                              className="h-full bg-emerald-500 transition-all duration-1000 ease-out relative" 
                            />
                            {/* Remaining Part - Red as requested */}
                            <div className="flex-1 h-full bg-rose-500 transition-colors duration-300" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Done</div>
                            </div>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.completed}</div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-2 mb-1">
                                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Remaining</div>
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                            </div>
                            <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{stats.pending}</div>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Active Distribution Donut - Redesigned */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                 <h3 className="text-lg font-bold mb-2 flex items-center gap-3 text-slate-900 dark:text-white">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <AlertCircle size={18} />
                    </div>
                    Active Distribution
                 </h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 ml-11 mb-8">Where is your focus right now?</p>

                 <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* SVG Donut */}
                    <div className="relative w-40 h-40 shrink-0">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                             <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                             {stats.activeCount > 0 && donutSegments.map(seg => (
                               seg.pct > 0 ? (
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
                               ) : null
                             ))}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeCount}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                        </div>
                    </div>

                    {/* Legend - Vertical matching the style */}
                    <div className="flex-1 w-full space-y-4">
                        <LegendItem label="Do First" count={stats.quadrants.do} color="bg-rose-500" />
                        <LegendItem label="Schedule" count={stats.quadrants.schedule} color="bg-sky-500" />
                        <LegendItem label="Delegate" count={stats.quadrants.delegate} color="bg-amber-500" />
                        <LegendItem label="Eliminate" count={stats.quadrants.eliminate} color="bg-slate-400" />
                    </div>
                 </div>
              </div>
          </div>
        </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start gap-5 transition-transform hover:scale-[1.02] duration-200">
        <div className={cn("p-3 rounded-[14px] shadow-sm", color)}>
            {icon}
        </div>
        <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
        </div>
    </div>
);

const LegendItem = ({ label, count, color }: { label: string, count: number, color: string }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full shadow-sm", color)} />
            <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{count}</span>
    </div>
);
