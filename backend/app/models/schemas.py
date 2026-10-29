from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

class DatasetMeta(BaseModel):
    session_id: str
    filename: str
    total_rows: int
    total_columns: int
    file_size_bytes: int
    memory_usage_kb: float
    column_names: List[str]
    column_types: Dict[str, str]
    inferred_types: Dict[str, str]

class ColumnSummary(BaseModel):
    name: str
    dtype: str
    inferred_type: str
    count: int
    missing_count: int
    missing_percentage: float
    unique_count: int
    # Numerical specific
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    q1: Optional[float] = None
    q3: Optional[float] = None
    iqr: Optional[float] = None
    skewness: Optional[float] = None
    kurtosis: Optional[float] = None
    outliers_count: Optional[int] = None
    # Categorical specific
    mode: Optional[Union[str, int, float]] = None
    top_categories: Optional[List[Dict[str, Any]]] = None

class DataQualityScore(BaseModel):
    score: float # 0 - 100
    grade: str # A, B, C, D, F
    completeness_score: float
    uniqueness_score: float
    validity_score: float
    consistency_score: float
    outlier_score: float
    calculation_breakdown: List[Dict[str, Any]]
    total_duplicates: int
    total_missing_cells: int
    total_cells: int
    missing_percentage: float
    duplicate_percentage: float

class DatasetOverview(BaseModel):
    meta: DatasetMeta
    quality: DataQualityScore
    columns: List[ColumnSummary]
    sample_preview: List[Dict[str, Any]]
    recent_audit_logs: List[Dict[str, Any]]

class CleaningActionRequest(BaseModel):
    action: str # "remove_duplicates", "fill_missing", "drop_column", "drop_missing_rows", "convert_type", "remove_outliers"
    column: Optional[str] = None
    method: Optional[str] = None # "mean", "median", "mode", "constant", "iqr"
    custom_value: Optional[Union[str, float, int]] = None
    target_type: Optional[str] = None # "int", "float", "str", "datetime"

class CleaningActionResult(BaseModel):
    success: bool
    action: str
    description: str
    rows_affected: int
    columns_affected: int
    remaining_rows: int
    remaining_columns: int
    preview_rows: List[Dict[str, Any]]
    quality_before: float
    quality_after: float

class CorrelationMatrix(BaseModel):
    columns: List[str]
    matrix: List[List[Optional[float]]]

class ChartConfigRequest(BaseModel):
    chart_type: str # "histogram", "bar", "box", "scatter", "correlation"
    x_column: Optional[str] = None
    y_column: Optional[str] = None
    bins: Optional[int] = 10
    top_n: Optional[int] = 10

class ChartDataResponse(BaseModel):
    chart_type: str
    title: str
    x_axis_label: str
    y_axis_label: str
    data: List[Dict[str, Any]]
    extra: Optional[Dict[str, Any]] = None

class AIChatRequest(BaseModel):
    message: str
    active_chart: Optional[str] = None
    focus_column: Optional[str] = None
    context_filters: Optional[Dict[str, Any]] = None

class VerificationClaim(BaseModel):
    id: str
    claim_text: str
    extracted_number: Optional[float] = None
    claimed_metric: str # e.g. "mean_hours_studied", "missing_percentage"
    target_column: Optional[str] = None
    computed_value: Optional[float] = None
    secondary_numpy_value: Optional[float] = None
    status: str # "Verified", "Needs Review", "Not Verified"
    tolerance_used: float = 0.01
    difference: Optional[float] = None
    verification_method: str
    explanation: str

class AIChatResponse(BaseModel):
    answer: str
    claims: List[VerificationClaim]
    model_provider: str
    is_fallback_mode: bool
    suggestions: List[str]

class ReportGenerationRequest(BaseModel):
    project_title: str
    analyst_name: str
    dataset_source: str
    license_type: str
    include_charts: bool = True
    include_verification: bool = True
    custom_notes: Optional[str] = None
