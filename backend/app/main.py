import os
import io
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse

from .models.schemas import (
    CleaningActionRequest,
    CleaningActionResult,
    ChartConfigRequest,
    ChartDataResponse,
    AIChatRequest,
    AIChatResponse,
    ReportGenerationRequest,
    VerificationClaim
)
from .services.data_engine import data_engine
from .services.cleaning_engine import cleaning_engine
from .services.verification import verification_engine
from .services.ai_service import ai_service
from .services.report_service import report_service

app = FastAPI(
    title="DataLens AI Backend",
    description="Intelligent Exploratory Data Analysis & Verification Platform API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_DATA_PATH = Path(__file__).parent / "sample_data" / "student_exam_performance_synthetic.csv"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DataLens AI Engine",
        "version": "1.0.0",
        "active_sessions": len(data_engine.sessions),
        "ai_provider": ai_service.provider
    }

@app.post("/api/dataset/demo")
def load_demo():
    if not SAMPLE_DATA_PATH.exists():
        raise HTTPException(status_code=404, detail="Sample dataset not found.")
    
    session_id = data_engine.load_demo_dataset(str(SAMPLE_DATA_PATH))
    session = data_engine.get_session(session_id)
    df = session["current"]
    
    quality = data_engine.calculate_quality_score(df)
    summaries = data_engine.get_column_summaries(df)
    
    return {
        "session_id": session_id,
        "filename": session["filename"],
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "file_size_bytes": os.path.getsize(str(SAMPLE_DATA_PATH)),
        "quality": quality,
        "columns": summaries,
        "sample_preview": df.head(15).replace({float('nan'): None}).to_dict(orient="records"),
        "audit_logs": session["audit_log"]
    }

@app.post("/api/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV files are supported.")
    
    content = await file.read()
    try:
        csv_str = content.decode("utf-8")
    except UnicodeDecodeError:
        try:
            csv_str = content.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=400, detail="Could not decode CSV file. Please ensure valid UTF-8 encoding.")
    
    try:
        session_id = data_engine.create_session_from_csv(csv_str, filename=file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    session = data_engine.get_session(session_id)
    df = session["current"]
    quality = data_engine.calculate_quality_score(df)
    summaries = data_engine.get_column_summaries(df)

    return {
        "session_id": session_id,
        "filename": session["filename"],
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "file_size_bytes": len(content),
        "quality": quality,
        "columns": summaries,
        "sample_preview": df.head(15).replace({float('nan'): None}).to_dict(orient="records"),
        "audit_logs": session["audit_log"]
    }

@app.get("/api/dataset/{session_id}/overview")
def get_dataset_overview(session_id: str):
    try:
        session = data_engine.get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset session not found.")
    
    df = session["current"]
    quality = data_engine.calculate_quality_score(df)
    summaries = data_engine.get_column_summaries(df)

    return {
        "session_id": session_id,
        "filename": session["filename"],
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "quality": quality,
        "columns": summaries,
        "sample_preview": df.head(20).replace({float('nan'): None}).to_dict(orient="records"),
        "audit_logs": session["audit_log"]
    }

@app.get("/api/dataset/{session_id}/table")
def get_dataset_table(
    session_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    search: Optional[str] = None
):
    try:
        session = data_engine.get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    df = session["current"]
    filtered_df = df
    if search:
        mask = filtered_df.astype(str).apply(lambda row: row.str.contains(search, case=False, na=False).any(), axis=1)
        filtered_df = filtered_df[mask]

    total_records = len(filtered_df)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size

    page_data = filtered_df.iloc[start_idx:end_idx].replace({float('nan'): None}).to_dict(orient="records")

    return {
        "page": page,
        "page_size": page_size,
        "total_records": total_records,
        "total_pages": max(1, (total_records + page_size - 1) // page_size),
        "columns": list(df.columns),
        "data": page_data
    }

@app.post("/api/cleaning/preview")
def preview_cleaning(session_id: str, req: CleaningActionRequest):
    try:
        preview = cleaning_engine.preview_action(
            session_id=session_id,
            action=req.action,
            column=req.column,
            method=req.method,
            custom_value=req.custom_value,
            target_type=req.target_type
        )
        return preview
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/cleaning/apply")
def apply_cleaning(session_id: str, req: CleaningActionRequest):
    try:
        res = cleaning_engine.apply_action(
            session_id=session_id,
            action=req.action,
            column=req.column,
            method=req.method,
            custom_value=req.custom_value,
            target_type=req.target_type
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/cleaning/{session_id}/undo")
def undo_cleaning(session_id: str):
    res = cleaning_engine.undo(session_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
    return res

@app.post("/api/cleaning/{session_id}/reset")
def reset_cleaning(session_id: str):
    return cleaning_engine.reset(session_id)

@app.post("/api/charts/data")
def get_chart_data(session_id: str, req: ChartConfigRequest):
    try:
        session = data_engine.get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    df = session["current"]
    config = req.model_dump()
    chart_res = data_engine.generate_chart_data(df, config)
    return chart_res

@app.post("/api/ai/chat")
def chat_ai(session_id: str, req: AIChatRequest):
    try:
        return ai_service.answer_query(
            session_id=session_id,
            message=req.message,
            active_chart=req.active_chart,
            focus_column=req.focus_column
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/verification/{session_id}/suite")
def get_verification_suite(session_id: str):
    try:
        session = data_engine.get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    df = session["current"]
    return {
        "session_id": session_id,
        "claims": verification_engine.verify_dataset_suite(df)
    }

@app.post("/api/verification/{session_id}/verify-claim")
def verify_single_claim(
    session_id: str,
    claim_text: str,
    claimed_metric: str,
    claimed_value: Optional[float] = None,
    target_column: Optional[str] = None,
    tolerance: float = 0.05
):
    try:
        session = data_engine.get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    df = session["current"]
    return verification_engine.verify_claim(
        df=df,
        claim_text=claim_text,
        claimed_metric=claimed_metric,
        claimed_value=claimed_value,
        target_column=target_column,
        tolerance=tolerance
    )

@app.post("/api/report/{session_id}/html")
def get_report_html(session_id: str, req: ReportGenerationRequest):
    try:
        html = report_service.generate_html_preview(
            session_id=session_id,
            project_title=req.project_title,
            analyst_name=req.analyst_name,
            dataset_source=req.dataset_source,
            license_type=req.license_type,
            custom_notes=req.custom_notes
        )
        return HTMLResponse(content=html)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/report/{session_id}/pdf")
def download_report_pdf(session_id: str, req: ReportGenerationRequest):
    try:
        pdf_bytes = report_service.generate_pdf(
            session_id=session_id,
            project_title=req.project_title,
            analyst_name=req.analyst_name,
            dataset_source=req.dataset_source,
            license_type=req.license_type,
            custom_notes=req.custom_notes
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=DataLens_Report_{session_id[:8]}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/report/{session_id}/csv")
def download_cleaned_csv(session_id: str):
    try:
        session = data_engine.get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    df = session["current"]
    csv_str = report_service.export_csv(df)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=cleaned_{session.get('filename', 'dataset.csv')}"}
    )
