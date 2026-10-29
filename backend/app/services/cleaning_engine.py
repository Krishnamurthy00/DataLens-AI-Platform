import copy
from typing import Any, Dict, List, Optional, Tuple, Union
import pandas as pd
import numpy as np
from .data_engine import data_engine

class CleaningEngine:
    def preview_action(
        self,
        session_id: str,
        action: str,
        column: Optional[str] = None,
        method: Optional[str] = None,
        custom_value: Optional[Union[str, float, int]] = None,
        target_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Runs transformation on a temporary copy and returns preview metrics."""
        session = data_engine.get_session(session_id)
        df_copy = session["current"].copy()
        q_before = data_engine.calculate_quality_score(df_copy)["score"]
        
        df_result, desc, rows_aff, cols_aff = self._execute_transformation(
            df_copy, action, column, method, custom_value, target_type
        )
        
        q_after = data_engine.calculate_quality_score(df_result)["score"]

        return {
            "success": True,
            "action": action,
            "description": desc,
            "rows_affected": rows_aff,
            "columns_affected": cols_aff,
            "remaining_rows": len(df_result),
            "remaining_columns": len(df_result.columns),
            "quality_before": q_before,
            "quality_after": q_after,
            "preview_rows": df_result.head(10).replace({np.nan: None}).to_dict(orient="records")
        }

    def apply_action(
        self,
        session_id: str,
        action: str,
        column: Optional[str] = None,
        method: Optional[str] = None,
        custom_value: Optional[Union[str, float, int]] = None,
        target_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Applies transformation, pushes previous state to history stack, and appends to audit log."""
        session = data_engine.get_session(session_id)
        current_df = session["current"]
        q_before = data_engine.calculate_quality_score(current_df)["score"]

        # Push deepcopy to history for Undo functionality
        session["history"].append(current_df.copy())
        # Clear redo history
        session["redo_history"].clear()

        df_result, desc, rows_aff, cols_aff = self._execute_transformation(
            current_df.copy(), action, column, method, custom_value, target_type
        )

        session["current"] = df_result
        q_after = data_engine.calculate_quality_score(df_result)["score"]

        # Add to audit log
        step_num = len(session["audit_log"]) + 1
        log_entry = {
            "step": step_num,
            "action": action,
            "column": column,
            "method": method,
            "description": desc,
            "rows_affected": rows_aff,
            "remaining_rows": len(df_result),
            "quality_score": q_after
        }
        session["audit_log"].append(log_entry)

        return {
            "success": True,
            "action": action,
            "description": desc,
            "rows_affected": rows_aff,
            "columns_affected": cols_aff,
            "remaining_rows": len(df_result),
            "remaining_columns": len(df_result.columns),
            "quality_before": q_before,
            "quality_after": q_after,
            "preview_rows": df_result.head(15).replace({np.nan: None}).to_dict(orient="records")
        }

    def undo(self, session_id: str) -> Dict[str, Any]:
        session = data_engine.get_session(session_id)
        if not session["history"]:
            return {"success": False, "message": "No undo history available."}
        
        # Save current to redo
        session["redo_history"].append(session["current"].copy())
        # Pop previous
        previous_df = session["history"].pop()
        session["current"] = previous_df

        # Remove last audit step if applicable
        if len(session["audit_log"]) > 1:
            session["audit_log"].pop()

        score = data_engine.calculate_quality_score(previous_df)["score"]
        return {
            "success": True,
            "message": "Reverted last transformation.",
            "remaining_rows": len(previous_df),
            "remaining_columns": len(previous_df.columns),
            "quality_score": score
        }

    def reset(self, session_id: str) -> Dict[str, Any]:
        session = data_engine.get_session(session_id)
        session["history"].append(session["current"].copy())
        session["current"] = session["raw"].copy()
        
        session["audit_log"].append({
            "step": len(session["audit_log"]) + 1,
            "action": "reset_to_original",
            "description": "Reset dataset to raw uploaded state."
        })

        score = data_engine.calculate_quality_score(session["current"])["score"]
        return {
            "success": True,
            "message": "Reset dataset to original raw state.",
            "remaining_rows": len(session["current"]),
            "remaining_columns": len(session["current"].columns),
            "quality_score": score
        }

    def _execute_transformation(
        self,
        df: pd.DataFrame,
        action: str,
        column: Optional[str],
        method: Optional[str],
        custom_value: Optional[Union[str, float, int]],
        target_type: Optional[str]
    ) -> Tuple[pd.DataFrame, str, int, int]:
        initial_rows = len(df)
        initial_cols = len(df.columns)

        if action == "remove_duplicates":
            before = len(df)
            df = df.drop_duplicates().reset_index(drop=True)
            removed = before - len(df)
            desc = f"Removed {removed} duplicate rows."
            return df, desc, removed, 0

        elif action == "fill_missing":
            if not column or column not in df.columns:
                raise ValueError(f"Column '{column}' not found.")
            
            series = df[column]
            missing_count = int(series.isna().sum())
            if missing_count == 0:
                return df, f"No missing values in '{column}'.", 0, 0

            fill_val = None
            if method == "mean":
                if not pd.api.types.is_numeric_dtype(series):
                    raise ValueError(f"Mean imputation is only valid for numerical columns.")
                fill_val = round(float(series.mean()), 3)
            elif method == "median":
                if not pd.api.types.is_numeric_dtype(series):
                    raise ValueError(f"Median imputation is only valid for numerical columns.")
                fill_val = round(float(series.median()), 3)
            elif method == "mode":
                modes = series.mode()
                fill_val = modes.iloc[0] if not modes.empty else "Unknown"
            elif method == "constant":
                fill_val = custom_value if custom_value is not None else "Unknown"
            else:
                fill_val = "Unknown"

            df[column] = df[column].fillna(fill_val)
            desc = f"Imputed {missing_count} missing values in '{column}' using {method} (value: {fill_val})."
            return df, desc, missing_count, 1

        elif action == "drop_column":
            if not column or column not in df.columns:
                raise ValueError(f"Column '{column}' not found.")
            df = df.drop(columns=[column])
            desc = f"Dropped column '{column}'."
            return df, desc, 0, 1

        elif action == "drop_missing_rows":
            if column and column in df.columns:
                before = len(df)
                df = df.dropna(subset=[column]).reset_index(drop=True)
                dropped = before - len(df)
                desc = f"Dropped {dropped} rows with missing values in '{column}'."
                return df, desc, dropped, 0
            else:
                before = len(df)
                df = df.dropna().reset_index(drop=True)
                dropped = before - len(df)
                desc = f"Dropped {dropped} rows containing any missing values."
                return df, desc, dropped, 0

        elif action == "convert_type":
            if not column or column not in df.columns:
                raise ValueError(f"Column '{column}' not found.")
            if target_type == "int":
                df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0).astype(int)
            elif target_type == "float":
                df[column] = pd.to_numeric(df[column], errors="coerce").astype(float)
            elif target_type == "str":
                df[column] = df[column].astype(str)
            elif target_type == "datetime":
                df[column] = pd.to_datetime(df[column], errors="coerce")
            else:
                raise ValueError(f"Unsupported target type '{target_type}'.")
            
            desc = f"Converted column '{column}' to type {target_type}."
            return df, desc, len(df), 1

        elif action == "remove_outliers":
            if not column or column not in df.columns:
                raise ValueError(f"Column '{column}' not found.")
            series = df[column]
            if not pd.api.types.is_numeric_dtype(series):
                raise ValueError(f"Outlier removal requires a numerical column.")
            
            clean = series.dropna()
            q1 = float(np.percentile(clean, 25))
            q3 = float(np.percentile(clean, 75))
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            before = len(df)
            df = df[(df[column].isna()) | ((df[column] >= lower) & (df[column] <= upper))].reset_index(drop=True)
            removed = before - len(df)
            desc = f"Removed {removed} statistical outliers from '{column}' using IQR bounds [{lower:.2f}, {upper:.2f}]."
            return df, desc, removed, 0

        else:
            raise ValueError(f"Unknown cleaning action: '{action}'.")

cleaning_engine = CleaningEngine()
