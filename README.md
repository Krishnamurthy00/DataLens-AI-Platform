# DataLens AI — Intelligent Exploratory Data Analysis & Verification Platform

> **CSE Final Year Capstone Project**  
> *Turn Raw Data Into Verified Insights.*

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com)
[![NumPy](https://img.shields.io/badge/NumPy-2.5-013243.svg)](https://numpy.org)
[![Pandas](https://img.shields.io/badge/Pandas-3.1-150458.svg)](https://pandas.pydata.org)
[![ReportLab](https://img.shields.io/badge/ReportLab-PDF-red.svg)](https://www.reportlab.com)

---

## 1. Project Overview & Motivation

In exploratory data analysis (EDA), students and researchers increasingly turn to Generative AI to summarize statistics, diagnose data defects, and discover patterns. However, traditional Large Language Models (LLMs) operate as probabilistic token predictors that frequently **hallucinate** plausible-sounding yet mathematically erroneous statistics, invent citations, and confuse correlation with causation.

**DataLens AI** bridges this critical gap. It is an end-to-end, full-stack educational and research analytics platform designed for Computer Science & Engineering (CSE) and Data Science scholars.

### Key Architectural Tenet: Zero Hallucination
All metrics—from means and medians to Tukey's IQR outlier fences and Pearson correlation matrices—are computed server-side directly on the dataset using **Pandas 3.1** and **NumPy 2.5**. The **Verification Center** independently re-executes mathematical claims across parallel algorithms to flag discrepancies and enforce epistemic transparency.

---

## 2. Core Features & Main Pages

| Page / Module | Key Capabilities |
| :--- | :--- |
| **A. Landing Page** | Hero presentation (`Turn Raw Data Into Verified Insights`), systematic 6-step workflow, technology stack overview, and ethical data pledge. |
| **B. Executive Dashboard** | Real-time observation/attribute metrics, missing cell percentage, duplicate record count, documented **Data Quality Score (Grade A–F)**, and recent audit logs. |
| **C. Upload & Preview** | Drag-and-drop CSV upload, schema inference, feature selector cloud, and searchable/paginated data table preview. |
| **D. Data Cleaning Studio** | Automated defect diagnosis, duplicate row removal, missing value imputation (mean, median, mode, constant), type casting, Tukey IQR outlier removal, non-destructive undo/reset, and audit logging. |
| **E. EDA Analytics Page** | Complete descriptive statistics table and **5 interactive charts**: Histogram, Categorical Bar Chart, Tukey Box Plot with outlier markers, Bivariate Scatter Plot, and Pearson Correlation Heatmap. |
| **F. AI Insights Assistant** | Grounded question-answering assistant that strictly translates computed mathematical facts into plain language, with claim tags and direct links to verification. |
| **G. Verification Center** | Capstone centerpiece: Evaluates AI claims against ground-truth pandas/numpy matrices, tests degrees-of-freedom and rounding tolerances, and classifies subjective causal statements as *Needs Review*. Includes a live claim recomputor tool for faculty demonstrations. |
| **H. Report Generator** | Disseminates official multi-page PDF reports (via ReportLab), streaming cleaned CSV datasets, and interactive printable HTML previews. |
| **I. Dataset Catalog** | Curated catalog of trustworthy open-data portals (data.gov.in, Data.gov, Kaggle, UCI) with documented provenance, licenses, and ethical limitations. |
| **J. Academic Capstone Defense** | Problem statement, objectives, mathematical methodology, tools, and a step-by-step 5-minute live demonstration script for academic evaluations. |
| **K. Settings & Documentation** | Dark/light theme toggle, Tukey IQR multiplier controls, verification tolerance settings, privacy notices, and local execution guides. |

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Vanilla Tailwind CSS with custom HSL/RGB design tokens
- **Data Visualizations:** Recharts (responsive vector charts)
- **Icons:** Lucide React
- **Design Tokens:** Dark navy sidebar (`#0f172a`), clean card surfaces, and cyan/teal/indigo accents

### Backend
- **Server:** Python 3.13 + FastAPI + Uvicorn
- **Mathematical Runtimes:** NumPy 2.5 + Pandas 3.1
- **Report Generation:** ReportLab 5.1 (vector-quality PDF compilation)
- **Data Validation:** Pydantic 2.13
- **Environment Management:** python-dotenv

---

## 4. Benchmark Synthetic Dataset

The system includes a pre-packaged benchmark dataset:  
📁 `backend/app/sample_data/student_exam_performance_synthetic.csv`

- **Scale:** 100+ records across 9 realistic attributes (`Hours_Studied`, `Attendance_Rate`, `Sleep_Hours`, `Practice_Tests_Taken`, `Parental_Education`, `Study_Technique`, `School_Type`, `Exam_Score`).
- **Defects Injected for Demonstration:**
  - Intentional duplicate student records (`STU_1012`, `STU_1025`)
  - Missing values in numerical and categorical columns
  - Extreme outlier (`STU_1034`, `Hours_Studied = 98.0`) to trigger Tukey IQR outlier warnings
- **Ethical Integrity:** 100% synthetic data generated without PII to adhere to academic ethics.

---

## 5. Local Installation & Execution Guide

### Prerequisites
- Python 3.11+ (installed and accessible as `py` or `python`)
- Node.js 18+ and `npm`

### Step 1: Clone and Set Up Environment
```bash
git clone https://github.com/your-username/DataLens-AI.git
cd DataLens
cp .env.example .env
```

### Step 2: Install Backend Dependencies & Start FastAPI
```bash
# Install Python packages
py -m pip install -r backend/requirements.txt

# Launch FastAPI Server (Port 8000)
py backend/run_backend.py
```
> Backend API will be active at: `http://127.0.0.1:8000`  
> Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### Step 3: Install Frontend Dependencies & Start Vite Server
Open a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
> Open your browser at: `http://localhost:5173/`

### Step 4: Run Automated Backend Test Suite
```bash
py backend/run_tests.py
```
**Test Results:**
```text
==================================================
      DataLens AI - Backend Test Suite           
==================================================
[PASS] Descriptive Statistics Calculation
[PASS] IQR Outlier Detection & Tukey Fences
[PASS] Data Quality Score & Breakdown
[PASS] Duplicate Removal & Undo Stack
[PASS] Missing Value Imputation (Mean/Median)
[PASS] Dual-Engine Numerical Verification
[PASS] Qualitative Epistemic Causality Check
--------------------------------------------------
Results: 7 passed, 0 failed.
==================================================
```

---

## 6. Live Capstone Defense Walkthrough Script

During an academic evaluation or capstone defense, present DataLens AI in this structured 5-minute sequence:

1. **Home Overview:** Highlight the problem of LLM statistical hallucinations in academic research.
2. **Benchmark Ingestion:** Click **"Explore Demo Dataset"**. Point out the computed `102 rows × 9 columns` and the Data Quality Score (Grade & 5-pillar breakdown).
3. **Data Cleaning Studio:** Show the detected duplicate rows and missing cells. Click **"Preview Transformation"** to view affected rows and quality improvements before applying. Demonstrate the **Undo** button restoring state.
4. **Visual Explorations:** Navigate to **EDA Analytics**. Display the **Histogram**, **Tukey Box Plot** (identifying the outlier at 98 hours), **Scatter Plot** ($r = 0.94$), and **Correlation Heatmap**.
5. **AI & Dual-Engine Verification:** Query the AI assistant. Click **"Audit in Verification Center"** to demonstrate parallel NumPy recomputation and tolerance matching.
6. **Report Generation:** Click **"Render Interactive HTML Preview"** and download the publication-grade multi-page **PDF report**.

---

## 7. Responsible AI & Data Ethics Pledge

- **Epistemic Humility:** All generated insights state limitations and explicitly declare that correlation does not establish causation.
- **Privacy Assurance:** Datasets remain in ephemeral memory during session analysis and are never written to permanent external databases or third-party training pipelines.
- **Verification Guarantee:** Qualitative interpretations are separated from mathematical calculations.

---

## 8. License

This project is developed as an open educational and capstone research project under the **MIT License**.
