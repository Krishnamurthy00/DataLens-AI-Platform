import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ChartDataResponse } from '../../types';

interface HistogramChartProps {
  data: ChartDataResponse | null;
  isLoading?: boolean;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Computing distribution bins...
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
        No histogram data available. Select a numerical feature.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {data.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {data.x_axis_label} vs {data.y_axis_label}
          </p>
        </div>
        {data.extra && (
          <div className="flex items-center gap-3 text-xs font-mono bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <span>Mean: <strong className="text-brand-600 dark:text-brand-400">{data.extra.mean}</strong></span>
            <span>Median: <strong className="text-emerald-600 dark:text-emerald-400">{data.extra.median}</strong></span>
            <span>Std: <strong>{data.extra.std}</strong></span>
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis
              dataKey="range"
              angle={-25}
              textAnchor="end"
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(value: any) => [`${value} occurrences`, 'Frequency']}
              labelFormatter={(label) => `Range: ${label}`}
            />
            <Bar
              dataKey="count"
              fill="#0ea5e9"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
