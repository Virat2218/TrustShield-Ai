import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trustshield.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("ScanRecord", back_populates="owner", cascade="all, delete-orphan")
    reports = relationship("CommunityReport", back_populates="reporter", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")

class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    scan_type = Column(String(50), nullable=False, index=True)  # message, url, screenshot, news
    submitted_content = Column(Text, nullable=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)
    analysis_result = Column(Text, nullable=False)  # JSON serialized result
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    owner = relationship("User", back_populates="scans")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    options = Column(Text, nullable=False)  # JSON list of strings
    correct_answer = Column(Integer, nullable=False)  # Index of correct answer (0, 1, 2, 3)
    explanation = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    difficulty = Column(String(50), nullable=False, index=True)  # beginner, intermediate, advanced
    created_at = Column(DateTime, default=datetime.utcnow)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    category = Column(String(50), nullable=False)
    difficulty = Column(String(50), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="quiz_attempts")

class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    suspicious_url = Column(String(2048), nullable=True)
    phone_number = Column(String(50), nullable=True)
    message = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    screenshot_filename = Column(String(255), nullable=True)
    incident_date = Column(String(50), nullable=True)
    status = Column(String(50), default="Submitted", nullable=False)  # Submitted, Under Review, Verified, Rejected
    moderation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    reporter = relationship("User", back_populates="reports")

class ScamAlert(Base):
    __tablename__ = "scam_alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    risk_level = Column(String(50), nullable=False)  # High, Medium, Low
    description = Column(Text, nullable=False)
    how_it_works = Column(Text, nullable=False)
    warning_signs = Column(Text, nullable=False)  # JSON list
    prevention_tips = Column(Text, nullable=False)  # JSON list
    source_name = Column(String(255), nullable=False)
    source_url = Column(String(2048), nullable=False)
    published_at = Column(DateTime, default=datetime.utcnow, index=True)
    is_published = Column(Boolean, default=True, nullable=False)

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

def init_db():
    Base.metadata.create_all(bind=engine)
    # Safe migration: ensure is_admin exists on users if sqlite table was created in Phase 2
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
            conn.commit()
    except Exception:
        pass  # Column already exists

init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
