import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
  accent?: 'brand' | 'teal' | 'indigo' | 'amber' | 'rose';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  accent = 'brand',
  onClick
}) => {
  const accentIconStyles = {
    brand: 'text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-400',
    teal: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
  };

  const badgeStyles = {
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${accentIconStyles[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeStyles[badge.variant]}`}>
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};
