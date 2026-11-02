from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class AdminOverviewStats(BaseModel):
    total_users: int
    total_scans: int
    total_reports: int
    pending_reports: int
    verified_reports: int
    total_alerts: int

class ChartDataPoint(BaseModel):
    name: str
    value: int

class MonthlyActivityPoint(BaseModel):
    date: str
    scans: int
    reports: int

class AdminAnalyticsResponse(BaseModel):
    stats: AdminOverviewStats
    scan_types_distribution: list[ChartDataPoint]
    risk_level_distribution: list[ChartDataPoint]
    activity_timeline: list[MonthlyActivityPoint]

class AdminUserItem(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_admin: bool
    created_at: datetime
    scan_count: int
    report_count: int

    class Config:
        from_attributes = True

class AdminUserUpdateRequest(BaseModel):
    is_admin: Optional[bool] = None
    full_name: Optional[str] = None

class AdminReportModerationRequest(BaseModel):
    status: str  # 'Submitted', 'Under Review', 'Verified', 'Rejected'
    moderation_notes: Optional[str] = None

class ScamAlertCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    category: str = Field(..., min_length=2, max_length=50)
    risk_level: str = Field(..., min_length=2, max_length=50)  # High, Medium, Low
    description: str
    how_it_works: str
    warning_signs: list[str]
    prevention_tips: list[str]
    source_name: str
    source_url: str
    is_published: bool = True

class QuizQuestionCreateRequest(BaseModel):
    question: str
    options: list[str]
    correct_answer: int
    explanation: str
    category: str
    difficulty: str

