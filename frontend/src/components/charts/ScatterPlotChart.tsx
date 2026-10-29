import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ChartDataResponse } from '../../types';

interface ScatterPlotChartProps {
  data: ChartDataResponse | null;
  isLoading?: boolean;
}

export const ScatterPlotChart: React.FC<ScatterPlotChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Plotting bivariate coordinate points...
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
        No scatter data available. Select two numerical features.
      </div>
    );
  }

  const corr = data.extra?.correlation;
  const interp = data.extra?.interpretation;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {data.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            X: {data.x_axis_label} vs Y: {data.y_axis_label}
          </p>
        </div>
        {corr !== undefined && corr !== null && (
          <div className="flex items-center gap-2 text-xs bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800">
            <span>Pearson r: <strong className="font-mono">{corr}</strong></span>
            <span className="text-slate-400">•</span>
            <span className="font-medium">{interp}</span>
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis
              type="number"
              dataKey="x"
              name={data.x_axis_label}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={data.y_axis_label}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <ZAxis range={[30, 30]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px'
              }}
              formatter={(val: any, name: any) => [`${val}`, name]}
            />
            <Scatter
              name="Observations"
              data={data.data}
              fill="#0ea5e9"
              opacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
