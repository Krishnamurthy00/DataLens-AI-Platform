import React from 'react';
import { ChartDataResponse } from '../../types';
import { AlertCircle } from 'lucide-react';

interface BoxPlotChartProps {
  data: ChartDataResponse | null;
  isLoading?: boolean;
}

export const BoxPlotChart: React.FC<BoxPlotChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Calculating quartiles & outliers...
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
        No box plot data available. Select a numerical feature.
      </div>
    );
  }

  const item = data.data[0];
  const { min, q1, median, q3, max, iqr, outliers_count, outlier_samples } = item;

  // Calculate percentage positions across the range [min, max] or including extreme outliers
  const allValues = [min, q1, median, q3, max, ...(outlier_samples || [])];
  const domainMin = Math.min(...allValues);
  const domainMax = Math.max(...allValues);
  const range = domainMax - domainMin || 1;

  const toPct = (val: number) => {
    return Math.max(0, Math.min(100, ((val - domainMin) / range) * 100));
  };

  const minPct = toPct(min);
  const q1Pct = toPct(q1);
  const medPct = toPct(median);
  const q3Pct = toPct(q3);
  const maxPct = toPct(max);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {data.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tukey 5-Number Summary (Min, Q1, Median, Q3, Max) & IQR Outlier Fences
          </p>
        </div>
        {outliers_count > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{outliers_count} outlier{outliers_count > 1 ? 's' : ''} detected</span>
          </div>
        )}
      </div>

      {/* Visual Box & Whisker Display */}
      <div className="py-8 px-4 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative h-20 w-full flex items-center">
          {/* Base Axis Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-slate-300 dark:bg-slate-700" />

          {/* Left Whisker Line */}
          <div
            className="absolute h-1 bg-brand-500 rounded"
            style={{ left: `${minPct}%`, width: `${Math.max(0, q1Pct - minPct)}%` }}
          />

          {/* Left Whisker End Cap */}
          <div
            className="absolute w-1 h-8 bg-brand-600 dark:bg-brand-400 rounded transform -translate-x-1/2"
            style={{ left: `${minPct}%` }}
            title={`Minimum Whisker: ${min}`}
          />

          {/* IQR Box (Q1 to Q3) */}
          <div
            className="absolute h-14 bg-gradient-to-r from-brand-500/20 to-teal-500/20 border-2 border-brand-500 dark:border-brand-400 rounded-md shadow-sm"
            style={{ left: `${q1Pct}%`, width: `${Math.max(2, q3Pct - q1Pct)}%` }}
            title={`IQR Range: [${q1} - ${q3}]`}
          />

          {/* Median Line inside Box */}
          <div
            className="absolute w-1.5 h-16 bg-emerald-600 dark:bg-emerald-400 rounded shadow transform -translate-x-1/2 z-10"
            style={{ left: `${medPct}%` }}
            title={`Median: ${median}`}
          />

          {/* Right Whisker Line */}
          <div
            className="absolute h-1 bg-teal-500 rounded"
            style={{ left: `${q3Pct}%`, width: `${Math.max(0, maxPct - q3Pct)}%` }}
          />

          {/* Right Whisker End Cap */}
          <div
            className="absolute w-1 h-8 bg-teal-600 dark:bg-teal-400 rounded transform -translate-x-1/2"
            style={{ left: `${maxPct}%` }}
            title={`Maximum Whisker: ${max}`}
          />

          {/* Outlier Points */}
          {outlier_samples && outlier_samples.map((val: number, idx: number) => {
            const outPct = toPct(val);
            return (
              <div
                key={idx}
                className="absolute w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 shadow transform -translate-x-1/2 z-20 hover:scale-125 transition-transform"
                style={{ left: `${outPct}%` }}
                title={`Outlier point: ${val}`}
              />
            );
          })}
        </div>

        {/* Labels below chart */}
        <div className="relative mt-4 h-6 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span className="absolute transform -translate-x-1/2" style={{ left: `${minPct}%` }}>
            Min: {min}
          </span>
          <span className="absolute transform -translate-x-1/2" style={{ left: `${q1Pct}%` }}>
            Q1: {q1}
          </span>
          <span className="absolute transform -translate-x-1/2 font-bold text-emerald-600 dark:text-emerald-400" style={{ left: `${medPct}%` }}>
            Med: {median}
          </span>
          <span className="absolute transform -translate-x-1/2" style={{ left: `${q3Pct}%` }}>
            Q3: {q3}
          </span>
          <span className="absolute transform -translate-x-1/2" style={{ left: `${maxPct}%` }}>
            Max: {max}
          </span>
        </div>
      </div>

      {/* Summary statistics badges */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded bg-slate-100 dark:bg-slate-800">
          <span className="text-slate-400 block text-[10px]">Interquartile Range (IQR)</span>
          <strong className="font-mono text-slate-800 dark:text-slate-200">{iqr}</strong>
        </div>
        <div className="p-2 rounded bg-slate-100 dark:bg-slate-800">
          <span className="text-slate-400 block text-[10px]">Lower Fence (Q1 - 1.5×IQR)</span>
          <strong className="font-mono text-slate-800 dark:text-slate-200">{(q1 - 1.5 * iqr).toFixed(1)}</strong>
        </div>
        <div className="p-2 rounded bg-slate-100 dark:bg-slate-800">
          <span className="text-slate-400 block text-[10px]">Upper Fence (Q3 + 1.5×IQR)</span>
          <strong className="font-mono text-slate-800 dark:text-slate-200">{(q3 + 1.5 * iqr).toFixed(1)}</strong>
        </div>
        <div className="p-2 rounded bg-slate-100 dark:bg-slate-800">
          <span className="text-slate-400 block text-[10px]">Outliers Detected</span>
          <strong className={`font-mono ${outliers_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {outliers_count}
          </strong>
        </div>
      </div>
    </div>
  );
};
