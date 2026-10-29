import React, { useState } from 'react';
import { ChartDataResponse } from '../../types';

interface CorrelationHeatmapProps {
  data: ChartDataResponse | null;
  isLoading?: boolean;
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ data, isLoading }) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: string; y: string; value: number } | null>(null);

  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Computing pairwise Pearson correlation matrix...
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
        Insufficient numerical features for correlation matrix (minimum 2 numerical columns required).
      </div>
    );
  }

  const columns: string[] = data.extra?.columns || [];

  const getCellBgColor = (val: number | null) => {
    if (val === null || val === undefined) return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
    if (val >= 0.8) return 'bg-sky-600 text-white';
    if (val >= 0.5) return 'bg-sky-500 text-white';
    if (val >= 0.2) return 'bg-sky-300 dark:bg-sky-800 text-sky-950 dark:text-sky-100';
    if (val > -0.2) return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
    if (val > -0.5) return 'bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100';
    if (val > -0.8) return 'bg-rose-400 dark:bg-rose-800 text-white';
    return 'bg-rose-600 text-white';
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {data.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pairwise Pearson coefficients [-1.00 to +1.00]
          </p>
        </div>

        {hoveredCell && (
          <div className="text-xs font-mono bg-slate-900 text-white px-3 py-1 rounded-md shadow">
            {hoveredCell.x} × {hoveredCell.y}: <strong>{hoveredCell.value?.toFixed(2)}</strong>
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 text-left font-medium">
                Features
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold text-center max-w-[90px] truncate"
                  title={col}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((rowCol, rIdx) => (
              <tr key={rIdx}>
                <td
                  className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate"
                  title={rowCol}
                >
                  {rowCol}
                </td>
                {columns.map((colCol, cIdx) => {
                  const cell = data.data.find(
                    (d: any) => d.y === rowCol && d.x === colCol
                  );
                  const val = cell ? cell.value : null;

                  return (
                    <td
                      key={cIdx}
                      onMouseEnter={() => val !== null && setHoveredCell({ x: colCol, y: rowCol, value: val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`p-3 border border-slate-200 dark:border-slate-800 text-center font-mono font-medium transition-transform hover:scale-105 cursor-pointer ${getCellBgColor(
                        val
                      )}`}
                    >
                      {val !== null && val !== undefined ? val.toFixed(2) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-600 inline-block" />
          <span>-1.0 Negative</span>
          <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700 inline-block ml-2" />
          <span>0.0 Neutral</span>
          <span className="w-3 h-3 rounded bg-sky-600 inline-block ml-2" />
          <span>+1.0 Positive</span>
        </div>
        <div className="italic text-[11px]">
          Note: High correlation does not imply causation.
        </div>
      </div>
    </div>
  );
};
