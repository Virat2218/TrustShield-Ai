import uuid
import mimetypes
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status, Form, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, CommunityReport, User
from schemas.community import (
    CommunityReportItem,
    CommunityReportDetail,
)
from services.auth_service import get_current_user
from services.storage_service import storage_service

router = APIRouter()

ALLOWED_CATEGORIES = [
    "Phishing",
    "UPI Fraud",
    "Fake Job Scam",
    "Investment Fraud",
    "OTP Scam",
    "Fake Website",
    "Social Media Scam",
    "Other",
]

@router.post("/reports", response_model=CommunityReportItem, status_code=status.HTTP_201_CREATED)
async def submit_scam_report(
    category: str = Form(...),
    description: str = Form(...),
    suspicious_url: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    incident_date: Optional[str] = Form(None),
    screenshot: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits a new community scam incident report.
    Streams and validates optional screenshot attachment, verifies raster integrity with Pillow,
    persists attachment under an opaque server filename, and generates a reference ID.
    """
    if not description.strip():
        raise HTTPException(status_code=422, detail="Incident description cannot be empty.")

    screenshot_filename = None
    if screenshot and screenshot.filename and screenshot.filename.strip():
        file_bytes, detected_format = await storage_service.stream_and_validate_attachment(screenshot)
        screenshot_filename = storage_service.save_attachment(file_bytes, detected_format)

    # Generate unique human-readable reference ID
    ref_id = f"TSA-REP-{uuid.uuid4().hex[:8].upper()}"

    report = CommunityReport(
        reference_id=ref_id,
        user_id=current_user.id,
        category=category.strip(),
        description=description.strip(),
        suspicious_url=suspicious_url.strip() if suspicious_url else None,
        phone_number=phone_number.strip() if phone_number else None,
        message=message.strip() if message else None,
        incident_date=incident_date.strip() if incident_date else None,
        screenshot_filename=screenshot_filename,
        status="Submitted",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return CommunityReportItem.from_report(report)

@router.get("/reports", response_model=list[CommunityReportItem])
def get_user_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the reports submitted strictly by the authenticated user."""
    reports = db.query(CommunityReport).filter(
        CommunityReport.user_id == current_user.id
    ).order_by(desc(CommunityReport.created_at)).all()

    return [CommunityReportItem.from_report(r) for r in reports]

@router.get("/reports/{report_id}", response_model=CommunityReportDetail)
def get_user_report_detail(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns detailed information of a specific report owned by the user."""
    report = db.query(CommunityReport).filter(
        CommunityReport.id == report_id,
        CommunityReport.user_id == current_user.id,
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scam report not found or access denied.",
        )

    return CommunityReportItem.from_report(report)

@router.get("/reports/{report_id}/attachment")
def get_report_attachment(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Authorized retrieval endpoint for report screenshot attachments.
    Only the report owner or an administrator can access the attachment.
    """
    report = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    # Authorization check: must be owner or admin
    is_owner = report.user_id == current_user.id
    is_admin = getattr(current_user, "is_admin", False)
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this attachment.",
        )

    if not report.screenshot_filename:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This report does not have an attached screenshot.",
        )

    safe_path = storage_service.get_attachment_path(report.screenshot_filename)
    if not safe_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment file was not found on the server.",
        )

    media_type, _ = mimetypes.guess_type(str(safe_path))
    if not media_type:
        media_type = "image/png"

    return FileResponse(
        path=str(safe_path),
        media_type=media_type,
        filename=report.screenshot_filename,
    )

@router.delete("/reports/{report_id}")
def delete_user_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows a user to withdraw/delete their own submitted report and removes its attachment safely."""
    report = db.query(CommunityReport).filter(
        CommunityReport.id == report_id,
        CommunityReport.user_id == current_user.id,
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scam report not found or access denied.",
        )

    # Safely delete attachment file if present
    if report.screenshot_filename:
        storage_service.delete_attachment(report.screenshot_filename)

    db.delete(report)
    db.commit()
    return {"message": f"Report {report.reference_id} successfully removed."}
