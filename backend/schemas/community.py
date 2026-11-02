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
    suspicious_url: Optional[str]
    phone_number: Optional[str]
    message: Optional[str]
    description: str
    screenshot_filename: Optional[str]
    incident_date: Optional[str]
    status: str
    moderation_notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CommunityReportDetail(CommunityReportItem):
    pass

