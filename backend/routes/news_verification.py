import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.analysis import NewsVerificationRequest, NewsVerificationResponse, NewsSourceItem
from services.news_verification import search_credible_sources, verify_claim_with_ai, verify_claim_rule_based
from services.auth_service import get_current_user_optional
from database import get_db, ScanRecord, User

router = APIRouter()

@router.post("/verify-news", response_model=NewsVerificationResponse)
async def verify_news(
    request: NewsVerificationRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Verifies a news headline or claim by querying credible sources and running evidence analysis.
    """
    try:
        sources = await search_credible_sources(request.claim)

        # Try AI fact checking first
        result = await verify_claim_with_ai(request.claim, sources)
        if result is None:
            result = verify_claim_rule_based(request.claim, sources)

        # Map status to risk_score for history and statistics consistency:
        # Supported -> 15 (low risk)
        # Unverified -> 45 (medium risk)
        # Misleading -> 65 (high risk)
        # Disputed -> 85 (high risk)
        status_to_risk = {
            "Supported by Evidence": (15, "low"),
            "Unverified": (45, "medium"),
            "Misleading": (65, "high"),
            "Disputed by Evidence": (85, "high"),
        }
        risk_score, risk_level = status_to_risk.get(result["status"], (50, "medium"))

        response_data = {
            "claim": request.claim,
            "status": result["status"],
            "confidence_level": result["confidence_level"],
            "explanation": result["explanation"],
            "supporting_evidence": result["supporting_evidence"],
            "contradicting_evidence": result["contradicting_evidence"],
            "sources": [NewsSourceItem(**s) for s in sources],
            "recommendations": result["recommendations"],
            "analysis_mode": result.get("analysis_mode", "retrieval+rule-based"),
        }

        # Save to scan history if authenticated
        if current_user:
            serializable_data = dict(response_data)
            serializable_data["sources"] = [s.model_dump() for s in response_data["sources"]]
            scan = ScanRecord(
                user_id=current_user.id,
                scan_type="news",
                submitted_content=request.claim[:500],
                risk_score=risk_score,
                risk_level=risk_level,
                analysis_result=json.dumps(serializable_data),
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)
            response_data["scan_id"] = scan.id

        return NewsVerificationResponse(**response_data)

    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News verification failed: {str(e)}")
