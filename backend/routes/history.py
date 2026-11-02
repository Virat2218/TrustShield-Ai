import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, ScanRecord, User
from schemas.analysis import (
    ScanHistoryItem,
    ScanDetailResponse,
    ScanStatsResponse,
)
from services.auth_service import get_current_user

router = APIRouter()

@router.get("", response_model=list[ScanHistoryItem])
def get_user_history(
    scan_type: Optional[str] = Query(None, description="Filter by type: message, url, screenshot, news"),
    risk_level: Optional[str] = Query(None, description="Filter by risk: low, medium, high"),
    search: Optional[str] = Query(None, description="Search submitted content"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the scan history strictly owned by the authenticated user.
    Never exposes another user's scan data.
    """
    query = db.query(ScanRecord).filter(ScanRecord.user_id == current_user.id)

    if scan_type and scan_type != "all":
        query = query.filter(ScanRecord.scan_type == scan_type.lower())

    if risk_level and risk_level != "all":
        query = query.filter(ScanRecord.risk_level == risk_level.lower())

    if search and search.strip():
        query = query.filter(ScanRecord.submitted_content.ilike(f"%{search.strip()}%"))

    scans = query.order_by(desc(ScanRecord.created_at)).offset(offset).limit(limit).all()
    return [ScanHistoryItem.model_validate(s) for s in scans]

@router.get("/stats", response_model=ScanStatsResponse)
def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns statistics of all scans performed by the user."""
    base_query = db.query(ScanRecord).filter(ScanRecord.user_id == current_user.id)
    total = base_query.count()
    high = base_query.filter(ScanRecord.risk_level == "high").count()
    medium = base_query.filter(ScanRecord.risk_level == "medium").count()
    low = base_query.filter(ScanRecord.risk_level == "low").count()

    return ScanStatsResponse(
        total_scans=total,
        high_risk=high,
        medium_risk=medium,
        low_risk=low,
    )

@router.get("/{scan_id}", response_model=ScanDetailResponse)
def get_scan_detail(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the full report of a specific scan owned by the user."""
    scan = db.query(ScanRecord).filter(
        ScanRecord.id == scan_id,
        ScanRecord.user_id == current_user.id,
    ).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or access denied.",
        )

    try:
        parsed_result = json.loads(scan.analysis_result)
    except Exception:
        parsed_result = {"summary": scan.submitted_content}

    return ScanDetailResponse(
        id=scan.id,
        scan_type=scan.scan_type,
        submitted_content=scan.submitted_content,
        risk_score=scan.risk_score,
        risk_level=scan.risk_level,
        analysis_result=parsed_result,
        created_at=scan.created_at,
    )

@router.delete("/{scan_id}")
def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes a scan record belonging to the authenticated user."""
    scan = db.query(ScanRecord).filter(
        ScanRecord.id == scan_id,
        ScanRecord.user_id == current_user.id,
    ).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or access denied.",
        )

    db.delete(scan)
    db.commit()
    return {"message": "Scan record successfully deleted."}

