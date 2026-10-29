export interface QualityBreakdownItem {
  metric: string;
  achieved: number;
  max: number;
  formula: string;
  details: string;
}

export interface DataQualityScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  completeness_score: number;
  uniqueness_score: number;
  validity_score: number;
  consistency_score: number;
  outlier_score: number;
  total_duplicates: number;
  total_missing_cells: number;
  total_cells: number;
  missing_percentage: number;
  duplicate_percentage: number;
  calculation_breakdown: QualityBreakdownItem[];
}

export interface TopCategoryItem {
  category: string;
  count: number;
  percentage: number;
}

export interface ColumnSummary {
  name: string;
  dtype: string;
  inferred_type: string;
  count: number;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  skewness?: number;
  kurtosis?: number;
  outliers_count?: number;
  mode?: string | number;
  top_categories?: TopCategoryItem[];
}

export interface AuditLogItem {
  step: number;
  action: string;
  column?: string;
  method?: string;
  description: string;
  rows_affected?: number;
  remaining_rows?: number;
  quality_score?: number;
}

export interface DatasetOverview {
  session_id: string;
  filename: string;
  total_rows: number;
  total_columns: number;
  file_size_bytes?: number;
  quality: DataQualityScore;
  columns: ColumnSummary[];
  sample_preview: Record<string, any>[];
  audit_logs: AuditLogItem[];
}

export interface VerificationClaim {
  id: string;
  claim_text: string;
  extracted_number?: number;
  claimed_metric: string;
  target_column?: string;
  computed_value?: number;
  secondary_numpy_value?: number;
  status: 'Verified' | 'Needs Review' | 'Not Verified';
  tolerance_used: number;
  difference?: number;
  verification_method: string;
  explanation: string;
}

export interface CleaningActionResult {
  success: boolean;
  action: string;
  description: string;
  rows_affected: number;
  columns_affected: number;
  remaining_rows: number;
  remaining_columns: number;
  quality_before: number;
  quality_after: number;
  preview_rows: Record<string, any>[];
}

export interface ChartDataResponse {
  chart_type: string;
  title: string;
  x_axis_label: string;
  y_axis_label: string;
  data: any[];
  extra?: Record<string, any>;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  claims?: VerificationClaim[];
  is_fallback?: boolean;
  suggestions?: string[];
}

export interface DatasetSourceItem {
  name: string;
  category: string;
  description: string;
  provider: string;
  url: string;
  license: string;
  rows_approx: string;
  attributes_approx: string;
  limitations: string;
  verified_provenance: boolean;
}
