import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables before importing application modules
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from services.auth_service import validate_jwt_secret
from routes.message_analysis import router as message_router
from routes.url_analysis import router as url_router
from routes.screenshot_analysis import router as screenshot_router
from routes.news_verification import router as news_router
from routes.auth import router as auth_router
from routes.history import router as history_router
from routes.pdf_report import router as pdf_router
from routes.chatbot import router as chatbot_router
from routes.quiz import router as quiz_router
from routes.community import router as community_router
from routes.admin import router as admin_router
from routes.alerts import router as alerts_router
from schemas.analysis import HealthResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("✅ TrustShield AI Backend starting...")
    validate_jwt_secret()
    print("   Security: JWT_SECRET_KEY validated (HS256, >= 32 chars)")
    init_db()
    print("   Database: Initialized")
    print(f"   AI Mode: {'Enabled' if os.getenv('GEMINI_API_KEY') or os.getenv('OPENAI_API_KEY') else 'Demo (rule-based)'}")
    print(f"   Safe Browsing: {'Enabled' if os.getenv('GOOGLE_SAFE_BROWSING_API_KEY') else 'Disabled'}")
    yield
    print("👋 TrustShield AI Backend shutting down...")

app = FastAPI(
    title="TrustShield AI API",
    description="Comprehensive AI-powered cybersecurity platform for scam detection, link verification, screenshot analysis, and fact checking.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS configuration
default_origins = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://trust-shield-ai-phi.vercel.app"
raw_allowed_origins = os.getenv("ALLOWED_ORIGINS", default_origins)
allowed_origins = [o.strip() for o in raw_allowed_origins.split(",") if o.strip()]

frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

# Always ensure the deployed Vercel production domain is whitelisted
vercel_prod = "https://trust-shield-ai-phi.vercel.app"
if vercel_prod not in allowed_origins:
    allowed_origins.append(vercel_prod)

# Per W3C CORS specification: allow_credentials cannot be True if allow_origins contains wildcard "*"
if not allowed_origins or "*" in allowed_origins:
    cors_allow_origins = ["*"]
    cors_allow_credentials = False
else:
    cors_allow_origins = allowed_origins
    cors_allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allow_origins,
    allow_credentials=cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 1 Routers
app.include_router(message_router, prefix="/api", tags=["Message Analysis"])
app.include_router(url_router, prefix="/api", tags=["URL Analysis"])

# Phase 2 Routers
app.include_router(screenshot_router, prefix="/api", tags=["Screenshot Analysis"])
app.include_router(news_router, prefix="/api", tags=["News Verification"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(history_router, prefix="/api/history", tags=["Scan History"])
app.include_router(pdf_router, prefix="/api", tags=["PDF Reports"])
app.include_router(chatbot_router, prefix="/api", tags=["AI Safety Assistant"])
app.include_router(quiz_router, prefix="/api/quiz", tags=["Scam Awareness Quiz"])
app.include_router(community_router, prefix="/api/community", tags=["Community Scam Reporting"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin Management"])
app.include_router(alerts_router, prefix="/api/alerts", tags=["Scam Alerts Center"])

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    ocr_ok = True
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
    except Exception:
        ocr_ok = False

    return HealthResponse(
        status="ok",
        ai_available=bool(os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")),
        safe_browsing_available=bool(os.getenv("GOOGLE_SAFE_BROWSING_API_KEY")),
        ocr_available=ocr_ok,
        version="2.0.0",
    )

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=False)
