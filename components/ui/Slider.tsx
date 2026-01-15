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
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  colorClass = "bg-indigo-600",
  leftLabel,
  rightLabel
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
          {Math.round(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
        )}
        style={{ accentColor: 'currentColor' }} 
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
};