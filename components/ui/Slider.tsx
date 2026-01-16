
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
  colorClass = "accent-indigo-600",
  leftLabel,
  rightLabel
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md min-w-[32px] text-center">
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
          "w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-0",
          colorClass
        )}
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
};
