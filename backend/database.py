import os
import json
import logging
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Boolean,
    text,
    inspect,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

logger = logging.getLogger(__name__)

# Ensure .env is loaded before reading DATABASE_URL
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trustshield.db").strip()
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

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
    token_version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("ScanRecord", back_populates="owner", cascade="all, delete-orphan")
    reports = relationship("CommunityReport", back_populates="reporter", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

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

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reset_tokens")

def init_db(target_engine=None):
    """
    Initializes database schema and performs safe, non-destructive incremental column migrations.
    Reports unexpected errors while specifically handling 'column already exists'.
    """
    active_engine = target_engine or engine
    Base.metadata.create_all(bind=active_engine)

    try:
        inspector = inspect(active_engine)
        table_names = inspector.get_table_names()
        if "users" in table_names:
            existing_cols = {c["name"] for c in inspector.get_columns("users")}
            dialect_name = active_engine.dialect.name

            # Migration: is_admin
            if "is_admin" not in existing_cols:
                try:
                    with active_engine.connect() as conn:
                        default_val = "FALSE" if dialect_name == "postgresql" else "0"
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT {default_val}"))
                        conn.commit()
                        logger.info("Migrated schema: added 'is_admin' to users table.")
                except Exception as e:
                    err_msg = str(e).lower()
                    if "duplicate column" in err_msg or "already exists" in err_msg:
                        logger.info("Column users.is_admin already exists.")
                    else:
                        logger.error(f"Unexpected database migration failure adding users.is_admin: {e}")
                        raise

            # Migration: token_version
            if "token_version" not in existing_cols:
                try:
                    with active_engine.connect() as conn:
                        conn.execute(text("ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 1"))
                        conn.commit()
                        logger.info("Migrated schema: added 'token_version' to users table.")
                except Exception as e:
                    err_msg = str(e).lower()
                    if "duplicate column" in err_msg or "already exists" in err_msg:
                        logger.info("Column users.token_version already exists.")
                    else:
                        logger.error(f"Unexpected database migration failure adding users.token_version: {e}")
                        raise
    except Exception as e:
        if "duplicate column" not in str(e).lower() and "already exists" not in str(e).lower():
            logger.error(f"Database schema initialization/inspection failed: {e}")
            raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
