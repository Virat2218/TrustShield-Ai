import json
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session

from database import get_db, ScanRecord
from services.pdf_generator import generate_pdf_report

router = APIRouter()

@router.post("/generate-pdf")
async def generate_pdf_from_data(payload: dict):
    """
    Accepts arbitrary analysis result data from frontend and streams a downloadable PDF.
    """
    try:
        report_type = payload.get("report_type", "security")
        submitted_content = payload.get("submitted_content") or payload.get("claim") or payload.get("message") or payload.get("url") or "Submitted Digital Content"
        risk_score = payload.get("risk_score", 0)
        risk_level = payload.get("risk_level") or payload.get("status") or "Low"
        summary = payload.get("summary") or payload.get("explanation") or "No detailed summary provided."
        warning_signs = payload.get("warning_signs") or payload.get("supporting_evidence") or []
        recommendations = payload.get("recommendations") or []
        sources = payload.get("sources") or []
        domain = payload.get("domain")
        https_status = payload.get("https_status")
        scan_id = payload.get("scan_id")

        pdf_bytes = generate_pdf_report(
            report_type=report_type,
            submitted_content=str(submitted_content),
            risk_score=int(risk_score),
            risk_level=str(risk_level),
            summary=str(summary),
            warning_signs=warning_signs,
            recommendations=recommendations,
            sources=sources,
            domain=domain,
            https_status=https_status,
            report_id=f"TSA-{scan_id}" if scan_id else None,
        )

        filename = f"TrustShield-Report-{report_type}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.get("/download-report/{scan_id}")
def download_scan_pdf(scan_id: int, db: Session = Depends(get_db)):
    """
    Fetches a saved scan record by ID and returns its generated PDF.
    """
    scan = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    try:
        parsed_result = json.loads(scan.analysis_result)
    except Exception:
        parsed_result = {}

    pdf_bytes = generate_pdf_report(
        report_type=scan.scan_type,
        submitted_content=scan.submitted_content,
        risk_score=scan.risk_score,
        risk_level=scan.risk_level,
        summary=parsed_result.get("summary") or parsed_result.get("explanation", ""),
        warning_signs=parsed_result.get("warning_signs") or parsed_result.get("supporting_evidence", []),
        recommendations=parsed_result.get("recommendations", []),
        sources=parsed_result.get("sources", []),
        domain=parsed_result.get("domain"),
        https_status=parsed_result.get("https_status"),
        report_id=f"TSA-{scan.id}",
    )

    filename = f"TrustShield-{scan.scan_type.capitalize()}-Scan-{scan.id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

