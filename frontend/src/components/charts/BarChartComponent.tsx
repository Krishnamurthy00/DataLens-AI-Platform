import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { ChartDataResponse } from '../../types';

interface BarChartProps {
  data: ChartDataResponse | null;
  isLoading?: boolean;
}

const CATEGORY_COLORS = [
  '#0284c7', '#0d9488', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'
];

export const BarChartComponent: React.FC<BarChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Aggregating categorical frequencies...
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
        No categorical data available. Select a categorical feature.
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
            Categorical representation: {data.x_axis_label}
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis
              dataKey="category"
              angle={-20}
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
              formatter={(value: any, _, item: any) => [
                `${value} records (${item?.payload?.percentage || 0}%)`,
                'Count'
              ]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={800}>
              {data.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
