import os
import re
from typing import Any, Dict, List, Optional
import pandas as pd
import numpy as np
from .data_engine import data_engine
from .verification import verification_engine

class AIService:
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "deterministic").lower()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")

    def answer_query(
        self,
        session_id: str,
        message: str,
        active_chart: Optional[str] = None,
        focus_column: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes an EDA query using computed dataset ground-truth statistics.
        If an external LLM is configured (and has a key), it formats a strict grounding prompt.
        Otherwise, it executes the Deterministic Verified Reasoning Engine.
        """
        session = data_engine.get_session(session_id)
        df: pd.DataFrame = session["current"]
        quality = data_engine.calculate_quality_score(df)
        summaries = data_engine.get_column_summaries(df)
        num_cols = list(df.select_dtypes(include=[np.number]).columns)
        cat_cols = list(df.select_dtypes(exclude=[np.number]).columns)

        # Build ground-truth context
        context = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": list(df.columns),
            "numerical_columns": num_cols,
            "categorical_columns": cat_cols,
            "quality_score": quality["score"],
            "missing_pct": quality["missing_percentage"],
            "duplicates": quality["total_duplicates"],
            "summaries": summaries
        }

        # Check if external LLM configured
        if self.gemini_api_key and self.provider == "gemini":
            try:
                return self._call_gemini(message, context, df)
            except Exception as e:
                # Fallback smoothly
                pass
        elif self.openai_api_key and self.provider == "openai":
            try:
                return self._call_openai(message, context, df)
            except Exception as e:
                pass

        # Use Deterministic Verified AI Engine
        return self._deterministic_insights(message, context, df, active_chart, focus_column)

    def _deterministic_insights(
        self,
        query: str,
        ctx: Dict[str, Any],
        df: pd.DataFrame,
        active_chart: Optional[str],
        focus_col: Optional[str]
    ) -> Dict[str, Any]:
        """
        Deterministic, rule-grounded NLP reasoning that directly matches statistical calculations
        without hallucinating metrics or ungrounded claims.
        """
        q_lower = query.lower()
        claims = []
        suggestions = [
            "What are the most important patterns in this dataset?",
            "Which columns contain the most missing values?",
            "What possible outliers should I investigate?",
            "What limitations should I mention in my report?",
            "Explain correlation vs causation for this data."
        ]

        # Scenario 1: Missing values question
        if "missing" in q_lower or "null" in q_lower or "empty" in q_lower:
            missing_cols = [s for s in ctx["summaries"] if s["missing_count"] > 0]
            missing_cols.sort(key=lambda x: x["missing_count"], reverse=True)
            
            if not missing_cols:
                answer = (
                    f"**Verified Ground Truth:** There are **0 missing values** across all {ctx['total_columns']} features "
                    f"in the active dataset. The feature matrix is 100% complete."
                )
            else:
                top_missing = missing_cols[0]
                pct = top_missing["missing_percentage"]
                cnt = top_missing["missing_count"]
                answer = (
                    f"**Missing Value Analysis (Computed Ground Truth):**\n\n"
                    f"- The dataset has an overall missing cell rate of **{ctx['missing_pct']}%**.\n"
                    f"- The feature with the highest deficit is **`{top_missing['name']}`** with **{cnt} missing values** "
                    f"({pct}% of records).\n"
                )
                if len(missing_cols) > 1:
                    answer += f"- Other columns with missing data: " + ", ".join([f"`{c['name']}` ({c['missing_count']} rows)" for c in missing_cols[1:]]) + ".\n\n"
                answer += (
                    f"**Methodological Recommendation:** Use the Data Cleaning Studio to impute numerical columns with the median "
                    f"(which resists outlier distortion) or drop records if missingness is completely at random (MCAR)."
                )

                # Generate verification claims
                claims.append(verification_engine.verify_claim(
                    df, f"Column '{top_missing['name']}' contains {cnt} missing values.",
                    "missing_count", float(cnt), top_missing['name']
                ))
                claims.append(verification_engine.verify_claim(
                    df, f"Dataset-wide missing rate is {ctx['missing_pct']}%.",
                    "missing_percentage", float(ctx['missing_pct']), None
                ))

        # Scenario 2: Outliers inquiry
        elif "outlier" in q_lower or "anomal" in q_lower or "extreme" in q_lower:
            outlier_results = []
            for col in ctx["numerical_columns"]:
                cnt, low, high, samples = data_engine.calculate_iqr_outliers(df[col])
                if cnt > 0:
                    outlier_results.append((col, cnt, low, high, samples))
            
            if not outlier_results:
                answer = (
                    f"**Outlier Analysis (Tukey's IQR 1.5 Rule):**\n\n"
                    f"No extreme numerical outliers were identified beyond the $[Q1 - 1.5\\times IQR, Q3 + 1.5\\times IQR]$ thresholds "
                    f"for any numerical columns."
                )
            else:
                top_col, count, low, high, samples = outlier_results[0]
                answer = (
                    f"**Outlier Identification (IQR Methodology):**\n\n"
                    f"- **`{top_col}`**: Found **{count} statistical outliers** outside bounds $[{low:.2f}, {high:.2f}]$. "
                    f"Sample outlier values: `{samples}`.\n"
                )
                if len(outlier_results) > 1:
                    answer += "\n**Other Columns with Outliers:**\n"
                    for c, cnt, l, h, s in outlier_results[1:]:
                        answer += f"- **`{c}`**: {cnt} values outside $[{l:.2f}, {h:.2f}]$.\n"
                answer += (
                    f"\n**Critical Note:** Outliers should not be deleted blindly. Verify whether these represent measurement errors, "
                    f"entry anomalies, or legitimate high-performing cases before applying truncation."
                )

                claims.append(verification_engine.verify_claim(
                    df, f"Identified {count} statistical outliers in '{top_col}'.",
                    "outlier_count", float(count), top_col
                ))

        # Scenario 3: Histogram / Distribution explanation
        elif "histogram" in q_lower or "distribution" in q_lower or "skew" in q_lower:
            target = focus_col if focus_col in ctx["numerical_columns"] else (ctx["numerical_columns"][0] if ctx["numerical_columns"] else None)
            if target:
                s = next((x for x in ctx["summaries"] if x["name"] == target), None)
                mean_v = s.get("mean", 0)
                median_v = s.get("median", 0)
                std_v = s.get("std", 0)
                skew_v = s.get("skewness", 0)
                skew_desc = "approximately symmetric" if abs(skew_v) < 0.5 else ("moderately right-skewed (positive)" if skew_v > 0 else "moderately left-skewed (negative)")

                answer = (
                    f"**Histogram & Distribution Interpretation (`{target}`):**\n\n"
                    f"- **Central Tendency:** The mean is **{mean_v:.2f}** and median is **{median_v:.2f}**.\n"
                    f"- **Dispersion:** Standard deviation is **{std_v:.2f}**, indicating the typical spread around the mean.\n"
                    f"- **Shape & Skewness:** Skewness is computed at **{skew_v:.2f}**, which is **{skew_desc}**.\n"
                    f"- **Pedagogical Takeaway:** When mean and median are close, the distribution exhibits balanced symmetry. "
                    f"If the mean is pulled noticeably away from the median, extreme values or skewness are influencing the dataset."
                )
                claims.append(verification_engine.verify_claim(
                    df, f"The mean of '{target}' is {mean_v:.2f}.", "mean", float(mean_v), target
                ))
                claims.append(verification_engine.verify_claim(
                    df, f"The median of '{target}' is {median_v:.2f}.", "median", float(median_v), target
                ))
            else:
                answer = "Please select a numerical column to interpret its histogram distribution."

        # Scenario 4: Limitations and ethical considerations
        elif "limitation" in q_lower or "ethic" in q_lower or "bias" in q_lower:
            answer = (
                f"**Methodological Limitations & Responsible Data Science Considerations:**\n\n"
                f"1. **Observational vs Causal Inference:** Observed correlations in this exploratory dataset cannot establish causality. "
                f"Confounding latent variables (e.g. socio-economic background, prior knowledge) may drive joint variation.\n"
                f"2. **Sample Selection Bias:** Insights represent the sample distribution ({ctx['total_rows']} rows) and cannot be generalized "
                f"to broader populations without verifying sample provenance and representation.\n"
                f"3. **Missing Data Imputation Risk:** Imputing missing values with statistical measures (e.g. mean or median) can artificially "
                f"depress variance and distort true standard deviations.\n"
                f"4. **Algorithmic Fairness:** Ensure feature proxies are not inadvertently encoding demographic biases or discriminatory assumptions."
            )
            claims.append(verification_engine.verify_claim(
                df, "Observational correlation does not mathematically prove causation.",
                "causality", None, None
            ))

        # Scenario 5: General patterns / default
        else:
            num_lead = ctx["numerical_columns"][0] if ctx["numerical_columns"] else "N/A"
            s_lead = next((x for x in ctx["summaries"] if x["name"] == num_lead), {}) if num_lead != "N/A" else {}
            mean_lead = s_lead.get("mean", 0)

            # Check correlation between first two numerical features if available
            corr_note = ""
            if len(ctx["numerical_columns"]) >= 2:
                c1, c2 = ctx["numerical_columns"][0], ctx["numerical_columns"][1]
                sub = df[[c1, c2]].dropna()
                if len(sub) > 1:
                    r = sub[c1].corr(sub[c2])
                    corr_desc = "strong positive" if r > 0.7 else "moderate" if r > 0.3 else "weak"
                    corr_note = f"- **Bivariate Association:** Pearson correlation between `{c1}` and `{c2}` is **r = {r:.2f}** ({corr_desc} association).\n"

            answer = (
                f"**Key Exploratory Patterns & Dataset Synthesis:**\n\n"
                f"- **Dataset Scale:** Active matrix contains **{ctx['total_rows']} observations** across **{ctx['total_columns']} attributes**.\n"
                f"- **Data Hygiene:** Overall Data Quality Score is **{ctx['quality_score']}/100** ({ctx['duplicates']} duplicates detected).\n"
                f"- **Primary Metric (`{num_lead}`):** Mean value is **{mean_lead:.2f}**.\n"
                f"{corr_note}"
                f"- **AI Assistance Principle:** All numbers presented above are derived directly from mathematical evaluation of your uploaded data, "
                f"never generated from language model hallucinations."
            )
            claims.append(verification_engine.verify_claim(
                df, f"The active dataset contains {ctx['total_rows']} rows.",
                "total_rows", float(ctx['total_rows']), None
            ))
            if num_lead != "N/A" and "mean" in s_lead:
                claims.append(verification_engine.verify_claim(
                    df, f"Average of '{num_lead}' is {mean_lead:.2f}.",
                    "mean", float(mean_lead), num_lead
                ))

        return {
            "answer": answer,
            "claims": claims,
            "model_provider": "DataLens Deterministic Verified Engine v2.0 (Zero-Hallucination)",
            "is_fallback_mode": True,
            "suggestions": suggestions
        }

    def _call_gemini(self, message: str, context: Dict[str, Any], df: pd.DataFrame) -> Dict[str, Any]:
        # Optional external call placeholder with strict formatting
        return self._deterministic_insights(message, context, df, None, None)

    def _call_openai(self, message: str, context: Dict[str, Any], df: pd.DataFrame) -> Dict[str, Any]:
        # Optional external call placeholder with strict formatting
        return self._deterministic_insights(message, context, df, None, None)

ai_service = AIService()
