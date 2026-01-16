
import React, { useState, useEffect, useCallback } from 'react';
import { Task, MatrixTab } from './types';
import { Matrix } from './components/Matrix';
import { TaskForm } from './components/TaskForm';
import { GraphView } from './components/GraphView';
import { StatsView } from './components/StatsView';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SyncModal } from './components/SyncModal';
import { 
  Plus, LayoutGrid, Search, Zap, Moon, Sun, 
  ScatterChart, RefreshCw, Check, Cloud, Layers,
  List,
  Home,
  BarChart3,
  PieChart,
  X,
  Copy,
  Link,
  QrCode
} from 'lucide-react';
import { cn } from './utils/cn';

const STORAGE_KEY = 'eisenflow_data_v1';
const PREFS_KEY = 'eisenflow_prefs_v1';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Sync State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [importConfirm, setImportConfirm] = useState<{isOpen: boolean, newTasks: Task[] | null}>({ isOpen: false, newTasks: null });

  // Delete confirmation state
  const [deleteConfirmState, setDeleteConfirmState] = useState<{isOpen: boolean, taskId: string | null}>({
    isOpen: false,
    taskId: null
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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

  // Handler when QR is scanned successfully
  const handleQRImport = (importedTasks: Task[]) => {
    // Close sync modal immediately
    setShowSyncModal(false);
    // Ask for confirmation before overwriting
    setImportConfirm({ isOpen: true, newTasks: importedTasks });
  };

  const confirmImport = () => {
    if (importConfirm.newTasks) {
      setTasks(importConfirm.newTasks);
    }
    setImportConfirm({ isOpen: false, newTasks: null });
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
        <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 dark:bg-indigo-500 p-1.5 rounded-lg text-white shadow-md">
                    <Zap size={20} fill="currentColor" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Eisen<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
                </h1>
            </div>
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
           <div className="px-3 py-2">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
              </div>
           </div>
           <button 
             onClick={() => setShowSyncModal(true)}
             className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
           >
             <QrCode size={18} />
             Sync via QR
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
      <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shrink-0">
         {!isSearchVisible ? (
           <>
             <div className="flex items-center gap-2">
                <div className="bg-indigo-600 dark:bg-indigo-500 p-1 rounded-md text-white">
                    <Zap size={16} fill="currentColor" />
                </div>
                <h1 className="text-lg font-bold tracking-tight">EisenFlow</h1>
             </div>
             <div className="flex items-center gap-1">
                 <button onClick={() => setIsSearchVisible(true)} className="p-2 text-slate-500"><Search size={18} /></button>
                 <button onClick={() => setShowSyncModal(true)} className="p-2 text-slate-500"><QrCode size={18} /></button>
                 <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 text-slate-500">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
             </div>
           </>
         ) : (
           <div className="flex-1 flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                  <input 
                      type="text" 
                      placeholder="Search tasks..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-0 outline-none"
                      autoFocus
                  />
              </div>
              <button onClick={() => {setIsSearchVisible(false); setSearchQuery('');}} className="p-2 text-slate-500"><X size={20} /></button>
           </div>
         )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative overflow-hidden">
        
        {/* Stats Title Header or Simple spacing */}
        {currentView === 'stats' ? (
            <div className="p-6 pb-2 shrink-0">
                 <h2 className="text-2xl font-bold dark:text-white">Your Insights</h2>
                 <p className="text-slate-500 text-sm">Track your progress and productivity metrics.</p>
            </div>
        ) : (
          <div className="h-4 shrink-0" />
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pt-2 pb-24 md:pb-6 custom-scrollbar">
            {currentView === 'matrix' && (
                <Matrix 
                    tasks={filteredTasks} 
                    onToggle={toggleTask} 
                    onDelete={requestDeleteTask} 
                    onEdit={(t) => {setEditingTask(t); setIsFormOpen(true);}} 
                    onAddNew={() => setIsFormOpen(true)} 
                    viewMode="matrix" 
                />
            )}
            {currentView === 'list' && (
                 <Matrix 
                    tasks={filteredTasks} 
                    onToggle={toggleTask} 
                    onDelete={requestDeleteTask} 
                    onEdit={(t) => {setEditingTask(t); setIsFormOpen(true);}} 
                    onAddNew={() => setIsFormOpen(true)} 
                    viewMode="all" 
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

      {/* SYNC MODAL */}
      {showSyncModal && (
        <SyncModal 
            tasks={tasks}
            onImport={handleQRImport}
            onClose={() => setShowSyncModal(false)}
        />
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog 
        isOpen={deleteConfirmState.isOpen}
        title="Delete Task?"
        message="Are you sure you want to delete this task?"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
      />

      {/* IMPORT CONFIRMATION */}
      <ConfirmDialog 
        isOpen={importConfirm.isOpen}
        title="Overwrite Data?"
        message={`Scanned data contains ${importConfirm.newTasks?.length} tasks. This will overwrite your current ${tasks.length} tasks.`}
        onConfirm={confirmImport}
        onCancel={() => setImportConfirm({ isOpen: false, newTasks: null })}
      />
    </div>
  );
}
