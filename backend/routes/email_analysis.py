import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.analysis import EmailAnalysisRequest, EmailAnalysisResponse
from services.email_analysis_service import analyze_email_details
from services.auth_service import get_current_user_optional
from database import get_db, ScanRecord, User

router = APIRouter()

@router.post("/analyze-email", response_model=EmailAnalysisResponse)
def analyze_email_header_endpoint(
    request: EmailAnalysisRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Analyzes email sender identity, display name spoofing, reply-to routing,
    and SPF/DKIM/DMARC authentication verdicts.
    """
    if not request.sender_email and not request.headers_text and not request.sender_display_name and not request.subject:
        raise HTTPException(
            status_code=422,
            detail="Please provide at least a sender address, display name, subject, or raw headers to analyze."
        )

    try:
        result = analyze_email_details(request)
        response_dict = result.dict()

        if current_user:
            display_snippet = request.sender_email or request.sender_display_name or request.subject or "Email Header Check"
            scan = ScanRecord(
                user_id=current_user.id,
                scan_type="email",
                submitted_content=display_snippet[:500],
                risk_score=result.risk_score,
                risk_level=result.risk_level,
                analysis_result=json.dumps(response_dict),
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)
            response_dict["scan_id"] = scan.id

        return EmailAnalysisResponse(**response_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email analysis error: {str(e)}")
