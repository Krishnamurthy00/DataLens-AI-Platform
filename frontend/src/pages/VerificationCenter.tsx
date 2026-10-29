import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import { VerificationClaim } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Filter,
  Calculator,
  Binary
} from 'lucide-react';

export const VerificationCenter: React.FC = () => {
  const { dataset, setActiveTab } = useData();

  const [claims, setClaims] = useState<VerificationClaim[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Custom live claim verification state
  const [customClaimText, setCustomClaimText] = useState<string>('');
  const [customMetric, setCustomMetric] = useState<string>('mean');
  const [customValue, setCustomValue] = useState<string>('');
  const [customColumn, setCustomColumn] = useState<string>('');
  const [customTolerance, setCustomTolerance] = useState<number>(0.05);
  const [customResult, setCustomResult] = useState<VerificationClaim | null>(null);
  const [isCustomVerifying, setIsCustomVerifying] = useState<boolean>(false);

  const fetchSuite = async () => {
    if (!dataset?.session_id) return;
    setIsLoading(true);
    try {
      const res = await api.getVerificationSuite(dataset.session_id);
      setClaims(res.claims);
    } catch (err) {
      console.error('Failed to load verification suite:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuite();
    if (dataset?.columns && dataset.columns.length > 0) {
      setCustomColumn(dataset.columns[0].name);
    }
  }, [dataset?.session_id]);

  const handleCustomVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataset?.session_id || !customClaimText) return;
    setIsCustomVerifying(true);
    try {
      const val = customValue ? parseFloat(customValue) : undefined;
      const res = await api.verifyClaim(
        dataset.session_id,
        customClaimText,
        customMetric,
        val,
        customColumn || undefined,
        customTolerance
      );
      setCustomResult(res);
      // Also add to claims list
      setClaims(prev => [res, ...prev]);
    } catch (err) {
      console.error('Custom claim verification failed:', err);
    } finally {
      setIsCustomVerifying(false);
    }
  };

  if (!dataset) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-500 text-sm">Please upload or load a dataset first to enable Verification Center.</p>
        <button
          onClick={() => setActiveTab('upload')}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const verifiedCount = claims.filter(c => c.status === 'Verified').length;
  const reviewCount = claims.filter(c => c.status === 'Needs Review').length;
  const failedCount = claims.filter(c => c.status === 'Not Verified').length;

  const filteredClaims = filterStatus === 'all'
    ? claims
    : claims.filter(c => c.status === filterStatus);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Mathematical Verification Center
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              Dual-Engine Grounding
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-verifies AI claims by executing independent dual-engine (Pandas + raw NumPy) calculations against the active matrix.
          </p>
        </div>

        <button
          onClick={fetchSuite}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-verify Suite</span>
        </button>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterStatus('Verified')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'Verified'
              ? 'bg-emerald-50/50 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-700'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
              Mathematically Verified
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {verifiedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pandas & NumPy match within tolerance (&lt;0.05 delta)
          </p>
        </div>

        <div
          onClick={() => setFilterStatus('Needs Review')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'Needs Review'
              ? 'bg-amber-50/50 border-amber-400 dark:bg-amber-950/30 dark:border-amber-700'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">
              Needs Qualitative Review
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {reviewCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Qualitative causal claims or slight rounding discrepancies
          </p>
        </div>

        <div
          onClick={() => setFilterStatus('Not Verified')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'Not Verified'
              ? 'bg-rose-50/50 border-rose-400 dark:bg-rose-950/30 dark:border-rose-700'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">
              Failed Verification
            </span>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-300">
            {failedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Discrepancy beyond tolerance or ungrounded metric
          </p>
        </div>
      </div>

      {/* Live Custom Claim Verification Form */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-sky-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Live Claim Independent Recomputor (Faculty Live Demo Tool)
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter any hypothesis or claim. The engine will evaluate the claim text, execute dual-engine numerical verification, and compute the mathematical ground truth.
        </p>

        <form onSubmit={handleCustomVerify} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Claim Description</label>
              <input
                type="text"
                value={customClaimText}
                onChange={(e) => setCustomClaimText(e.target.value)}
                placeholder="e.g. Average hours studied is 19.5"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Metric</label>
              <select
                value={customMetric}
                onChange={(e) => setCustomMetric(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="mean">Mean</option>
                <option value="median">Median</option>
                <option value="std">Std Dev</option>
                <option value="min">Min</option>
                <option value="max">Max</option>
                <option value="missing_count">Missing Count</option>
                <option value="outlier_count">Outlier Count</option>
                <option value="causality">Causality / Hypothesis</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Target Feature</label>
              <select
                value={customColumn}
                onChange={(e) => setCustomColumn(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              >
                {dataset.columns.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Claimed Value</label>
              <input
                type="number"
                step="any"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="e.g. 19.5"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={isCustomVerifying || !customClaimText}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Binary className="w-3.5 h-3.5" />
              <span>{isCustomVerifying ? 'Recomputing via NumPy...' : 'Verify Claim Live'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Verified Claims List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Audited Claims Matrix ({filteredClaims.length})
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('Verified')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'Verified'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setFilterStatus('Needs Review')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'Needs Review'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Needs Review ({reviewCount})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border shadow-sm transition-all ${
                claim.status === 'Verified'
                  ? 'border-emerald-200 dark:border-emerald-900/60'
                  : claim.status === 'Needs Review'
                  ? 'border-amber-200 dark:border-amber-900/60'
                  : 'border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {claim.claim_text}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                    {claim.target_column && <span>Feature: <strong>{claim.target_column}</strong></span>}
                    {claim.extracted_number !== undefined && <span>Claimed: <strong>{claim.extracted_number}</strong></span>}
                    {claim.computed_value !== undefined && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Pandas Ground Truth: <strong>{claim.computed_value}</strong>
                      </span>
                    )}
                    {claim.secondary_numpy_value !== undefined && (
                      <span className="text-sky-600 dark:text-sky-400">
                        NumPy Recomputed: <strong>{claim.secondary_numpy_value}</strong>
                      </span>
                    )}
                    {claim.difference !== undefined && <span>Delta: {claim.difference}</span>}
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                    claim.status === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : claim.status === 'Needs Review'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {claim.status === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {claim.status === 'Needs Review' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {claim.status === 'Not Verified' && <XCircle className="w-3.5 h-3.5" />}
                  <span>{claim.status}</span>
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <strong>Method:</strong> {claim.verification_method} — {claim.explanation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
