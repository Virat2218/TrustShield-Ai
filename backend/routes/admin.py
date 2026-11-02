import json
from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from database import (
    get_db,
    User,
    ScanRecord,
    CommunityReport,
    ScamAlert,
    QuizQuestion,
    AdminAuditLog,
)
from services.auth_service import get_current_admin
from schemas.admin import (
    AdminAnalyticsResponse,
    AdminOverviewStats,
    ChartDataPoint,
    MonthlyActivityPoint,
    AdminUserItem,
    AdminUserUpdateRequest,
    AdminReportModerationRequest,
    ScamAlertCreateRequest,
    QuizQuestionCreateRequest,
)

router = APIRouter()

@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_admin_analytics(
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Computes real operational metrics and distribution statistics from live database records.
    """
    total_users = db.query(User).count()
    total_scans = db.query(ScanRecord).count()
    total_reports = db.query(CommunityReport).count()
    pending_reports = db.query(CommunityReport).filter(
        CommunityReport.status.in_(["Submitted", "Under Review"])
    ).count()
    verified_reports = db.query(CommunityReport).filter(
        CommunityReport.status == "Verified"
    ).count()
    total_alerts = db.query(ScamAlert).count()

    stats = AdminOverviewStats(
        total_users=total_users,
        total_scans=total_scans,
        total_reports=total_reports,
        pending_reports=pending_reports,
        verified_reports=verified_reports,
        total_alerts=total_alerts,
    )

    # 1. Scan Type Distribution
    type_counts = db.query(
        ScanRecord.scan_type, func.count(ScanRecord.id)
    ).group_by(ScanRecord.scan_type).all()
    scan_types_distribution = [
        ChartDataPoint(name=(t.capitalize() if t else "Unknown"), value=cnt)
        for t, cnt in type_counts
    ]
    if not scan_types_distribution:
        scan_types_distribution = [
            ChartDataPoint(name="Message", value=0),
            ChartDataPoint(name="URL", value=0),
            ChartDataPoint(name="Screenshot", value=0),
            ChartDataPoint(name="News", value=0),
        ]

    # 2. Risk Level Distribution
    risk_counts = db.query(
        ScanRecord.risk_level, func.count(ScanRecord.id)
    ).group_by(ScanRecord.risk_level).all()
    risk_level_distribution = [
        ChartDataPoint(name=(r.capitalize() if r else "Low"), value=cnt)
        for r, cnt in risk_counts
    ]
    if not risk_level_distribution:
        risk_level_distribution = [
            ChartDataPoint(name="High", value=0),
            ChartDataPoint(name="Medium", value=0),
            ChartDataPoint(name="Low", value=0),
        ]

    # 3. Activity Timeline (Past 7 days)
    timeline = []
    now = datetime.utcnow()
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_label = day_start.strftime("%b %d")

        s_cnt = db.query(ScanRecord).filter(
            ScanRecord.created_at >= day_start,
            ScanRecord.created_at < day_end,
        ).count()

        r_cnt = db.query(CommunityReport).filter(
            CommunityReport.created_at >= day_start,
            CommunityReport.created_at < day_end,
        ).count()

        timeline.append(MonthlyActivityPoint(date=day_label, scans=s_cnt, reports=r_cnt))

    return AdminAnalyticsResponse(
        stats=stats,
        scan_types_distribution=scan_types_distribution,
        risk_level_distribution=risk_level_distribution,
        activity_timeline=timeline,
    )

@router.get("/users", response_model=list[AdminUserItem])
def get_users_list(
    search: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Lists registered users along with their scan and report counts."""
    query = db.query(User)
    if search and search.strip():
        query = query.filter(
            User.email.ilike(f"%{search.strip()}%") | User.full_name.ilike(f"%{search.strip()}%")
        )

    users = query.order_by(desc(User.created_at)).all()
    result = []
    for u in users:
        s_count = db.query(ScanRecord).filter(ScanRecord.user_id == u.id).count()
        r_count = db.query(CommunityReport).filter(CommunityReport.user_id == u.id).count()
        result.append(
            AdminUserItem(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                is_admin=bool(u.is_admin),
                created_at=u.created_at,
                scan_count=s_count,
                report_count=r_count,
            )
        )
    return result

@router.patch("/users/{user_id}")
def update_user_status(
    user_id: int,
    request: AdminUserUpdateRequest,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Updates user status or toggles administrator privileges."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if request.is_admin is not None:
        if target_user.is_admin and request.is_admin is False:
            admin_count = db.query(User).filter(User.is_admin == True).count()
            if admin_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot revoke administrator privileges from the last active administrator.",
                )
        target_user.is_admin = request.is_admin

    if request.full_name is not None:
        target_user.full_name = request.full_name.strip()

    # Log audit
    log = AdminAuditLog(
        admin_user_id=admin_user.id,
        action="UPDATE_USER",
        resource_type="USER",
        resource_id=str(user_id),
        details=f"Updated user {target_user.email} (is_admin={target_user.is_admin})",
    )
    db.add(log)
    db.commit()
    return {"message": "User updated successfully."}

@router.get("/reports")
def get_all_reports(
    status_filter: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Returns all submitted community reports across all users for moderation."""
    query = db.query(CommunityReport)
    if status_filter and status_filter != "all":
        query = query.filter(CommunityReport.status == status_filter)

    reports = query.order_by(desc(CommunityReport.created_at)).all()
    output = []
    for r in reports:
        reporter_email = r.reporter.email if r.reporter else "Anonymous"
        output.append({
            "id": r.id,
            "reference_id": r.reference_id,
            "reporter_email": reporter_email,
            "category": r.category,
            "description": r.description,
            "suspicious_url": r.suspicious_url,
            "phone_number": r.phone_number,
            "status": r.status,
            "moderation_notes": r.moderation_notes,
            "created_at": r.created_at.isoformat(),
            "has_attachment": bool(r.screenshot_filename),
            "attachment_url": f"/api/community/reports/{r.id}/attachment" if r.screenshot_filename else None,
        })
    return output

@router.patch("/reports/{report_id}")
def moderate_report(
    report_id: int,
    request: AdminReportModerationRequest,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Updates status and moderation notes for a community scam report."""
    report = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    report.status = request.status
    if request.moderation_notes is not None:
        report.moderation_notes = request.moderation_notes.strip()

    # Log action
    log = AdminAuditLog(
        admin_user_id=admin_user.id,
        action="MODERATE_REPORT",
        resource_type="REPORT",
        resource_id=str(report_id),
        details=f"Changed status of {report.reference_id} to {request.status}",
    )
    db.add(log)
    db.commit()
    return {"message": f"Report {report.reference_id} status updated to {request.status}."}

@router.post("/alerts", status_code=status.HTTP_201_CREATED)
def create_scam_alert(
    request: ScamAlertCreateRequest,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Creates a new official scam advisory alert."""
    alert = ScamAlert(
        title=request.title.strip(),
        category=request.category.strip(),
        risk_level=request.risk_level.strip(),
        description=request.description.strip(),
        how_it_works=request.how_it_works.strip(),
        warning_signs=json.dumps(request.warning_signs),
        prevention_tips=json.dumps(request.prevention_tips),
        source_name=request.source_name.strip(),
        source_url=request.source_url.strip(),
        is_published=request.is_published,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Log action
    log = AdminAuditLog(
        admin_user_id=admin_user.id,
        action="CREATE_ALERT",
        resource_type="ALERT",
        resource_id=str(alert.id),
        details=f"Created alert: {alert.title}",
    )
    db.add(log)
    db.commit()
    return {"id": alert.id, "message": "Scam alert created successfully."}

@router.delete("/alerts/{alert_id}")
def delete_scam_alert(
    alert_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Deletes an alert."""
    alert = db.query(ScamAlert).filter(ScamAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted successfully."}

@router.post("/quiz/questions", status_code=status.HTTP_201_CREATED)
def create_quiz_question(
    request: QuizQuestionCreateRequest,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Adds a new question to the awareness quiz question bank."""
    q = QuizQuestion(
        question=request.question.strip(),
        options=json.dumps(request.options),
        correct_answer=request.correct_answer,
        explanation=request.explanation.strip(),
        category=request.category.strip(),
        difficulty=request.difficulty.strip(),
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"id": q.id, "message": "Quiz question created successfully."}

@router.delete("/quiz/questions/{question_id}")
def delete_quiz_question(
    question_id: int,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Deletes a quiz question."""
    q = db.query(QuizQuestion).filter(QuizQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found.")

    db.delete(q)
    db.commit()
    return {"message": "Question deleted successfully."}

