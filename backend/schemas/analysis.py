from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any
from datetime import datetime
import re

# ─────────────────────────────────────────────
# Phase 1 Schemas
# ─────────────────────────────────────────────

class MessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    
    @field_validator('message')
    @classmethod
    def message_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty or whitespace only')
        return v.strip()

class URLRequest(BaseModel):
    url: str = Field(..., min_length=1, max_length=2048)
    
    @field_validator('url')
    @classmethod
    def url_must_be_valid(cls, v):
        v = v.strip()
        if not v.startswith(('http://', 'https://')):
            v = 'https://' + v
        # Basic URL validation
        pattern = re.compile(
            r'^https?://'
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
            r'localhost|'
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
            r'(?::\d+)?'
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        if not pattern.match(v):
            raise ValueError('Invalid URL format')
        return v

class MessageAnalysisResponse(BaseModel):
    risk_score: int
    risk_level: str  # 'low', 'medium', 'high'
    summary: str
    warning_signs: list[str]
    suspicious_phrases: list[str]
    recommendations: list[str]
    analysis_mode: str  # 'ai' or 'rule-based'
    scan_id: Optional[int] = None

class SafeBrowsingCheckResponse(BaseModel):
    status: str  # 'threat_found' | 'no_matches' | 'not_configured' | 'api_error'
    threats: list[str] = []
    details: str

class URLAnalysisResponse(BaseModel):
    risk_score: int
    risk_level: str
    domain: str
    https_status: bool
    warning_signs: list[str]
    summary: str
    recommendations: list[str]
    analysis_mode: str
    safe_browsing: Optional[SafeBrowsingCheckResponse] = None
    scan_id: Optional[int] = None

class HealthResponse(BaseModel):
    status: str
    ai_available: bool
    safe_browsing_available: bool
    ocr_available: bool
    version: str

# ─────────────────────────────────────────────
# Phase 2 Schemas: Feature 1 - Screenshot Analyzer
# ─────────────────────────────────────────────

class ScreenshotAnalysisResponse(BaseModel):
    extracted_text: str
    risk_score: int
    risk_level: str
    summary: str
    warning_signs: list[str]
    suspicious_phrases: list[str]
    recommendations: list[str]
    analysis_mode: str
    scan_id: Optional[int] = None

# ─────────────────────────────────────────────
# Phase 2 Schemas: Feature 2 - Fake News Verification
# ─────────────────────────────────────────────

class NewsVerificationRequest(BaseModel):
    claim: str = Field(..., min_length=3, max_length=3000)

    @field_validator('claim')
    @classmethod
    def claim_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Claim cannot be empty')
        return v.strip()

class NewsSourceItem(BaseModel):
    name: str
    url: str
    date: Optional[str] = None
    snippet: Optional[str] = None

class NewsVerificationResponse(BaseModel):
    claim: str
    status: str  # 'Supported by Evidence', 'Disputed by Evidence', 'Misleading', 'Unverified'
    confidence_level: int  # 0 to 100
    explanation: str
    supporting_evidence: list[str]
    contradicting_evidence: list[str]
    sources: list[NewsSourceItem]
    recommendations: list[str]
    analysis_mode: str
    scan_id: Optional[int] = None

# ─────────────────────────────────────────────
# Phase 2 Schemas: Feature 3 - Authentication
# ─────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = Field(None, max_length=255)

    @field_validator('email')
    @classmethod
    def email_validation(cls, v):
        v = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Invalid email format")
        return v

class UserLoginRequest(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def email_cleanup(cls, v):
        return v.strip().lower()

class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def email_cleanup(cls, v):
        v = v.strip().lower()
        if not v or "@" not in v:
            raise ValueError("Invalid email format")
        return v

class ResetPasswordConfirmRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=256)
    new_password: str = Field(..., min_length=6, max_length=128)

    @field_validator('token')
    @classmethod
    def token_cleanup(cls, v):
        return v.strip()

class GenericMessageResponse(BaseModel):
    status: str = "ok"
    message: str

class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

# ─────────────────────────────────────────────
# Phase 2 Schemas: Feature 4 - Scan History
# ─────────────────────────────────────────────

class ScanHistoryItem(BaseModel):
    id: int
    scan_type: str
    submitted_content: str
    risk_score: int
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True

class ScanDetailResponse(BaseModel):
    id: int
    scan_type: str
    submitted_content: str
    risk_score: int
    risk_level: str
    analysis_result: dict[str, Any]
    created_at: datetime

class ScanStatsResponse(BaseModel):
    total_scans: int
    high_risk: int
    medium_risk: int
    low_risk: int

# ─────────────────────────────────────────────
# Phase 2 Schemas: Feature 6 - AI Chatbot
# ─────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=3000)
    context: Optional[dict[str, Any]] = None
    history: Optional[list[ChatMessage]] = None

class ChatResponse(BaseModel):
    reply: str
