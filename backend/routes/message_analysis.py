import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.analysis import MessageRequest, MessageAnalysisResponse
from services.ai_detection import analyze_message_rules, analyze_message_ai
from services.auth_service import get_current_user_optional
from database import get_db, ScanRecord, User

router = APIRouter()

@router.post("/analyze-message", response_model=MessageAnalysisResponse)
async def analyze_message(
    request: MessageRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Analyze a text message for scam/phishing indicators."""
    try:
        # Try AI analysis first
        result = await analyze_message_ai(request.message)
        
        # Fall back to rule-based if AI unavailable
        if result is None:
            result = analyze_message_rules(request.message)

        response_dict = dict(result)

        if current_user:
            scan = ScanRecord(
                user_id=current_user.id,
                scan_type="message",
                submitted_content=request.message[:500],
                risk_score=result["risk_score"],
                risk_level=result["risk_level"],
                analysis_result=json.dumps(response_dict),
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)
            response_dict["scan_id"] = scan.id
        
        return MessageAnalysisResponse(**response_dict)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
