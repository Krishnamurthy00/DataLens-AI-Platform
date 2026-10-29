import React from 'react';
import { useData, NavTab } from '../../context/DataContext';
import {
  LayoutDashboard,
  Upload,
  Sparkles,
  BarChart3,
  Bot,
  ShieldCheck,
  FileText,
  Database,
  GraduationCap,
  Settings,
  Home,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, dataset, loadDemo, isLoading } = useData();

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'landing', label: 'Home Overview', icon: Home },
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload & Preview', icon: Upload },
    { id: 'cleaning', label: 'Cleaning Studio', icon: Sparkles, badge: dataset?.quality?.total_duplicates ? `${dataset.quality.total_duplicates} dups` : undefined },
    { id: 'eda', label: 'EDA Analytics', icon: BarChart3 },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'verification', label: 'Verification Center', icon: ShieldCheck, badge: 'Core' },
    { id: 'report', label: 'Report Generator', icon: FileText },
    { id: 'catalog', label: 'Dataset Catalog', icon: Database },
    { id: 'capstone', label: 'Academic Capstone', icon: GraduationCap },
    { id: 'settings', label: 'Docs & Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <span className="font-bold text-lg font-mono">DL</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              DataLens <span className="text-sky-400 font-mono text-xs px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400">Intelligent EDA Platform</p>
          </div>
        </div>
      </div>

      {/* Active Dataset Pill */}
      <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Active Dataset:</span>
          {dataset ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> None
            </span>
          )}
        </div>
        <div className="mt-1 font-mono text-xs text-white truncate font-medium">
          {dataset ? dataset.filename : 'No dataset selected'}
        </div>
        {dataset && (
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
            <span>{dataset.total_rows} rows</span>
            <span>•</span>
            <span>{dataset.total_columns} cols</span>
            <span>•</span>
            <span className="text-sky-400 font-medium">Score: {dataset.quality.score}</span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  item.badge === 'Core'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Demo Action */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        {!dataset && (
          <button
            onClick={() => loadDemo()}
            disabled={isLoading}
            className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isLoading ? 'Loading Demo...' : 'Load Demo Dataset'}
          </button>
        )}
        <div className="mt-2 text-center text-[10px] text-slate-500">
          CSE Capstone Project v2.0
        </div>
      </div>
    </aside>
  );
};
