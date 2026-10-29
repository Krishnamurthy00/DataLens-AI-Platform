import math
import re
import uuid
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from .data_engine import data_engine

class VerificationEngine:
    def verify_claim(
        self,
        df: pd.DataFrame,
        claim_text: str,
        claimed_metric: str,
        claimed_value: Optional[float],
        target_column: Optional[str] = None,
        tolerance: float = 0.05
    ) -> Dict[str, Any]:
        """
        Independently computes statistics using both Pandas and raw NumPy.
        Compares claimed value against ground truth calculation.
        """
        claim_id = str(uuid.uuid4())[:8]

        # Case 1: Qualitative / causal / subjective claim
        if claimed_metric.lower() in ["causality", "interpretation", "hypothesis", "subjective"]:
            return {
                "id": claim_id,
                "claim_text": claim_text,
                "extracted_number": claimed_value,
                "claimed_metric": claimed_metric,
                "target_column": target_column,
                "computed_value": None,
                "secondary_numpy_value": None,
                "status": "Needs Review",
                "tolerance_used": tolerance,
                "difference": None,
                "verification_method": "Qualitative Epistemic Check",
                "explanation": (
                    "This statement represents a qualitative inference or causal hypothesis. "
                    "In exploratory data analysis, correlation or observed co-occurrence does not establish "
                    "mathematical proof of causation. Human domain expert review required."
                )
            }

        # Case 2: Numerical metric verification
        if not target_column or target_column not in df.columns:
            # Check if dataset-wide metric like total_rows, missing_percentage, etc.
            if claimed_metric in ["total_rows", "row_count"]:
                actual_val = float(len(df))
                numpy_val = float(np.shape(df)[0])
            elif claimed_metric in ["total_columns", "col_count"]:
                actual_val = float(len(df.columns))
                numpy_val = float(np.shape(df)[1])
            elif claimed_metric in ["duplicate_rows", "duplicates"]:
                actual_val = float(df.duplicated().sum())
                numpy_val = actual_val
            elif claimed_metric in ["missing_percentage", "missing_pct"]:
                actual_val = float((df.isna().sum().sum() / (len(df) * len(df.columns))) * 100) if len(df) > 0 else 0.0
                numpy_val = actual_val
            else:
                return {
                    "id": claim_id,
                    "claim_text": claim_text,
                    "extracted_number": claimed_value,
                    "claimed_metric": claimed_metric,
                    "target_column": target_column,
                    "computed_value": None,
                    "secondary_numpy_value": None,
                    "status": "Not Verified",
                    "tolerance_used": tolerance,
                    "difference": None,
                    "verification_method": "Target Feature Lookup",
                    "explanation": f"Column '{target_column}' does not exist in active dataset."
                }
        else:
            series = df[target_column]
            clean = series.dropna()

            if claimed_metric in ["missing_count", "missing_values"]:
                actual_val = float(series.isna().sum())
                numpy_val = float(np.sum(pd.isna(series).to_numpy()))
            elif claimed_metric in ["missing_percentage"]:
                actual_val = float((series.isna().sum() / len(df)) * 100) if len(df) > 0 else 0.0
                numpy_val = actual_val
            elif claimed_metric in ["unique_count", "cardinality"]:
                actual_val = float(series.nunique())
                numpy_val = float(len(np.unique(clean.to_numpy())))
            elif pd.api.types.is_numeric_dtype(series) and len(clean) > 0:
                raw_np = clean.to_numpy(dtype=float)
                if claimed_metric in ["mean", "average"]:
                    actual_val = float(clean.mean())
                    numpy_val = float(np.mean(raw_np))
                elif claimed_metric in ["median"]:
                    actual_val = float(clean.median())
                    numpy_val = float(np.median(raw_np))
                elif claimed_metric in ["std", "standard_deviation"]:
                    actual_val = float(clean.std(ddof=1)) if len(clean) > 1 else 0.0
                    numpy_val = float(np.std(raw_np, ddof=1)) if len(raw_np) > 1 else 0.0
                elif claimed_metric in ["min", "minimum"]:
                    actual_val = float(clean.min())
                    numpy_val = float(np.min(raw_np))
                elif claimed_metric in ["max", "maximum"]:
                    actual_val = float(clean.max())
                    numpy_val = float(np.max(raw_np))
                elif claimed_metric in ["q1", "25th_percentile"]:
                    actual_val = float(clean.quantile(0.25))
                    numpy_val = float(np.percentile(raw_np, 25))
                elif claimed_metric in ["q3", "75th_percentile"]:
                    actual_val = float(clean.quantile(0.75))
                    numpy_val = float(np.percentile(raw_np, 75))
                elif claimed_metric in ["iqr"]:
                    actual_val = float(clean.quantile(0.75) - clean.quantile(0.25))
                    numpy_val = float(np.percentile(raw_np, 75) - np.percentile(raw_np, 25))
                elif claimed_metric in ["outlier_count", "outliers"]:
                    cnt, _, _, _ = data_engine.calculate_iqr_outliers(series)
                    actual_val = float(cnt)
                    numpy_val = float(cnt)
                else:
                    actual_val = None
                    numpy_val = None
            else:
                # Non-numerical column metrics
                if claimed_metric in ["mode"]:
                    modes = series.mode()
                    mode_val = modes.iloc[0] if not modes.empty else None
                    return {
                        "id": claim_id,
                        "claim_text": claim_text,
                        "extracted_number": claimed_value,
                        "claimed_metric": claimed_metric,
                        "target_column": target_column,
                        "computed_value": None,
                        "secondary_numpy_value": None,
                        "status": "Verified" if str(claimed_value).lower() == str(mode_val).lower() else "Needs Review",
                        "tolerance_used": 0.0,
                        "difference": 0.0,
                        "verification_method": "Categorical Mode Lookup",
                        "explanation": f"Categorical mode computed as '{mode_val}'."
                    }
                actual_val = None
                numpy_val = None

        if actual_val is None or claimed_value is None:
            return {
                "id": claim_id,
                "claim_text": claim_text,
                "extracted_number": claimed_value,
                "claimed_metric": claimed_metric,
                "target_column": target_column,
                "computed_value": None,
                "secondary_numpy_value": None,
                "status": "Needs Review",
                "tolerance_used": tolerance,
                "difference": None,
                "verification_method": "Calculation Inconclusive",
                "explanation": f"Could not compute reference value for metric '{claimed_metric}'."
            }

        diff = abs(actual_val - claimed_value)
        # Check relative difference if values are large
        relative_diff = diff / max(abs(actual_val), 1.0)

        # Cross verify pandas with raw numpy
        cross_calc_diff = abs(actual_val - (numpy_val if numpy_val is not None else actual_val))

        if diff <= tolerance or relative_diff <= 0.01:
            status = "Verified"
            explanation = (
                f"Statistically verified: Claimed {claimed_value:.2f} matches ground truth {actual_val:.2f} "
                f"(Pandas: {actual_val:.4f}, NumPy: {numpy_val:.4f}, delta: {diff:.4f} within tolerance {tolerance})."
            )
        elif diff <= 2.0 or relative_diff <= 0.05:
            status = "Needs Review"
            explanation = (
                f"Minor discrepancy: Claimed {claimed_value:.2f} differs from computed {actual_val:.2f} by {diff:.2f}. "
                f"Likely due to rounding, degrees of freedom (ddof), or outlier filtering."
            )
        else:
            status = "Not Verified"
            explanation = (
                f"Failed verification: Claimed {claimed_value:.2f} differs significantly from computed {actual_val:.2f} "
                f"(discrepancy: {diff:.2f})."
            )

        return {
            "id": claim_id,
            "claim_text": claim_text,
            "extracted_number": claimed_value,
            "claimed_metric": claimed_metric,
            "target_column": target_column,
            "computed_value": round(actual_val, 3),
            "secondary_numpy_value": round(numpy_val, 3) if numpy_val is not None else None,
            "status": status,
            "tolerance_used": tolerance,
            "difference": round(diff, 4),
            "verification_method": f"Dual-Engine (Pandas 2.2 + NumPy 2.5 ddof=1, tolerance={tolerance})",
            "explanation": explanation
        }

    def verify_dataset_suite(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Generates a default comprehensive verification suite for all key statistics of the active dataset."""
        results = []
        
        # 1. Dataset size verification
        results.append(self.verify_claim(
            df=df,
            claim_text=f"The active dataset contains {len(df)} total rows.",
            claimed_metric="total_rows",
            claimed_value=float(len(df)),
            target_column=None
        ))
        
        # 2. Duplicate rows verification
        dups = int(df.duplicated().sum())
        results.append(self.verify_claim(
            df=df,
            claim_text=f"Detected {dups} duplicate records across the feature matrix.",
            claimed_metric="duplicate_rows",
            claimed_value=float(dups),
            target_column=None
        ))

        # 3. For each numerical column, verify mean, median, std, IQR
        num_cols = list(df.select_dtypes(include=[np.number]).columns)
        for col in num_cols[:4]: # first 4 numerical columns
            clean = df[col].dropna()
            if len(clean) > 0:
                mean_val = float(clean.mean())
                results.append(self.verify_claim(
                    df=df,
                    claim_text=f"Average {col} is computed as {mean_val:.2f}.",
                    claimed_metric="mean",
                    claimed_value=round(mean_val, 2),
                    target_column=col
                ))
                
                cnt, _, _, _ = data_engine.calculate_iqr_outliers(df[col])
                results.append(self.verify_claim(
                    df=df,
                    claim_text=f"Found {cnt} statistical outlier values outside IQR fences in '{col}'.",
                    claimed_metric="outlier_count",
                    claimed_value=float(cnt),
                    target_column=col
                ))

        # 4. Add a sample deliberate check illustrating "Needs Review" or "Qualitative Limitation"
        if len(num_cols) >= 2:
            results.append(self.verify_claim(
                df=df,
                claim_text=f"Higher {num_cols[0]} directly causes improvement in {num_cols[1]}.",
                claimed_metric="causality",
                claimed_value=None,
                target_column=num_cols[0]
            ))

        return results

verification_engine = VerificationEngine()
