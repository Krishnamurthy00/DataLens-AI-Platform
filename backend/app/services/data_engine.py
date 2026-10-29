import io
import math
import uuid
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

class DataEngine:
    def __init__(self):
        # Session storage: session_id -> { "current": pd.DataFrame, "raw": pd.DataFrame, "history": List[pd.DataFrame], "filename": str, "audit_log": List[dict] }
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def create_session_from_csv(self, csv_content: str, filename: str = "dataset.csv") -> str:
        session_id = str(uuid.uuid4())
        # Parse CSV
        df = pd.read_csv(io.StringIO(csv_content))
        # Store in session
        self.sessions[session_id] = {
            "current": df.copy(),
            "raw": df.copy(),
            "history": [], # for undo
            "redo_history": [],
            "filename": filename,
            "audit_log": [{
                "step": 1,
                "action": "load_dataset",
                "description": f"Loaded dataset '{filename}' with {len(df)} rows and {len(df.columns)} columns."
            }]
        }
        return session_id

    def load_demo_dataset(self, file_path: str) -> str:
        session_id = "demo-session"
        df = pd.read_csv(file_path)
        self.sessions[session_id] = {
            "current": df.copy(),
            "raw": df.copy(),
            "history": [],
            "redo_history": [],
            "filename": "student_exam_performance_synthetic.csv",
            "audit_log": [{
                "step": 1,
                "action": "load_demo_dataset",
                "description": "Loaded benchmark synthetic student exam performance dataset (100+ records)."
            }]
        }
        return session_id

    def get_session(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self.sessions:
            raise KeyError(f"Session '{session_id}' not found.")
        return self.sessions[session_id]

    def infer_column_type(self, series: pd.Series) -> str:
        """Infers logical data type for exploratory analysis."""
        clean_series = series.dropna()
        if len(clean_series) == 0:
            return "empty"
        
        dtype_str = str(series.dtype).lower()
        if "int" in dtype_str or "float" in dtype_str:
            # Check if boolean disguised as 0/1
            unique_vals = set(clean_series.unique())
            if unique_vals.issubset({0, 1, 0.0, 1.0}) and len(unique_vals) <= 2:
                return "boolean"
            # Check if integer-like ID or low cardinality
            if "int" in dtype_str and series.nunique() <= 5 and len(series) > 20:
                return "discrete_numerical"
            return "numerical"
        elif "bool" in dtype_str:
            return "boolean"
        elif "datetime" in dtype_str:
            return "datetime"
        else:
            # Check if string can be parsed as datetime
            sample = clean_series.head(10).astype(str)
            try:
                # Avoid converting plain numbers or short strings
                if sample.str.contains(r"[-/:]").all():
                    pd.to_datetime(sample, errors="raise")
                    return "datetime"
            except Exception:
                pass
            
            # Check cardinality
            if clean_series.nunique() <= 20:
                return "categorical"
            return "text"

    def calculate_iqr_outliers(self, series: pd.Series, multiplier: float = 1.5) -> Tuple[int, Optional[float], Optional[float], List[float]]:
        """Calculates outliers using Tukey's fences (IQR rule)."""
        clean = series.dropna()
        if len(clean) < 4:
            return 0, None, None, []
        q1 = float(np.percentile(clean, 25))
        q3 = float(np.percentile(clean, 75))
        iqr = q3 - q1
        lower_bound = q1 - (multiplier * iqr)
        upper_bound = q3 + (multiplier * iqr)
        outliers = clean[(clean < lower_bound) | (clean > upper_bound)].tolist()
        return len(outliers), lower_bound, upper_bound, [float(x) for x in outliers[:20]]

    def calculate_quality_score(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Documented Data Quality Score Calculation (0 - 100):
        1. Completeness (30%): (1 - missing_cells / total_cells) * 30
        2. Uniqueness (20%): (1 - duplicate_rows / total_rows) * 20
        3. Validity & Uniformity (20%): columns without conflicting mixed types
        4. Outlier Balance (15%): proportion of non-extreme values
        5. Usability (15%): non-constant, feature-rich columns
        """
        total_rows = len(df)
        total_cols = len(df.columns)
        total_cells = total_rows * total_cols

        if total_cells == 0:
            return {
                "score": 0.0,
                "grade": "F",
                "completeness_score": 0.0,
                "uniqueness_score": 0.0,
                "validity_score": 0.0,
                "consistency_score": 0.0,
                "outlier_score": 0.0,
                "total_duplicates": 0,
                "total_missing_cells": 0,
                "total_cells": 0,
                "missing_percentage": 0.0,
                "duplicate_percentage": 0.0,
                "calculation_breakdown": []
            }

        missing_cells = int(df.isna().sum().sum())
        missing_pct = (missing_cells / total_cells) * 100
        completeness_ratio = max(0.0, 1.0 - (missing_cells / total_cells))
        completeness_pts = completeness_ratio * 30.0

        duplicate_rows = int(df.duplicated().sum())
        dup_pct = (duplicate_rows / total_rows) * 100 if total_rows > 0 else 0.0
        uniqueness_ratio = max(0.0, 1.0 - (duplicate_rows / total_rows)) if total_rows > 0 else 1.0
        uniqueness_pts = uniqueness_ratio * 20.0

        # Validity / Column health
        valid_cols = 0
        constant_cols = 0
        total_outliers = 0
        num_cols = 0

        for col in df.columns:
            series = df[col]
            if series.nunique() <= 1:
                constant_cols += 1
            else:
                valid_cols += 1
            
            if pd.api.types.is_numeric_dtype(series):
                num_cols += 1
                cnt, _, _, _ = self.calculate_iqr_outliers(series)
                total_outliers += cnt

        validity_ratio = (valid_cols / total_cols) if total_cols > 0 else 1.0
        validity_pts = validity_ratio * 20.0

        outlier_ratio = 1.0
        if num_cols > 0 and total_rows > 0:
            outlier_ratio = max(0.0, 1.0 - (total_outliers / (num_cols * total_rows)))
        outlier_pts = outlier_ratio * 15.0

        consistency_pts = 15.0 if constant_cols == 0 else max(0.0, 15.0 - (constant_cols * 5.0))

        raw_score = completeness_pts + uniqueness_pts + validity_pts + outlier_pts + consistency_pts
        final_score = round(min(100.0, max(0.0, raw_score)), 1)

        if final_score >= 90:
            grade = "A"
        elif final_score >= 80:
            grade = "B"
        elif final_score >= 70:
            grade = "C"
        elif final_score >= 60:
            grade = "D"
        else:
            grade = "F"

        breakdown = [
            {
                "metric": "Completeness (30%)",
                "achieved": round(completeness_pts, 1),
                "max": 30.0,
                "formula": "100% - Missing Cells Ratio",
                "details": f"{missing_cells} missing cells ({missing_pct:.1f}%)"
            },
            {
                "metric": "Uniqueness (20%)",
                "achieved": round(uniqueness_pts, 1),
                "max": 20.0,
                "formula": "100% - Duplicate Rows Ratio",
                "details": f"{duplicate_rows} duplicate rows ({dup_pct:.1f}%)"
            },
            {
                "metric": "Validity & Variety (20%)",
                "achieved": round(validity_pts, 1),
                "max": 20.0,
                "formula": "Proportion of non-empty & varied features",
                "details": f"{valid_cols}/{total_cols} columns with varied values"
            },
            {
                "metric": "Outlier Stability (15%)",
                "achieved": round(outlier_pts, 1),
                "max": 15.0,
                "formula": "IQR Bound Evaluation Across Numerical Columns",
                "details": f"{total_outliers} statistical outliers detected"
            },
            {
                "metric": "Feature Usability (15%)",
                "achieved": round(consistency_pts, 1),
                "max": 15.0,
                "formula": "Penalizes constant or zero-variance columns",
                "details": f"{constant_cols} constant columns"
            }
        ]

        return {
            "score": final_score,
            "grade": grade,
            "completeness_score": round(completeness_pts, 1),
            "uniqueness_score": round(uniqueness_pts, 1),
            "validity_score": round(validity_pts, 1),
            "consistency_score": round(consistency_pts, 1),
            "outlier_score": round(outlier_pts, 1),
            "total_duplicates": duplicate_rows,
            "total_missing_cells": missing_cells,
            "total_cells": total_cells,
            "missing_percentage": round(missing_pct, 2),
            "duplicate_percentage": round(dup_pct, 2),
            "calculation_breakdown": breakdown
        }

    def get_column_summaries(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        summaries = []
        total_len = len(df)

        for col in df.columns:
            series = df[col]
            inferred = self.infer_column_type(series)
            missing = int(series.isna().sum())
            missing_pct = round((missing / total_len * 100), 2) if total_len > 0 else 0.0
            unique_cnt = int(series.nunique())

            summary = {
                "name": str(col),
                "dtype": str(series.dtype),
                "inferred_type": inferred,
                "count": int(series.count()),
                "missing_count": missing,
                "missing_percentage": missing_pct,
                "unique_count": unique_cnt
            }

            clean = series.dropna()

            if pd.api.types.is_numeric_dtype(series) and len(clean) > 0:
                vals = clean.to_numpy(dtype=float)
                mean_val = float(np.mean(vals))
                median_val = float(np.median(vals))
                std_val = float(np.std(vals, ddof=1)) if len(vals) > 1 else 0.0
                min_val = float(np.min(vals))
                max_val = float(np.max(vals))
                q1 = float(np.percentile(vals, 25))
                q3 = float(np.percentile(vals, 75))
                iqr = q3 - q1

                outliers_cnt, _, _, _ = self.calculate_iqr_outliers(series)

                skew_val = float(clean.skew()) if len(clean) > 2 else 0.0
                kurt_val = float(clean.kurt()) if len(clean) > 3 else 0.0

                summary.update({
                    "mean": round(mean_val, 3),
                    "median": round(median_val, 3),
                    "std": round(std_val, 3),
                    "min": round(min_val, 3),
                    "max": round(max_val, 3),
                    "q1": round(q1, 3),
                    "q3": round(q3, 3),
                    "iqr": round(iqr, 3),
                    "skewness": round(skew_val, 3) if not math.isnan(skew_val) else 0.0,
                    "kurtosis": round(kurt_val, 3) if not math.isnan(kurt_val) else 0.0,
                    "outliers_count": outliers_cnt
                })
            else:
                # Categorical / string
                mode_val = series.mode().iloc[0] if not series.mode().empty else None
                top_cats = []
                val_counts = series.value_counts().head(8)
                for cat, count in val_counts.items():
                    top_cats.append({
                        "category": str(cat),
                        "count": int(count),
                        "percentage": round((int(count) / total_len * 100), 1) if total_len > 0 else 0.0
                    })
                summary.update({
                    "mode": str(mode_val) if mode_val is not None else None,
                    "top_categories": top_cats
                })

            summaries.append(summary)

        return summaries

    def compute_correlation_matrix(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculates Pearson correlation matrix for numerical features."""
        num_df = df.select_dtypes(include=[np.number])
        cols = list(num_df.columns)
        if len(cols) < 2:
            return {"columns": cols, "matrix": []}

        corr = num_df.corr(method="pearson").round(3)
        matrix = []
        for i, row in corr.iterrows():
            row_vals = []
            for col in cols:
                val = row[col]
                row_vals.append(float(val) if not math.isnan(val) else None)
            matrix.append(row_vals)

        return {
            "columns": cols,
            "matrix": matrix
        }

    def generate_chart_data(self, df: pd.DataFrame, config: Dict[str, Any]) -> Dict[str, Any]:
        chart_type = config.get("chart_type", "histogram")
        x_col = config.get("x_column")
        y_col = config.get("y_column")
        bins_cnt = int(config.get("bins", 10))

        if chart_type == "histogram":
            if not x_col or x_col not in df.columns:
                # Pick first numerical column
                num_cols = df.select_dtypes(include=[np.number]).columns
                x_col = num_cols[0] if len(num_cols) > 0 else df.columns[0]
            
            clean = df[x_col].dropna()
            if len(clean) == 0 or not pd.api.types.is_numeric_dtype(clean):
                return {"chart_type": "histogram", "title": f"Histogram of {x_col}", "x_axis_label": x_col, "y_axis_label": "Frequency", "data": []}
            
            counts, bin_edges = np.histogram(clean, bins=bins_cnt)
            data = []
            for i in range(len(counts)):
                range_label = f"{bin_edges[i]:.1f} - {bin_edges[i+1]:.1f}"
                data.append({
                    "range": range_label,
                    "count": int(counts[i]),
                    "bin_start": round(float(bin_edges[i]), 2),
                    "bin_end": round(float(bin_edges[i+1]), 2)
                })
            
            return {
                "chart_type": "histogram",
                "title": f"Frequency Distribution: {x_col}",
                "x_axis_label": f"{x_col} Range",
                "y_axis_label": "Frequency (Count)",
                "data": data,
                "extra": {
                    "mean": round(float(clean.mean()), 2),
                    "median": round(float(clean.median()), 2),
                    "std": round(float(clean.std()), 2) if len(clean) > 1 else 0.0
                }
            }

        elif chart_type == "bar":
            if not x_col or x_col not in df.columns:
                # Pick first categorical column or non-numerical
                cat_cols = df.select_dtypes(exclude=[np.number]).columns
                x_col = cat_cols[0] if len(cat_cols) > 0 else df.columns[0]
            
            top_n = int(config.get("top_n", 10))
            vc = df[x_col].fillna("Missing/Null").value_counts().head(top_n)
            data = [{"category": str(k), "count": int(v), "percentage": round(v / len(df) * 100, 1)} for k, v in vc.items()]

            return {
                "chart_type": "bar",
                "title": f"Categorical Frequency: {x_col}",
                "x_axis_label": str(x_col),
                "y_axis_label": "Count",
                "data": data
            }

        elif chart_type == "box":
            if not x_col or x_col not in df.columns:
                num_cols = df.select_dtypes(include=[np.number]).columns
                x_col = num_cols[0] if len(num_cols) > 0 else df.columns[0]
            
            clean = df[x_col].dropna()
            if len(clean) == 0 or not pd.api.types.is_numeric_dtype(clean):
                return {"chart_type": "box", "title": f"Box Plot of {x_col}", "x_axis_label": x_col, "y_axis_label": "Values", "data": []}

            vals = clean.to_numpy(dtype=float)
            q1 = float(np.percentile(vals, 25))
            median = float(np.median(vals))
            q3 = float(np.percentile(vals, 75))
            iqr = q3 - q1
            min_whisker = float(max(np.min(vals), q1 - 1.5 * iqr))
            max_whisker = float(min(np.max(vals), q3 + 1.5 * iqr))
            outliers = [float(x) for x in vals if x < min_whisker or x > max_whisker]

            data = [{
                "feature": str(x_col),
                "min": round(min_whisker, 2),
                "q1": round(q1, 2),
                "median": round(median, 2),
                "q3": round(q3, 2),
                "max": round(max_whisker, 2),
                "iqr": round(iqr, 2),
                "outliers_count": len(outliers),
                "outlier_samples": outliers[:10]
            }]

            return {
                "chart_type": "box",
                "title": f"Five-Number Summary & Outliers: {x_col}",
                "x_axis_label": str(x_col),
                "y_axis_label": "Value Distribution",
                "data": data,
                "extra": {"iqr": round(iqr, 2), "outliers": outliers}
            }

        elif chart_type == "scatter":
            num_cols = list(df.select_dtypes(include=[np.number]).columns)
            if not x_col or x_col not in num_cols:
                x_col = num_cols[0] if len(num_cols) > 0 else df.columns[0]
            if not y_col or y_col not in num_cols:
                y_col = num_cols[1] if len(num_cols) > 1 else x_col
            
            sub = df[[x_col, y_col]].dropna()
            # Downsample if too large for clean interactive render
            if len(sub) > 500:
                sub = sub.sample(500, random_state=42)
            
            data = []
            for _, r in sub.iterrows():
                data.append({
                    "x": round(float(r[x_col]), 2),
                    "y": round(float(r[y_col]), 2)
                })

            # Calculate Pearson correlation coefficient
            corr_val = None
            if len(sub) > 1 and x_col != y_col:
                corr_val = round(float(sub[x_col].corr(sub[y_col])), 3)

            return {
                "chart_type": "scatter",
                "title": f"Bivariate Relationship: {x_col} vs {y_col}",
                "x_axis_label": str(x_col),
                "y_axis_label": str(y_col),
                "data": data,
                "extra": {
                    "correlation": corr_val,
                    "interpretation": "Strong Positive" if corr_val and corr_val > 0.7 else "Moderate Positive" if corr_val and corr_val > 0.3 else "Weak / Negligible" if corr_val and abs(corr_val) <= 0.3 else "Negative"
                }
            }

        elif chart_type == "correlation":
            corr_dict = self.compute_correlation_matrix(df)
            cols = corr_dict["columns"]
            matrix = corr_dict["matrix"]

            data = []
            for i, r_col in enumerate(cols):
                for j, c_col in enumerate(cols):
                    data.append({
                        "x": c_col,
                        "y": r_col,
                        "value": matrix[i][j] if i < len(matrix) and j < len(matrix[i]) else 0.0
                    })

            return {
                "chart_type": "correlation",
                "title": "Pearson Feature Correlation Heatmap",
                "x_axis_label": "Features",
                "y_axis_label": "Features",
                "data": data,
                "extra": {"columns": cols}
            }

        return {"chart_type": "unknown", "title": "Chart", "x_axis_label": "", "y_axis_label": "", "data": []}

data_engine = DataEngine()
