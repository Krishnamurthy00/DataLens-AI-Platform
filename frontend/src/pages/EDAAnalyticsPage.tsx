import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import { ChartDataResponse } from '../types';
import { HistogramChart } from '../components/charts/HistogramChart';
import { BarChartComponent } from '../components/charts/BarChartComponent';
import { BoxPlotChart } from '../components/charts/BoxPlotChart';
import { ScatterPlotChart } from '../components/charts/ScatterPlotChart';
import { CorrelationHeatmap } from '../components/charts/CorrelationHeatmap';
import {
  BarChart2,
  PieChart,
  Sliders,
  TrendingUp,
  Grid,
  Filter,
  Layers,
  Info
} from 'lucide-react';

export const EDAAnalyticsPage: React.FC = () => {
  const { dataset, setActiveTab } = useData();

  const [activeChartType, setActiveChartType] = useState<'histogram' | 'bar' | 'box' | 'scatter' | 'correlation'>('histogram');
  const [selectedX, setSelectedX] = useState<string>('');
  const [selectedY, setSelectedY] = useState<string>('');
  const [bins, setBins] = useState<number>(10);
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);

  const numCols = dataset?.columns.filter(c => c.inferred_type === 'numerical').map(c => c.name) || [];
  const catCols = dataset?.columns.filter(c => c.inferred_type !== 'numerical').map(c => c.name) || [];

  // Initialize selected columns based on chart type
  useEffect(() => {
    if (!dataset) return;
    if (activeChartType === 'histogram' || activeChartType === 'box') {
      if (!selectedX || !numCols.includes(selectedX)) {
        setSelectedX(numCols[0] || dataset.columns[0]?.name || '');
      }
    } else if (activeChartType === 'bar') {
      if (!selectedX || !catCols.includes(selectedX)) {
        setSelectedX(catCols[0] || dataset.columns[0]?.name || '');
      }
    } else if (activeChartType === 'scatter') {
      if (!selectedX || !numCols.includes(selectedX)) setSelectedX(numCols[0] || '');
      if (!selectedY || !numCols.includes(selectedY)) setSelectedY(numCols[1] || numCols[0] || '');
    }
  }, [activeChartType, dataset]);

  // Load chart data
  useEffect(() => {
    if (!dataset?.session_id) return;
    const fetchChart = async () => {
      setIsChartLoading(true);
      try {
        const res = await api.getChartData(dataset.session_id, {
          chart_type: activeChartType,
          x_column: selectedX || undefined,
          y_column: selectedY || undefined,
          bins: bins
        });
        setChartData(res);
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        setIsChartLoading(false);
      }
    };
    fetchChart();
  }, [dataset?.session_id, activeChartType, selectedX, selectedY, bins]);

  if (!dataset) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-500 text-sm">Please upload or load a dataset first.</p>
        <button
          onClick={() => setActiveTab('upload')}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Chart Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'histogram', label: '1. Histogram', icon: BarChart2, desc: 'Distribution & Skew' },
            { id: 'bar', label: '2. Categorical Bar', icon: PieChart, desc: 'Class Frequencies' },
            { id: 'box', label: '3. Box Plot', icon: Sliders, desc: 'Tukey Quartiles & Outliers' },
            { id: 'scatter', label: '4. Scatter Plot', icon: TrendingUp, desc: 'Bivariate Correlation' },
            { id: 'correlation', label: '5. Heatmap', icon: Grid, desc: 'Pairwise Pearson Matrix' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeChartType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveChartType(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Filters / Axes selection */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {(activeChartType === 'histogram' || activeChartType === 'box') && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Numerical Feature:</span>
              <select
                value={selectedX}
                onChange={(e) => setSelectedX(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 font-mono"
              >
                {numCols.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {activeChartType === 'histogram' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Bins:</span>
              <select
                value={bins}
                onChange={(e) => setBins(Number(e.target.value))}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5"
              >
                <option value={5}>5 Bins</option>
                <option value={10}>10 Bins</option>
                <option value={15}>15 Bins</option>
                <option value={20}>20 Bins</option>
              </select>
            </div>
          )}

          {activeChartType === 'bar' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Categorical Feature:</span>
              <select
                value={selectedX}
                onChange={(e) => setSelectedX(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 font-mono"
              >
                {catCols.length > 0 ? (
                  catCols.map((c, i) => <option key={i} value={c}>{c}</option>)
                ) : (
                  dataset.columns.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)
                )}
              </select>
            </div>
          )}

          {activeChartType === 'scatter' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">X-Axis:</span>
                <select
                  value={selectedX}
                  onChange={(e) => setSelectedX(e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 font-mono"
                >
                  {numCols.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">Y-Axis:</span>
                <select
                  value={selectedY}
                  onChange={(e) => setSelectedY(e.target.value)}
                  className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 font-mono"
                >
                  {numCols.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Chart Display Card */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        {activeChartType === 'histogram' && (
          <HistogramChart data={chartData} isLoading={isChartLoading} />
        )}
        {activeChartType === 'bar' && (
          <BarChartComponent data={chartData} isLoading={isChartLoading} />
        )}
        {activeChartType === 'box' && (
          <BoxPlotChart data={chartData} isLoading={isChartLoading} />
        )}
        {activeChartType === 'scatter' && (
          <ScatterPlotChart data={chartData} isLoading={isChartLoading} />
        )}
        {activeChartType === 'correlation' && (
          <CorrelationHeatmap data={chartData} isLoading={isChartLoading} />
        )}
      </div>

      {/* Comprehensive Summary Statistics Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Descriptive Statistics Summary Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Computed server-side using NumPy and Pandas (mean, std, median, min, max, Q1, Q3, IQR, outliers)
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {dataset.columns.length} Total Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/60 font-medium text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2 px-3 text-left">Feature</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-center">Missing</th>
                <th className="py-2 px-3 text-right">Mean</th>
                <th className="py-2 px-3 text-right">Median</th>
                <th className="py-2 px-3 text-right">Std Dev</th>
                <th className="py-2 px-3 text-right">Min</th>
                <th className="py-2 px-3 text-right">Max</th>
                <th className="py-2 px-3 text-right">IQR</th>
                <th className="py-2 px-3 text-center">Outliers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {dataset.columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    {col.name}
                  </td>
                  <td className="py-2 px-3 text-slate-500 font-sans">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800">
                      {col.inferred_type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={col.missing_count > 0 ? 'text-amber-500 font-semibold' : 'text-slate-400'}>
                      {col.missing_count}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                    {col.mean !== undefined ? col.mean : '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                    {col.median !== undefined ? col.median : (col.mode || '-')}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                    {col.std !== undefined ? col.std : '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                    {col.min !== undefined ? col.min : '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                    {col.max !== undefined ? col.max : '-'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">
                    {col.iqr !== undefined ? col.iqr : '-'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {(col.outliers_count || 0) > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                        {col.outliers_count}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
