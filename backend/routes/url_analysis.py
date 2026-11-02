import os
import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.analysis import URLRequest, URLAnalysisResponse
from services.url_checker import analyze_url_structure, check_google_safe_browsing
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
        gsb_result = await check_google_safe_browsing(request.url, safe_browsing_key)
        
        if gsb_result:
            # Upgrade risk if GSB finds threats
            threat_types = [m.get("threatType", "Unknown threat") for m in gsb_result]
            result["warning_signs"] = [f"Google Safe Browsing: {t}" for t in threat_types] + result.get("warning_signs", [])
            result["risk_score"] = max(result["risk_score"], 90)
            result["risk_level"] = "high"
            result["summary"] = (
                f"CONFIRMED THREAT: Google Safe Browsing has flagged this URL for: {', '.join(threat_types)}. "
                "Do not visit this website."
            )
            result["analysis_mode"] = "ai+safe_browsing"
        else:
            result["analysis_mode"] = "rule-based" + ("+safe_browsing_clear" if safe_browsing_key else "")
        
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
