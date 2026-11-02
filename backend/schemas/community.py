from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class CommunityReportCreate(BaseModel):
    category: str = Field(..., min_length=2, max_length=50)
    description: str = Field(..., min_length=5, max_length=5000)
    suspicious_url: Optional[str] = Field(None, max_length=2048)
    phone_number: Optional[str] = Field(None, max_length=50)
    message: Optional[str] = Field(None, max_length=5000)
    incident_date: Optional[str] = Field(None, max_length=50)

    @field_validator('description')
    @classmethod
    def description_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Incident description cannot be empty')
        return v.strip()

class CommunityReportItem(BaseModel):
    id: int
    reference_id: str
    category: str
    suspicious_url: Optional[str] = None
    phone_number: Optional[str] = None
    message: Optional[str] = None
    description: str
    screenshot_filename: Optional[str] = None
    has_attachment: bool = False
    attachment_url: Optional[str] = None
    incident_date: Optional[str] = None
    status: str
    moderation_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_report(cls, report):
        item = cls.model_validate(report)
        if report.screenshot_filename:
            item.has_attachment = True
            item.attachment_url = f"/api/community/reports/{report.id}/attachment"
        return item

class CommunityReportDetail(CommunityReportItem):
    pass

