
import React from 'react';
import { cn } from '../../utils/cn';

interface SliderProps {
  value: number;
  onChange: (val: number) => void;
  label: string;
  min?: number;
  max?: number;
  colorClass?: string;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  colorClass = "accent-indigo-600",
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon
}) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <div className="flex justify-between items-center">
        <label className="text-[12px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{label}</label>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md min-w-[28px] text-center">
          {Math.round(value)}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {leftIcon && <div className="text-slate-400 dark:text-slate-500">{leftIcon}</div>}
        
        <div className="relative flex-1 pt-0.5 pb-0.5">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(
              "w-full h-[4px] bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer focus:outline-none transition-all",
              colorClass
            )}
          />
        </div>

        {rightIcon && <div className="text-slate-400 dark:text-slate-500">{rightIcon}</div>}
      </div>

      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
};
