import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, CommunityReport, User
from schemas.community import (
    CommunityReportCreate,
    CommunityReportItem,
    CommunityReportDetail,
)
from services.auth_service import get_current_user

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
    Generates a unique reference ID and sets status to 'Submitted'.
    """
    if not description.strip():
        raise HTTPException(status_code=422, detail="Incident description cannot be empty.")

    screenshot_filename = None
    if screenshot and screenshot.filename:
        # Validate format
        ext = screenshot.filename.split(".")[-1].lower()
        if ext in ["png", "jpg", "jpeg", "webp"]:
            # Generate safe identifier
            screenshot_filename = f"report_scr_{uuid.uuid4().hex[:12]}.{ext}"

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

    return CommunityReportItem.model_validate(report)

@router.get("/reports", response_model=list[CommunityReportItem])
def get_user_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the reports submitted strictly by the authenticated user."""
    reports = db.query(CommunityReport).filter(
        CommunityReport.user_id == current_user.id
    ).order_by(desc(CommunityReport.created_at)).all()

    return [CommunityReportItem.model_validate(r) for r in reports]

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

    return CommunityReportDetail.model_validate(report)

@router.delete("/reports/{report_id}")
def delete_user_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Allows a user to withdraw/delete their own submitted report."""
    report = db.query(CommunityReport).filter(
        CommunityReport.id == report_id,
        CommunityReport.user_id == current_user.id,
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scam report not found or access denied.",
        )

    db.delete(report)
    db.commit()
    return {"message": f"Report {report.reference_id} successfully removed."}

