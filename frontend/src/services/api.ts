import {
  DatasetOverview,
  CleaningActionResult,
  ChartDataResponse,
  VerificationClaim,
  AIChatMessage
} from '../types';

const API_BASE = '/api';

export const api = {
  async health(): Promise<{ status: string; service: string; version: string; ai_provider: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend offline');
    return res.json();
  },

  async loadDemoDataset(): Promise<DatasetOverview> {
    const res = await fetch(`${API_BASE}/dataset/demo`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to load demo dataset' }));
      throw new Error(err.detail || 'Demo dataset error');
    }
    return res.json();
  },

  async uploadCsv(file: File): Promise<DatasetOverview> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/dataset/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'File upload error');
    }
    return res.json();
  },

  async getOverview(sessionId: string): Promise<DatasetOverview> {
    const res = await fetch(`${API_BASE}/dataset/${sessionId}/overview`);
    if (!res.ok) throw new Error('Failed to fetch dataset overview');
    return res.json();
  },

  async getTable(sessionId: string, page = 1, pageSize = 15, search = '') {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
      ...(search ? { search } : {})
    });
    const res = await fetch(`${API_BASE}/dataset/${sessionId}/table?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch table records');
    return res.json();
  },

  async previewCleaning(sessionId: string, actionData: any): Promise<CleaningActionResult> {
    const res = await fetch(`${API_BASE}/cleaning/preview?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Preview failed' }));
      throw new Error(err.detail || 'Preview transformation error');
    }
    return res.json();
  },

  async applyCleaning(sessionId: string, actionData: any): Promise<CleaningActionResult> {
    const res = await fetch(`${API_BASE}/cleaning/apply?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Application failed' }));
      throw new Error(err.detail || 'Apply transformation error');
    }
    return res.json();
  },

  async undoCleaning(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cleaning/${sessionId}/undo`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Undo failed' }));
      throw new Error(err.detail || 'Undo error');
    }
    return res.json();
  },

  async resetCleaning(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/cleaning/${sessionId}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    return res.json();
  },

  async getChartData(sessionId: string, config: { chart_type: string; x_column?: string; y_column?: string; bins?: number; top_n?: number }): Promise<ChartDataResponse> {
    const res = await fetch(`${API_BASE}/charts/data?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to load chart data');
    return res.json();
  },

  async askAI(sessionId: string, message: string, activeChart?: string, focusColumn?: string): Promise<{ answer: string; claims: VerificationClaim[]; model_provider: string; is_fallback_mode: boolean; suggestions: string[] }> {
    const res = await fetch(`${API_BASE}/ai/chat?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, active_chart: activeChart, focus_column: focusColumn }),
    });
    if (!res.ok) throw new Error('AI assistant failed to respond');
    return res.json();
  },

  async getVerificationSuite(sessionId: string): Promise<{ session_id: string; claims: VerificationClaim[] }> {
    const res = await fetch(`${API_BASE}/verification/${sessionId}/suite`);
    if (!res.ok) throw new Error('Failed to run verification suite');
    return res.json();
  },

  async verifyClaim(sessionId: string, claimText: string, metric: string, value?: number, column?: string, tolerance = 0.05): Promise<VerificationClaim> {
    const params = new URLSearchParams({
      session_id: sessionId,
      claim_text: claimText,
      claimed_metric: metric,
      ...(value !== undefined ? { claimed_value: String(value) } : {}),
      ...(column ? { target_column: column } : {}),
      tolerance: String(tolerance)
    });
    const res = await fetch(`${API_BASE}/verification/${sessionId}/verify-claim?${params.toString()}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to verify custom claim');
    return res.json();
  },

  async getReportHtml(sessionId: string, payload: { project_title: string; analyst_name: string; dataset_source: string; license_type: string; custom_notes?: string }): Promise<string> {
    const res = await fetch(`${API_BASE}/report/${sessionId}/html`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate HTML preview');
    return res.text();
  },

  getDownloadPdfUrl(sessionId: string, payload: { project_title: string; analyst_name: string; dataset_source: string; license_type: string; custom_notes?: string }): string {
    return `${API_BASE}/report/${sessionId}/pdf`;
  },

  getDownloadCsvUrl(sessionId: string): string {
    return `${API_BASE}/report/${sessionId}/csv`;
  }
};
