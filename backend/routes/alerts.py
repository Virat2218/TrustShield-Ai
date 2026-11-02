import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, ScamAlert
from services.alerts_service import seed_scam_alerts

router = APIRouter()

class ScamAlertItem(BaseModel):
    id: int
    title: str
    category: str
    risk_level: str
    description: str
    source_name: str
    warning_signs: list[str]
    published_at: datetime

    class Config:
        from_attributes = True

class ScamAlertDetail(BaseModel):
    id: int
    title: str
    category: str
    risk_level: str
    description: str
    how_it_works: str
    warning_signs: list[str]
    prevention_tips: list[str]
    source_name: str
    source_url: str
    published_at: datetime

    class Config:
        from_attributes = True

class AlertsListResponse(BaseModel):
    total: int
    items: list[ScamAlertItem]

@router.get("", response_model=AlertsListResponse)
def get_alerts(
    category: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Returns public verified cybersecurity advisories and scam alerts.
    Supports filtering by category, risk level, and full-text keyword search.
    """
    # Ensure seed alerts exist
    seed_scam_alerts(db)

    query = db.query(ScamAlert).filter(ScamAlert.is_published == True)

    if category and category.strip() and category.lower() != "all":
        query = query.filter(ScamAlert.category == category.strip())

    if risk_level and risk_level.strip() and risk_level.lower() != "all":
        query = query.filter(ScamAlert.risk_level.ilike(risk_level.strip()))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            ScamAlert.title.ilike(term)
            | ScamAlert.description.ilike(term)
            | ScamAlert.how_it_works.ilike(term)
            | ScamAlert.category.ilike(term)
        )

    total = query.count()
    records = query.order_by(desc(ScamAlert.published_at)).offset(skip).limit(limit).all()

    items = []
    for r in records:
        try:
            ws = json.loads(r.warning_signs) if r.warning_signs else []
        except Exception:
            ws = []
        items.append(
            ScamAlertItem(
                id=r.id,
                title=r.title,
                category=r.category,
                risk_level=r.risk_level,
                description=r.description,
                source_name=r.source_name,
                warning_signs=ws,
                published_at=r.published_at,
            )
        )

    return AlertsListResponse(total=total, items=items)

@router.get("/categories", response_model=list[str])
def get_alert_categories(db: Session = Depends(get_db)):
    """Returns all distinct alert categories available."""
    seed_scam_alerts(db)
    rows = db.query(ScamAlert.category).filter(ScamAlert.is_published == True).distinct().all()
    categories = sorted([r[0] for r in rows if r[0]])
    return categories

@router.get("/{alert_id}", response_model=ScamAlertDetail)
def get_alert_detail(alert_id: int, db: Session = Depends(get_db)):
    """Returns complete advisory information, modus operandi, warning signs, and prevention tips."""
    seed_scam_alerts(db)
    alert = db.query(ScamAlert).filter(ScamAlert.id == alert_id, ScamAlert.is_published == True).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Cybersecurity advisory not found.")

    try:
        ws = json.loads(alert.warning_signs) if alert.warning_signs else []
    except Exception:
        ws = []

    try:
        pt = json.loads(alert.prevention_tips) if alert.prevention_tips else []
    except Exception:
        pt = []

    return ScamAlertDetail(
        id=alert.id,
        title=alert.title,
        category=alert.category,
        risk_level=alert.risk_level,
        description=alert.description,
        how_it_works=alert.how_it_works,
        warning_signs=ws,
        prevention_tips=pt,
        source_name=alert.source_name,
        source_url=alert.source_url,
        published_at=alert.published_at,
    )

