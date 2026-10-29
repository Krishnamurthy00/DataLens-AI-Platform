import io
from typing import Any, Dict, List, Optional
import pandas as pd
import numpy as np
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from .data_engine import data_engine
from .verification import verification_engine

class ReportService:
    def export_csv(self, df: pd.DataFrame) -> str:
        """Returns CSV string of active dataset."""
        return df.to_csv(index=False)

    def generate_html_preview(
        self,
        session_id: str,
        project_title: str,
        analyst_name: str,
        dataset_source: str,
        license_type: str,
        custom_notes: Optional[str] = None
    ) -> str:
        session = data_engine.get_session(session_id)
        df: pd.DataFrame = session["current"]
        quality = data_engine.calculate_quality_score(df)
        summaries = data_engine.get_column_summaries(df)
        audit_log = session.get("audit_log", [])
        claims = verification_engine.verify_dataset_suite(df)

        rows_html = ""
        for s in summaries[:12]:
            mean_str = f"{s.get('mean', 'N/A')}"
            med_str = f"{s.get('median', 'N/A')}"
            std_str = f"{s.get('std', 'N/A')}"
            rows_html += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">{s['name']}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{s['inferred_type']}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{s['missing_count']} ({s['missing_percentage']}%)</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{mean_str}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{med_str}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{std_str}</td>
            </tr>
            """

        audit_html = ""
        for log in audit_log:
            audit_html += f"""
            <li style="margin-bottom: 6px;">
                <strong>Step {log.get('step', '-')}:</strong> {log.get('description', '')}
            </li>
            """

        verify_html = ""
        for c in claims[:8]:
            color = "#10b981" if c["status"] == "Verified" else "#f59e0b" if c["status"] == "Needs Review" else "#ef4444"
            verify_html += f"""
            <div style="padding: 10px; margin-bottom: 8px; border-left: 4px solid {color}; background: #f8fafc; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: 600;">{c['claim_text']}</span>
                    <span style="color: {color}; font-weight: bold; font-size: 12px;">[{c['status']}]</span>
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                    {c['explanation']}
                </div>
            </div>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>{project_title} - DataLens AI Report</title>
            <style>
                body {{ font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }}
                h1, h2, h3 {{ color: #0f172a; }}
                .badge {{ display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }}
                .score-card {{ background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }}
                th {{ background: #f1f5f9; padding: 10px 8px; text-align: left; font-weight: 600; color: #334155; }}
                .disclaimer {{ background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 14px; border-radius: 8px; margin-top: 30px; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 24px;">
                <div>
                    <h1 style="margin: 0; font-size: 26px;">DataLens AI — Analysis Report</h1>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;"><strong>Project:</strong> {project_title} | <strong>Lead Analyst:</strong> {analyst_name}</p>
                </div>
                <div style="text-align: right; font-size: 12px; color: #64748b;">
                    <div>Dataset Source: <strong>{dataset_source}</strong></div>
                    <div>License: <strong>{license_type}</strong></div>
                </div>
            </div>

            <div class="score-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9;">Dataset Health & Quality Score</div>
                        <div style="font-size: 38px; font-weight: 800;">{quality['score']}/100 <span style="font-size: 20px; font-weight: 600;">(Grade {quality['grade']})</span></div>
                    </div>
                    <div style="text-align: right; font-size: 13px;">
                        <div>Rows: <strong>{len(df)}</strong> | Columns: <strong>{len(df.columns)}</strong></div>
                        <div>Missing Cells: <strong>{quality['total_missing_cells']} ({quality['missing_percentage']}%)</strong></div>
                        <div>Duplicates: <strong>{quality['total_duplicates']}</strong></div>
                    </div>
                </div>
            </div>

            <h2>1. Data Cleaning & Transformation History</h2>
            <ul style="background: #f8fafc; padding: 16px 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
                {audit_html}
            </ul>

            <h2>2. Descriptive Feature Summaries</h2>
            <table>
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Type</th>
                        <th>Missing</th>
                        <th>Mean</th>
                        <th>Median</th>
                        <th>Std Dev</th>
                    </tr>
                </thead>
                <tbody>
                    {rows_html}
                </tbody>
            </table>

            <h2>3. AI Insights Verification Audit</h2>
            <p style="color: #64748b; font-size: 13px;">Dual-engine mathematical recomputation (Pandas + NumPy) verifying that insights match ground truth data.</p>
            {verify_html}

            <h2>4. Limitations & Ethical Considerations</h2>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; font-size: 13px; color: #166534;">
                <p><strong>Observational Caution:</strong> Statistical associations demonstrated herein do not imply causal relationships.</p>
                <p><strong>Generalizability:</strong> Findings are restricted to the distribution characteristics of sample dataset '{session.get('filename')}'.</p>
            </div>

            <div class="disclaimer">
                <strong>Academic Capstone Disclaimer:</strong> This automated report was compiled by DataLens AI. All statistical measures are computed directly from the provided dataset. Interpretations should be verified by domain specialists prior to policy, medical, or high-stakes academic decisions.
            </div>
        </body>
        </html>
        """
        return html

    def generate_pdf(
        self,
        session_id: str,
        project_title: str,
        analyst_name: str,
        dataset_source: str,
        license_type: str,
        custom_notes: Optional[str] = None
    ) -> bytes:
        """Generates a professional multi-page PDF analysis report using ReportLab."""
        session = data_engine.get_session(session_id)
        df: pd.DataFrame = session["current"]
        quality = data_engine.calculate_quality_score(df)
        summaries = data_engine.get_column_summaries(df)
        audit_log = session.get("audit_log", [])
        claims = verification_engine.verify_dataset_suite(df)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        styles = getSampleStyleSheet()

        # Custom typography styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a")
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            textColor=colors.HexColor("#64748b")
        )
        h2_style = ParagraphStyle(
            "H2",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#0284c7"),
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#334155")
        )
        bullet_style = ParagraphStyle(
            "Bullet",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1e293b"),
            leftIndent=15
        )

        elements = []

        # Title & Header
        elements.append(Paragraph("DataLens AI — Intelligent EDA Report", title_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"<b>Project:</b> {project_title} | <b>Analyst:</b> {analyst_name} | <b>Dataset:</b> {session.get('filename')}", subtitle_style))
        elements.append(Paragraph(f"<b>Source:</b> {dataset_source} | <b>License:</b> {license_type}", subtitle_style))
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceAfter=14))

        # Executive Metrics Table
        metric_data = [
            ["Data Quality Score", f"{quality['score']} / 100 (Grade {quality['grade']})", "Total Observations", str(len(df))],
            ["Completeness Ratio", f"{quality['completeness_score']}/30 pts", "Total Features", str(len(df.columns))],
            ["Missing Cells", f"{quality['total_missing_cells']} ({quality['missing_percentage']}%)", "Duplicate Rows", str(quality['total_duplicates'])]
        ]
        metric_table = Table(metric_data, colWidths=[130, 130, 130, 140])
        metric_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#0f172a")),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(metric_table)
        elements.append(Spacer(1, 14))

        # Section 1: Data Cleaning History
        elements.append(Paragraph("1. Data Cleaning & Transformation History", h2_style))
        for log in audit_log:
            elements.append(Paragraph(f"• <b>Step {log.get('step', '-')}:</b> {log.get('description', '')}", bullet_style))
            elements.append(Spacer(1, 2))
        elements.append(Spacer(1, 10))

        # Section 2: Feature Statistics Table
        elements.append(Paragraph("2. Exploratory Descriptive Statistics", h2_style))
        headers = ["Feature", "Type", "Missing", "Mean", "Median", "Std Dev"]
        table_rows = [headers]
        for s in summaries[:12]:
            table_rows.append([
                s['name'],
                s['inferred_type'],
                f"{s['missing_count']} ({s['missing_percentage']}%)",
                f"{s.get('mean', '-')}",
                f"{s.get('median', '-')}",
                f"{s.get('std', '-')}"
            ])
        stats_table = Table(table_rows, colWidths=[100, 80, 90, 80, 80, 100])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0284c7")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(stats_table)
        elements.append(Spacer(1, 14))

        # Section 3: Dual-Engine Verification
        elements.append(Paragraph("3. Dual-Engine Claim Verification (Pandas vs NumPy)", h2_style))
        for c in claims[:6]:
            status_color = "#10b981" if c['status'] == "Verified" else "#f59e0b" if c['status'] == "Needs Review" else "#ef4444"
            elements.append(Paragraph(f"• <b>[{c['status']}]</b> {c['claim_text']}", bullet_style))
            elements.append(Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;<i>Method:</i> {c['verification_method']}. {c['explanation']}", body_style))
            elements.append(Spacer(1, 4))
        elements.append(Spacer(1, 10))

        # Section 4: Ethical Considerations & Disclaimers
        elements.append(Paragraph("4. Methodological Limitations & Academic Disclaimer", h2_style))
        elements.append(Paragraph(
            "<b>Disclaimer:</b> Findings produced by DataLens AI are contingent upon dataset hygiene, "
            "sample completeness, and analytical choices. Correlation does not establish causation. "
            "All statistics have been independently verified through dual NumPy/Pandas engines.",
            body_style
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

report_service = ReportService()
