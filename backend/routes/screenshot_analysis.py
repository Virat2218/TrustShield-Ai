import json
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.analysis import ScreenshotAnalysisResponse
from services import ocr_service
from services.ai_detection import analyze_message_ai, analyze_message_rules
from services.auth_service import get_current_user_optional
from database import get_db, ScanRecord, User

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze-screenshot", response_model=ScreenshotAnalysisResponse)
async def analyze_screenshot(
    file: UploadFile = File(...),
    manual_text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Accepts an uploaded screenshot image, validates upload size in bounded streaming chunks,
    verifies image integrity and raster format using Pillow, performs OCR text extraction
    (or uses user-supplied manual text override), and runs scam detection analysis on the message.
    """
    try:
        # 1. Stream upload in bounded chunks and enforce maximum size
        image_bytes = await ocr_service.stream_and_validate_upload(file)

        # 2. Validate raster format and image integrity using Pillow byte signature checks
        ocr_service.validate_raster_image(image_bytes)

        # 3. Extract text safely via OCR or manual override
        extracted_text = (manual_text or "").strip()
        if not extracted_text:
            try:
                extracted_text = ocr_service.extract_text_from_image(image_bytes)
            except ocr_service.OCRError as oe:
                logger.warning(f"OCR service unavailable: {str(oe)}")
                raise HTTPException(
                    status_code=503,
                    detail="OCR text extraction service is currently unavailable. Please enter the message text manually below.",
                )

        if not extracted_text or len(extracted_text.strip()) < 3:
            raise HTTPException(
                status_code=422,
                detail="No legible text could be extracted from this image. Please upload a clearer screenshot or enter the message text manually.",
            )

        # 4. Analyze extracted text using existing AI/rule engine
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

        # 5. Save to scan history if user is authenticated
        if current_user:
            try:
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
            except Exception as dbe:
                logger.error(f"Failed to record scan in database: {type(dbe).__name__}")

        return ScreenshotAnalysisResponse(**response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during screenshot analysis: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Screenshot analysis failed due to an internal processing error.",
        )
