
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="p-6">
           <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400 mx-auto sm:mx-0">
             <AlertTriangle size={24} />
           </div>
           <div className="text-center sm:text-left">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
               {message}
             </p>
           </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={onCancel}
             className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm"
           >
             Cancel
           </button>
           <button 
             onClick={onConfirm} 
             className="px-4 py-2.5 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/20 text-sm flex items-center justify-center gap-2"
           >
             Yes, Delete
           </button>
        </div>
      </div>
    </div>
  );
};
