import os
import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.analysis import URLRequest, URLAnalysisResponse
from services.url_checker import (
    analyze_url_structure,
    check_google_safe_browsing,
    SafeBrowsingStatus,
)
from services.auth_service import get_current_user_optional
from database import get_db, ScanRecord, User

router = APIRouter()

@router.post("/analyze-url", response_model=URLAnalysisResponse)
async def analyze_url(
    request: URLRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Analyze a URL for safety and threat indicators."""
    try:
        # Structural analysis (always performed)
        result = analyze_url_structure(request.url)
        
        # Optional: Google Safe Browsing check
        safe_browsing_key = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "").strip()
        gsb = await check_google_safe_browsing(request.url, safe_browsing_key)
        result["safe_browsing"] = gsb.to_dict()

        if gsb.status == SafeBrowsingStatus.THREAT_FOUND:
            # Upgrade risk if GSB finds threats
            threat_types = gsb.threats or ["Malicious Threat"]
            result["warning_signs"] = [f"Google Safe Browsing: {t}" for t in threat_types] + result.get("warning_signs", [])
            result["risk_score"] = max(result["risk_score"], 90)
            result["risk_level"] = "high"
            result["summary"] = (
                f"CONFIRMED THREAT: Google Safe Browsing has flagged this URL for: {', '.join(threat_types)}. "
                "Do not visit this website."
            )
            result["analysis_mode"] = "ai+safe_browsing_threat"

        elif gsb.status == SafeBrowsingStatus.NO_MATCHES:
            result["analysis_mode"] = "rule-based+safe_browsing_clear"

        elif gsb.status == SafeBrowsingStatus.API_ERROR:
            # Preserve structural analysis, but clearly signal that external check did not complete
            result["analysis_mode"] = "rule-based (safe_browsing_unavailable)"
            result["warning_signs"] = result.get("warning_signs", []) + [
                "Notice: Google Safe Browsing external check was unavailable (check did not complete)"
            ]
            if result.get("risk_level") == "low":
                result["summary"] += " (Note: External Google Safe Browsing database check was unavailable and did not complete.)"

        else:  # SafeBrowsingStatus.NOT_CONFIGURED
            result["analysis_mode"] = "rule-based"
        
        response_dict = dict(result)

        if current_user:
            scan = ScanRecord(
                user_id=current_user.id,
                scan_type="url",
                submitted_content=request.url[:500],
                risk_score=result["risk_score"],
                risk_level=result["risk_level"],
                analysis_result=json.dumps(response_dict),
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)
            response_dict["scan_id"] = scan.id

        return URLAnalysisResponse(**response_dict)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"URL analysis failed: {str(e)}")
