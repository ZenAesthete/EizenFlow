
import React, { useState, useEffect, useCallback } from 'react';
import { Task, MatrixTab } from './types';
import { Matrix } from './components/Matrix';
import { TaskForm } from './components/TaskForm';
import { GraphView } from './components/GraphView';
import { ConfirmDialog } from './components/ConfirmDialog';
import { pushToCloud, pullFromCloud, generateSyncKey } from './utils/sync';
import { 
  Plus, LayoutGrid, Search, Zap, Moon, Sun, 
  ScatterChart, RefreshCw, Check, Cloud, Layers,
  List
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
  const [viewMode, setViewMode] = useState<'matrix' | 'graph'>('matrix');
  const [activeTab, setActiveTab] = useState<MatrixTab>('matrix'); // Default to matrix for structure

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
        if (prefs.viewMode) setViewMode(prefs.viewMode);
      } catch (e) { console.error(e); }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ theme, viewMode }));
  }, [theme, viewMode]);

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

  const TAB_ITEMS: { id: MatrixTab, label: string, icon?: React.ElementType }[] = [
      { id: 'matrix', label: 'Matrix', icon: LayoutGrid },
      { id: 'all', label: 'All Tasks', icon: List },
      { id: 'do', label: 'Do First' },
      { id: 'schedule', label: 'Schedule' },
      { id: 'delegate', label: 'Delegate' },
      { id: 'eliminate', label: 'Eliminate' },
  ];

  return (
    <div className="h-screen max-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col overflow-hidden transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-20 transition-colors">
        <div className="flex items-center gap-2 cursor-pointer select-none group" onClick={() => setViewMode(v => v === 'matrix' ? 'graph' : 'matrix')}>
            <div className="bg-indigo-600 dark:bg-indigo-500 p-1.5 rounded-lg text-white shadow-md group-hover:bg-indigo-700 transition-colors">
                <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                Eisen<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </h1>
        </div>

        <div className="flex-1 max-w-sm sm:max-w-md mx-4">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 outline-none"
                />
            </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setShowSyncModal(true)} 
              className={cn(
                "p-2 rounded-lg transition-all relative",
                syncKey ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title="Cloud Sync"
            >
              <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
              {syncKey && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900" />}
            </button>

            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
            <button onClick={() => setViewMode(v => v === 'matrix' ? 'graph' : 'matrix')} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hidden sm:block">{viewMode === 'matrix' ? <ScatterChart size={20} /> : <LayoutGrid size={20} />}</button>
            <button onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }} className="hidden sm:flex bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 text-white rounded-lg px-4 py-2 items-center gap-2 shadow-lg active:scale-95 transition-all"><Plus size={20} /><span className="font-medium">Add</span></button>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col md:flex-row p-2 md:p-6 gap-4 min-h-0">
        
        {/* Navigation Tabs (Responsive) */}
        {viewMode === 'matrix' && (
            <div className="shrink-0 md:h-full">
                {/* Mobile Tab Scroll */}
                <div className="md:hidden flex gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl overflow-x-auto no-scrollbar mb-2">
                    {TAB_ITEMS.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)} 
                            className={cn(
                                "flex-1 whitespace-nowrap py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5", 
                                activeTab === tab.id ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500"
                            )}
                        >
                            {tab.icon && <tab.icon size={14} />}
                            {tab.label}
                        </button>
                    ))}
                </div>

                 {/* Desktop Vertical/Horizontal Tabs (As Toolbar) */}
                 <div className="hidden md:flex flex-col gap-2 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 h-fit">
                    {TAB_ITEMS.map(tab => (
                         <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)} 
                            className={cn(
                                "px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 w-full text-left", 
                                activeTab === tab.id 
                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700" 
                                    : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                            )}
                        >
                            {tab.icon ? <tab.icon size={16} /> : <div className="w-4" />}
                            {tab.label}
                        </button>
                    ))}
                 </div>
            </div>
        )}

        <div className="flex-1 h-full min-h-0 relative">
            {viewMode === 'matrix' ? (
                <Matrix 
                    tasks={filteredTasks} 
                    onToggle={toggleTask} 
                    onDelete={requestDeleteTask} 
                    onEdit={(t) => {setEditingTask(t); setIsFormOpen(true);}} 
                    onAddNew={() => setIsFormOpen(true)} 
                    currentTab={activeTab} 
                />
            ) : (
                <GraphView tasks={filteredTasks.filter(t => !t.completed)} onEdit={(t) => {setEditingTask(t); setIsFormOpen(true);}} />
            )}
        </div>
      </main>

      <button onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }} className="sm:hidden absolute bottom-6 right-6 z-30 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"><Plus size={28} /></button>
      
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
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
      />

      {showSyncModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Cloud className="text-indigo-500" /> Cloud Sync
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Sync tasks across your devices without an account.</p>
              </div>
              <button onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" /></button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Your Secret Sync Key</label>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {syncKey || 'No Key Generated'}
                  </code>
                  <button onClick={handleSync} disabled={isSyncing} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {lastSyncStatus === 'success' ? <Check size={18} /> : <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Sync Key"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') pullSync((e.target as HTMLInputElement).value); }}
                />
                <button onClick={(e) => { const input = (e.currentTarget.previousSibling as HTMLInputElement); pullSync(input.value); }} className="bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-sm font-medium">Link</button>
              </div>
            </div>

            <button onClick={() => setShowSyncModal(false)} className="w-full py-2.5 text-slate-500 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
