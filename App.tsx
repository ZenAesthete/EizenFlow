
import React, { useState, useEffect, useCallback } from 'react';
import { Task, MatrixTab } from './types';
import { Matrix } from './components/Matrix';
import { TaskForm } from './components/TaskForm';
import { GraphView } from './components/GraphView';
import { StatsView } from './components/StatsView';
import { ConfirmDialog } from './components/ConfirmDialog';
import { pushToCloud, pullFromCloud, generateSyncKey } from './utils/sync';
import { 
  Plus, LayoutGrid, Search, Zap, Moon, Sun, 
  ScatterChart, RefreshCw, Check, Cloud, Layers,
  List,
  Home,
  BarChart3,
  PieChart
} from 'lucide-react';
import { cn } from './utils/cn';

const STORAGE_KEY = 'eisenflow_data_v1';
const PREFS_KEY = 'eisenflow_prefs_v1';
const SYNC_KEY_STORAGE = 'eisenflow_sync_key';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncKey, setSyncKey] = useState<string>(localStorage.getItem(SYNC_KEY_STORAGE) || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  // Delete confirmation state
  const [deleteConfirmState, setDeleteConfirmState] = useState<{isOpen: boolean, taskId: string | null}>({
    isOpen: false,
    taskId: null
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Replaced simple viewMode with specific navigation state
  const [currentView, setCurrentView] = useState<'matrix' | 'list' | 'graph' | 'stats'>('matrix');

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) { console.error("Error loading tasks", e); }
    }
    const savedPrefs = localStorage.getItem(PREFS_KEY);
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.theme) setTheme(prefs.theme);
        if (prefs.currentView) setCurrentView(prefs.currentView);
      } catch (e) { console.error(e); }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ theme, currentView }));
  }, [theme, currentView]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const handleSync = async () => {
    let currentKey = syncKey;
    if (!currentKey) {
      currentKey = generateSyncKey();
      setSyncKey(currentKey);
      localStorage.setItem(SYNC_KEY_STORAGE, currentKey);
    }
    setIsSyncing(true);
    setLastSyncStatus('idle');
    const success = await pushToCloud(currentKey, tasks);
    setIsSyncing(false);
    setLastSyncStatus(success ? 'success' : 'error');
    if (success) setTimeout(() => setLastSyncStatus('idle'), 3000);
  };

  const pullSync = async (inputKey: string) => {
    setIsSyncing(true);
    const cloudTasks = await pullFromCloud(inputKey);
    setIsSyncing(false);
    if (cloudTasks) {
      setTasks(cloudTasks);
      setSyncKey(inputKey);
      localStorage.setItem(SYNC_KEY_STORAGE, inputKey);
      setLastSyncStatus('success');
      return true;
    }
    setLastSyncStatus('error');
    return false;
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'urgencySetAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now(),
      urgencySetAt: Date.now(),
      urgencyCurve: taskData.urgencyCurve || 'linear', 
      impact: taskData.impact ?? 50,
      effort: taskData.effort ?? 50,
    };
    setTasks(prev => [...prev, newTask]);
    setIsFormOpen(false);
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'urgencySetAt' | 'completed'>) => {
    if (!editingTask) return;
    setTasks(prev => prev.map(t => {
      if (t.id !== editingTask.id) return t;
      const isUrgencyChanged = t.baseUrgency !== taskData.baseUrgency;
      return {
        ...t,
        ...taskData,
        urgencySetAt: isUrgencyChanged ? Date.now() : t.urgencySetAt
      };
    }));
    setEditingTask(undefined);
    setIsFormOpen(false);
  };

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const requestDeleteTask = useCallback((id: string) => {
    setDeleteConfirmState({ isOpen: true, taskId: id });
  }, []);

  const confirmDeleteTask = useCallback(() => {
    const idToDelete = deleteConfirmState.taskId;
    if (idToDelete) {
      setTasks(prev => prev.filter(t => t.id !== idToDelete));
      if (editingTask?.id === idToDelete) {
        setEditingTask(undefined);
        setIsFormOpen(false);
      }
    }
    setDeleteConfirmState({ isOpen: false, taskId: null });
  }, [deleteConfirmState.taskId, editingTask]);

  const cancelDeleteTask = useCallback(() => {
    setDeleteConfirmState({ isOpen: false, taskId: null });
  }, []);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const NAV_ITEMS = [
    { id: 'matrix', label: 'Matrix', icon: LayoutGrid },
    { id: 'list', label: 'Tasks', icon: List },
    { id: 'graph', label: 'Graph', icon: ScatterChart },
    { id: 'stats', label: 'Stats', icon: PieChart },
  ] as const;

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 z-30">
        <div className="p-6 flex items-center gap-2">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-1.5 rounded-lg text-white shadow-md">
                <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Eisen<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                currentView === item.id 
                  ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
           <button 
             onClick={() => setShowSyncModal(true)}
             className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
           >
             <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
             Sync
           </button>
           <button 
             onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
             className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
           >
             {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
             {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
           </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
         <div className="flex items-center gap-2">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-1 rounded-md text-white">
                <Zap size={16} fill="currentColor" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">EisenFlow</h1>
         </div>
         <div className="flex items-center gap-2">
             <button onClick={() => setShowSyncModal(true)} className="p-2 text-slate-500"><RefreshCw size={18} className={cn(isSyncing && "animate-spin")} /></button>
             <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 text-slate-500">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
         </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Search Bar (Global) */}
        {currentView !== 'stats' && (
          <div className="p-4 md:p-6 pb-2">
             <div className="relative max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input 
                      type="text" 
                      placeholder="Search tasks..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
                  />
              </div>
          </div>
        )}
        
        {/* Stats Title Header */}
        {currentView === 'stats' && (
            <div className="p-6 pb-2">
                 <h2 className="text-2xl font-bold dark:text-white">Your Insights</h2>
                 <p className="text-slate-500 text-sm">Track your progress and productivity metrics.</p>
            </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pt-2 pb-24 md:pb-6">
            {currentView === 'matrix' && (
                <Matrix 
                    tasks={filteredTasks} 
                    onToggle={toggleTask} 
                    onDelete={requestDeleteTask} 
                    onEdit={(t) => {setEditingTask(t); setIsFormOpen(true);}} 
                    onAddNew={() => setIsFormOpen(true)} 
                    viewMode="matrix" // Pass mode explicitly
                />
            )}
            {currentView === 'list' && (
                 <Matrix 
                    tasks={filteredTasks} 
                    onToggle={toggleTask} 
                    onDelete={requestDeleteTask} 
                    onEdit={(t) => {setEditingTask(t); setIsFormOpen(true);}} 
                    onAddNew={() => setIsFormOpen(true)} 
                    viewMode="all" // Reuse Matrix component in 'all' mode
                />
            )}
            {currentView === 'graph' && (
                <GraphView tasks={filteredTasks.filter(t => !t.completed)} onEdit={(t) => {setEditingTask(t); setIsFormOpen(true);}} />
            )}
             {currentView === 'stats' && (
                <StatsView tasks={tasks} />
            )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-30">
        <div className="flex items-center justify-around p-1">
           {NAV_ITEMS.map(item => (
             <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl flex-1 transition-all",
                  currentView === item.id 
                    ? "text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
             >
               <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
               <span className="text-[10px] font-medium">{item.label}</span>
             </button>
           ))}
        </div>
      </nav>

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }} 
        className="fixed z-40 right-4 bottom-20 md:bottom-8 md:right-8 w-14 h-14 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center justify-center active:scale-95 transition-all"
        aria-label="Add Task"
      >
        <Plus size={28} />
      </button>
      
      {isFormOpen && (
        <TaskForm 
          initialTask={editingTask} 
          onSave={editingTask ? handleUpdateTask : handleAddTask} 
          onCancel={() => { setIsFormOpen(false); setEditingTask(undefined); }} 
          onDelete={editingTask ? () => requestDeleteTask(editingTask.id) : undefined}
        />
      )}

      <ConfirmDialog 
        isOpen={deleteConfirmState.isOpen}
        title="Delete Task?"
        message="Are you sure you want to delete this task?"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
      />

      {showSyncModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                  <Cloud className="text-indigo-500" /> Cloud Sync
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sync tasks across your devices anonymously.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Your Sync Key</label>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 select-all">
                    {syncKey || 'No Key'}
                  </code>
                  <button onClick={handleSync} disabled={isSyncing} className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 disabled:opacity-50">
                    {lastSyncStatus === 'success' ? <Check size={18} /> : <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Paste Key here..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') pullSync((e.target as HTMLInputElement).value); }}
                />
                <button onClick={(e) => { const input = (e.currentTarget.previousSibling as HTMLInputElement); pullSync(input.value); }} className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold">Link</button>
              </div>
            </div>

            <button onClick={() => setShowSyncModal(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
