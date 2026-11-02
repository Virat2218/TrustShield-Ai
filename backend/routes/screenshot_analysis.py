import json
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.analysis import ScreenshotAnalysisResponse
from services.ocr_service import extract_text_from_image
from services.ai_detection import analyze_message_ai, analyze_message_rules
from services.auth_service import get_current_user_optional
from database import get_db, ScanRecord, User

router = APIRouter()

@router.post("/analyze-screenshot", response_model=ScreenshotAnalysisResponse)
async def analyze_screenshot(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Accepts an uploaded screenshot image, performs OCR text extraction,
    and runs scam detection analysis on the extracted message.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        extracted_text = extract_text_from_image(image_bytes)

        if not extracted_text or len(extracted_text.strip()) < 3:
            raise HTTPException(
                status_code=422,
                detail="No legible text could be extracted from this image. Please upload a clearer screenshot containing text.",
            )

        # Analyze extracted text using existing AI/rule engine
        result = await analyze_message_ai(extracted_text)
        if result is None:
            result = analyze_message_rules(extracted_text)

        response_data = {
            "extracted_text": extracted_text,
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "summary": result["summary"],
            "warning_signs": result["warning_signs"],
            "suspicious_phrases": result["suspicious_phrases"],
            "recommendations": result["recommendations"],
            "analysis_mode": result.get("analysis_mode", "ocr+rule-based"),
        }

        # Save to scan history if user is authenticated
        if current_user:
            scan = ScanRecord(
                user_id=current_user.id,
                scan_type="screenshot",
                submitted_content=extracted_text[:500],
                risk_score=result["risk_score"],
                risk_level=result["risk_level"],
                analysis_result=json.dumps(response_data),
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)
            response_data["scan_id"] = scan.id

        return ScreenshotAnalysisResponse(**response_data)

    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Screenshot analysis failed: {str(e)}")

