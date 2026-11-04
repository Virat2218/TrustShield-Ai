# 🛡️ TrustShield AI (Phase 1 + Phase 2 + Phase 3)

**AI-powered cybersecurity and digital threat detection ecosystem for everyone.**

TrustShield AI empowers users to identify online scams, suspicious messages, phishing URLs, malicious chat screenshots, and viral fake news — providing explainable risk reports, interactive scam quizzes, community incident reporting, verified threat advisories, an administrator command center, and a real-time Chrome browser extension.

---

## 📋 Table of Contents

- [Phase 3 Features Roadmap](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Chrome Browser Extension](#-chrome-browser-extension)
- [Quick Start](#-quick-start)
- [Comprehensive API Reference](#-comprehensive-api-reference)
- [Security Architecture](#-security-architecture)

---

## ✨ Features

### Phase 1 Foundation
| Feature | Description |
|---|---|
| 🔍 **AI Scam Message Detector** | Identifies SMS, WhatsApp, and email phishing, fake rewards, and urgency threats via dual-mode heuristic regex patterns (English + Hindi) and optional LLM synthesis |
| 🔗 **URL Safety Checker** | Analyzes URL structure, suspicious TLDs, raw IP hosts, brand spoofing, and shorteners, with optional Google Safe Browsing v4 integration |
| 📊 **Explainable AI Risk Reports** | Circular risk gauges (0–100), severity levels, warning signs, and actionable safety recommendations (never claiming guaranteed safety) |
| 🌐 **Bilingual (English + Hindi)** | Instant language switching across all pages and AI analysis |

### Phase 2 Advanced Capabilities
| Feature | Description |
|---|---|
| 📸 **Screenshot Scam Analyzer** | Drag & drop chat/payment screenshots; validates raster format and enforces size limits while streaming, with text extraction via Tesseract OCR |
| 📰 **Fake News Verification** | Evaluates viral claims and headlines using public encyclopedic search APIs (Wikipedia OpenSearch & DuckDuckGo Instant Answers), known viral hoax pattern heuristics, and optional LLM synthesis |
| 🔐 **User Authentication** | Secure JWT authentication with bcrypt password hashing, login, signup, and user profiles |
| 🗂️ **Scan History Dashboard** | Searchable personal scan portal with multi-tenancy privacy, risk filtering, and detail view |
| 📄 **Downloadable PDF Reports** | Professional cybersecurity PDF reports generated server-side via Python ReportLab |
| 🤖 **AI Safety Chatbot** | Floating interactive safety assistant answering fraud questions using dual-mode LLM and curated cybersecurity guidance |

### Phase 3 Community Defense & Intelligence (New)
| Feature | Description |
|---|---|
| 🧠 **Scam Awareness Quiz** | Interactive cybersecurity quiz across 7 categories (UPI, Phishing, Job scams, OTP fraud, Social Engineering) & 3 difficulty levels with instant explanations and score history |
| 📢 **Community Scam Reporting** | Crowdsourced threat submission portal generating unique reference IDs (`TSA-REP-XXXXXX`) with screenshot attachments and user report tracking |
| ⚡ **Admin Command Center** | Protected dashboard with Recharts visualizations (threat vectors, severity distribution, 7-day timeline), user role management, community report moderation, and alert authoring |
| 🚨 **Scam Alerts Center** | Public verified advisories sourced from CERT-In, RBI, NPCI, and I4C covering Digital Arrest scams, Fake APK Trojans, and Electricity bill cutoff scams |
| 🧩 **Chrome Browser Extension** | Manifest V3 extension providing one-click active tab scanning, instant safety score gauges, red flags, and direct links to deep web app scans |

---

## 🛠️ Tech Stack

**Frontend**
- **React.js 18** + **Vite 6**
- **Tailwind CSS v4** (Dark navy `#0a0e1a` & deep indigo `#0d1635` SaaS theme)
- **Recharts 3** (Interactive threat distributions, severity pie charts, operational timelines)
- **Framer Motion** (Smooth transitions & reactive layout animations)
- **Lucide React** (Cybersecurity icon system)
- **React Router v6** + **Axios** (with JWT Bearer interceptor)

**Backend**
- **Python 3.9+ / 3.11+**
- **FastAPI** + **Uvicorn**
- **Pillow** (Bounded stream chunk validation, raster format allowlist) + **Tesseract OCR** (Optional system package for OCR text extraction)
- **ReportLab** (High-fidelity PDF generation)
- **SQLAlchemy** (Relational ORM with startup table creation & backward-compatible SQLite column additions; SQLite default, PostgreSQL connection string ready)
- **PyJWT** + **Passlib** + **Bcrypt** (JWT authentication & password hashing)

**Browser Extension**
- **Google Chrome Manifest V3**
- Service worker background architecture (`background.js`)
- Tab URL detection (`chrome.tabs.query`) & local storage synchronization
- Responsive popup UI with real-time risk gauges (requires active local backend API at `http://localhost:8000`)

---

## 🧩 Chrome Browser Extension

TrustShield AI includes a ready-to-load Manifest V3 Chrome Extension located in `browser-extension/`.

> **Backend Requirement:** Active tab scans in the browser extension communicate directly with the local TrustShield AI backend API at `http://localhost:8000/api/analyze-url`. Ensure the backend server is running (`./start.sh` or `uvicorn main:app --port 8000`) before initiating a scan.

### How to Install:
1. Open Chrome, Brave, or Edge and navigate to `chrome://extensions`
2. Enable **"Developer mode"** in the top-right corner.
3. Click **"Load unpacked"** and select the repository's `browser-extension/` directory (e.g., `<path-to-TrustShield-Ai>/browser-extension`).
4. Pin **TrustShield AI** from the extensions toolbar.
5. Visit any website and click **"Analyze Website Safety"** for an instant real-time risk rating!

---

## 📁 Project Structure

```
TrustShield Ai/
├── start.sh                        # One-command runner for backend + frontend
├── README.md                       # Complete documentation
├── browser-extension/              # Chrome Manifest V3 Browser Extension
│   ├── manifest.json
│   ├── popup.html, popup.css, popup.js
│   ├── options.html, options.js
│   ├── background.js
│   ├── icons/ (16, 48, 128)
│   └── README.md
├── backend/
│   ├── main.py                     # FastAPI app with all Phase 1-3 routers registered
│   ├── database.py                 # SQLAlchemy models & migrations
│   ├── bootstrap_admin.py          # One-time administrative bootstrap CLI
│   ├── requirements.txt            # Python dependencies
│   ├── routes/
│   │   ├── message_analysis.py     # POST /api/analyze-message
│   │   ├── url_analysis.py         # POST /api/analyze-url
│   │   ├── screenshot_analysis.py  # POST /api/analyze-screenshot
│   │   ├── news_verification.py    # POST /api/verify-news
│   │   ├── auth.py                 # /api/auth/*
│   │   ├── history.py              # /api/history/*
│   │   ├── pdf_report.py           # /api/generate-pdf
│   │   ├── chatbot.py              # POST /api/chat
│   │   ├── quiz.py                 # /api/quiz/* (Phase 3 Feature 1)
│   │   ├── community.py            # /api/community/* (Phase 3 Feature 2)
│   │   ├── admin.py                # /api/admin/* (Phase 3 Feature 3)
│   │   └── alerts.py               # /api/alerts/* (Phase 3 Feature 4)
│   └── services/
│       ├── quiz_service.py         # Question bank & scoring engine
│       ├── alerts_service.py       # CERT-In/RBI advisory intelligence
│       ├── ai_detection.py         # Dual-mode scam detector
│       ├── ocr_service.py          # Stream validation & Tesseract OCR
│       ├── storage_service.py      # Private screenshot attachment storage
│       ├── url_checker.py          # Structural analysis & Safe Browsing
│       ├── news_verification.py    # Encyclopedic & fact-checking retrieval
│       ├── auth_service.py         # Role verification & JWT handling
│       └── mail_service.py         # SMTP email dispatcher & dev mailbox
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx          # Responsive nav with role-based Admin link
        │   ├── Footer.jsx          # Footer with 1930 Cyber Helpline
        │   └── ChatbotWidget.jsx   # Interactive safety advisor
        └── pages/
            ├── Home.jsx            # Landing page with Phase 3 showcase
            ├── QuizCenter.jsx      # Scam Awareness Center
            ├── ReportScam.jsx      # Community Incident Submission
            ├── MyReports.jsx       # User submitted reports portal
            ├── AdminDashboard.jsx  # Recharts analytics & moderation
            ├── ScamAlerts.jsx      # Verified advisory registry
            └── AlertDetail.jsx     # Deep threat advisory breakdown
```

---

## 🚀 Quick Start

### Option A: One-Command Start
```bash
./start.sh
```

### Option B: Manual Execution

**1. Configure Backend Environment:**
Copy the example environment file and generate a cryptographically strong signing key:
```bash
cd backend
cp .env.example .env
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Paste the generated key into backend/.env as JWT_SECRET_KEY=<your-key>
```

**2. Start the Backend:**
```bash
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

**3. Start the Frontend:**
```bash
cd ../frontend
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

**4. Bootstrap the Initial Administrator:**
To access the Admin Dashboard ([http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard) or shortcut [http://localhost:5173/admin](http://localhost:5173/admin)), bootstrap your registered account as the first administrator:
```bash
# 1. Register an account via the web UI at http://localhost:5173/signup
# 2. Run the one-time bootstrap command:
cd backend
source venv/bin/activate
python bootstrap_admin.py --email your-email@domain.com

# 3. Check administrator accounts at any time:
python bootstrap_admin.py --check
```

---

## 📡 Comprehensive API Reference

### Core Analysis & Utility Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze-message` | Analyzes SMS/WhatsApp text for phishing, lottery, and urgency threats |
| `POST` | `/api/analyze-url` | Performs structural analysis, TLD checks, and Safe Browsing verification |
| `POST` | `/api/analyze-screenshot` | Stream-validates image (PNG/JPEG/WEBP) and extracts text via OCR |
| `POST` | `/api/verify-news` | Evaluates claims via open encyclopedic APIs & heuristic hoax templates |
| `POST` | `/api/chat` | Conversational cybersecurity guidance (Gemini/OpenAI or local rule-base) |
| `GET` | `/api/history` | Fetches authenticated user's scan history with risk filtering |
| `GET` | `/api/history/{id}` | Fetches detailed result of a past scan record |
| `DELETE` | `/api/history/{id}` | Deletes a scan record owned by the authenticated user |
| `POST` | `/api/generate-pdf` | Generates downloadable ReportLab cybersecurity assessment PDF |
| `GET` | `/api/download-report/{id}` | Downloads assessment PDF for an owned scan record |
| `GET` | `/api/health` | Operational health check (AI, OCR, Safe Browsing availability) |

### Phase 3 Endpoints

#### 1. Scam Awareness Quiz
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/quiz/categories` | Returns 7 categories and 3 difficulty levels |
| `GET` | `/api/quiz/questions` | Returns questions without leaking answers/explanations |
| `POST` | `/api/quiz/submit` | Evaluates answers, calculates score & reveals explanations |
| `GET` | `/api/quiz/history` | Returns authenticated user's past quiz attempts |

#### 2. Community Scam Reporting
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/community/reports` | Submits incident report with optional screenshot upload |
| `GET` | `/api/community/reports` | Returns reports filed by authenticated user |
| `GET` | `/api/community/reports/{id}` | Returns single report details (scoped to owner) |
| `GET` | `/api/community/reports/{id}/attachment` | Retrieves authorized screenshot attachment (owner or admin only) |
| `DELETE` | `/api/community/reports/{id}` | Deletes owned report and removes physical attachment from disk |

#### 3. Admin Command Center (Requires `is_admin = True`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/analytics` | Returns real-time metrics, threat distributions & timeline |
| `GET` | `/api/admin/users` | Lists registered users with scan & report counts |
| `PATCH` | `/api/admin/users/{id}` | Updates user role (promote/demote admin) |
| `GET` | `/api/admin/reports` | Moderation queue for all community reports |
| `PATCH` | `/api/admin/reports/{id}` | Updates moderation status (`Verified`, `Dismissed`) |
| `POST` | `/api/admin/alerts` | Publishes official scam advisory |
| `DELETE` | `/api/admin/alerts/{id}` | Deletes scam advisory |
| `POST` | `/api/admin/quiz/questions` | Adds question to awareness quiz bank |
| `DELETE` | `/api/admin/quiz/questions/{id}`| Deletes question from quiz bank |

#### 4. Scam Alerts Center (Public)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | Lists advisories (supports `category`, `risk_level`, `search`) |
| `GET` | `/api/alerts/categories` | Returns distinct advisory categories |
| `GET` | `/api/alerts/{id}` | Full advisory details, modus operandi & prevention steps |

#### 5. Authentication & Account Security
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Registers account with bcrypt password hashing |
| `POST` | `/api/auth/login` | Returns JWT Bearer token with version claim |
| `POST` | `/api/auth/forgot-password` | Initiates reset; returns generic response (anti-enumeration) |
| `POST` | `/api/auth/reset-password` | Confirms reset using token, updates hash & revokes active sessions |
| `GET` | `/api/auth/me` | Fetches authenticated user profile & role |
| `PUT` | `/api/auth/profile` | Updates user profile details |

---

## 🔒 Security Architecture

1. **Role-Based Access Control (RBAC):** Admin endpoints are protected by `get_current_admin` dependency; unauthorized users are blocked with HTTP 403 Forbidden.
2. **Cheat-Proof Quiz Design:** Question options never include correct answers or explanations prior to submission; validation occurs strictly on the backend.
3. **Multi-Tenant Data Privacy:** Users can only view, track, or delete reports they created. Incident moderation is strictly reserved for audited administrators.
4. **Hardened Screenshot Upload & Safe OCR Pipeline:**
   - **Streaming Size Enforcement:** Uploads stream in bounded 64 KB chunks, rejecting files that exceed the maximum size (default 5 MB, configurable via `MAX_SCREENSHOT_SIZE_MB`) with HTTP 413 Payload Too Large before allocating memory.
   - **Byte-Signature Content Verification:** File contents are verified via Pillow (`img.verify()`) against an explicit allowlist of supported raster formats (`PNG`, `JPEG`, `WEBP`). Client-supplied filenames and MIME headers are never trusted.
   - **Resource Management:** Streams are safely reopened in context managers after verification and cleanly closed to eliminate file descriptor leaks.
   - **Sanitized Error Responses:** Internal stack traces and OCR execution errors are masked; clients receive clean status codes without internal exception leakage.
5. **Secure Community Report Attachment Storage & Access Control:**
   - **Streaming Size Enforcement:** Attachment uploads are streamed in bounded 64 KB chunks, enforcing `MAX_COMMUNITY_ATTACHMENT_SIZE_MB` (default 5 MB) with HTTP 413 before memory accumulation.
   - **Byte-Signature Content Verification:** File contents are verified via Pillow against raster formats (`PNG`, `JPEG`, `WEBP`); client-supplied MIME types and extensions are untrusted.
   - **Private Storage:** Attachments are persisted to a private, non-public directory (`COMMUNITY_UPLOAD_DIR`, default `backend/uploads/reports/`) outside the frontend static root.
   - **Opaque File Naming & Path Traversal Defense:** Server assigns cryptographically opaque filenames (`report_att_{uuid}.{ext}`) and enforces canonical directory containment.
   - **Authorized Access Only:** Attachments can only be accessed via authenticated endpoint `GET /api/community/reports/{id}/attachment`, restricted strictly to the report author and administrators (HTTP 401/403).
   - **Clean Deletion:** Deleting a report automatically and safely removes its physical attachment file from disk.
6. **Safe First-Admin Bootstrap & RBAC Governance:**
   - **One-Time Bootstrap:** The CLI tool (`backend/bootstrap_admin.py`) promotes an existing registered user only when zero administrators exist in the database.
   - **Strict Refusal on Existing Admin:** If one or more administrators already exist, repeated bootstrap attempts for other accounts are refused with an error and non-zero exit code.
   - **Safe Idempotence:** Re-running the bootstrap tool on an already-elevated administrator is safe, non-destructive, and idempotent.
   - **No Unauthenticated Elevation:** No public endpoint allows self-elevation or role selection; registration ignores client-supplied `is_admin` fields.
   - **Authorized Admin Promotions:** Subsequent administrative elevations must be performed by an authenticated administrator through the Admin Dashboard or authorized `PATCH /api/admin/users/{id}`.
   - **Lockout Prevention:** The system blocks revoking administrator privileges from the last active administrator with HTTP 400.
   - **Audited Operations:** All bootstrap and role modifications are recorded in `admin_audit_logs`.
7. **Real-World Advisories:** Pre-seeded with official advisories from CERT-In, RBI, NPCI, and I4C regarding Digital Arrest scams, Fake APKs, and UPI payment frauds.
8. **Secure Two-Step Password Reset & Account Takeover Defense:**
   - **No Email-Only Resets:** Replaced legacy unauthenticated email-only password replacement with a secure two-step token verification flow.
   - **Anti-Enumeration Generic Responses:** `POST /api/auth/forgot-password` returns the exact same generic confirmation whether the account exists or not.
   - **Cryptographic High-Entropy Tokens:** Generates single-use 256-bit cryptographically secure tokens (`secrets.token_urlsafe(32)`) with 15-minute expirations.
   - **Hashed Token Storage:** The database only stores the SHA-256 hash of the token (`PasswordResetToken.token_hash`), never plaintext tokens.
   - **Single-Use & Invalidation:** Tokens are marked used atomically upon successful reset; requesting a new reset token automatically invalidates any previously outstanding unconsumed tokens.
   - **Session Invalidation Across Devices:** Upon password reset, the user's `token_version` is atomically incremented. All active JWT sessions across all devices are immediately invalidated upon subsequent requests.
   - **Zero Token/Password Logging:** Plaintext tokens and passwords are never output to server logs or client API responses.
9. **Strict JWT Cryptographic Integrity & Startup Validation:**
   - **No Hard-Coded Fallback Secrets:** Silently falling back to repo-known JWT keys has been eliminated.
   - **Fail-Fast Startup Validation:** The backend verifies `JWT_SECRET_KEY` on startup (`lifespan`) and halts with a `RuntimeError` if the secret is missing, under 32 characters (256 bits), or matches known placeholders.
   - **Strict Signature & Expiry Enforcement:** Tokens signed with different keys or with expired timestamps are rejected with HTTP 401 Unauthorized.
   - **Zero Key Leakage:** Secrets are never logged to console or returned in any API endpoint response.
10. **Resilient Google Safe Browsing Integration & Explicit Outcome Differentiation:**
   - **Explicit Outcome Distinction:** Safe Browsing results are explicitly separated into four distinct states: `threat_found`, `no_matches` (clean database match), `not_configured`, and `api_error` (request/network failure or timeout).
   - **No False Safety Claims:** Timeouts, HTTP errors, malformed responses, and missing configuration are never conflated with clean results or labeled as `safe_browsing_clear`.
   - **Bounded Timeouts:** External API requests enforce bounded timeouts (configurable via `SAFE_BROWSING_TIMEOUT_SECONDS`, default 5.0s with 3.0s connect timeout) to prevent hanging requests.
   - **Preserved Structural Analysis:** When Safe Browsing is unconfigured or unavailable, structural URL analysis (IP host detection, suspicious TLDs, brand impersonation, URL shorteners, encoding anomalies) continues smoothly, accompanied by a clear indication in the API response and UI that the external check did not complete.
   - **Credential Protection:** Google Safe Browsing API keys are strictly excluded from server logs, error descriptions, and client responses.
11. **Multi-Tier AI Provider Fallback & Offline Operation:**
   - **Dual-Mode AI Pipeline:** Scam message analysis and safety chatbot query Google Gemini first (`GEMINI_API_KEY`), then OpenAI (`OPENAI_API_KEY`).
   - **Deterministic Offline Fallback:** If API keys are not supplied or external calls fail, the system falls back seamlessly to bilingual regex pattern heuristics (English + Hindi) and a curated cybersecurity knowledge base.
   - **Safety Disclaimer:** Automated analysis never guarantees complete safety. A "Low Risk" evaluation reflects the absence of detected red flags or threat database records—never an unconditional certificate of trust.
12. **Database Initialization & Safe Migrations:**
   - **Startup Schema Setup:** Relational tables are established on startup via SQLAlchemy `Base.metadata.create_all()`.
   - **Backward-Compatible Schema Adjustments:** Safe programmatic column additions (`is_admin`, `token_version`) preserve database continuity across SQLite updates without requiring external migration tooling.
13. **Graceful Dependency Degradation (Tesseract OCR):**
   - **Optional System Package:** Tesseract OCR is an optional system binary. When not present on the host OS, image validation still completes and the OCR service returns a sanitized, user-friendly notice without crashing or leaking internal paths.

---

## 🛡️ Initial Administrator Setup & Governance Guide

To establish administrative access on a new deployment:

```bash
# 1. Register a standard user account
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@trustshield.ai", "password": "StrongPassword123!", "full_name": "Lead Admin"}'

# 2. Promote the account to initial administrator (one-time bootstrap)
cd backend
source venv/bin/activate
python bootstrap_admin.py --email admin@trustshield.ai

# 3. Check current administrators:
python bootstrap_admin.py --check
```

### Security Rules:
| Condition | Behavior |
|---|---|
| Zero administrators exist | Promotes specified account to administrator, logs action to `admin_audit_logs`. |
| Specified user is already an admin | Safe no-op; confirms status and exits 0. |
| Any other administrator already exists | Refuses promotion; exits 1 with guidance to use Admin Dashboard. |
| Specified email does not exist | Rejects request; exits 1 with instructions to register first. |
| Public registration attempt with `is_admin: true` | Ignored; account created as regular user. |
| Attempt to demote the last remaining administrator | Blocked with HTTP 400 Bad Request. |

---

## 📧 Email Configuration & Local Development

### Production Setup (SMTP)
Configure your SMTP credentials in `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com          # or smtp.sendgrid.net / Amazon SES
SMTP_PORT=587                     # 587 (STARTTLS) or 465 (SSL)
SMTP_USER=your-smtp-user@domain.com
SMTP_PASSWORD=your-smtp-app-password
SMTP_FROM_EMAIL=noreply@trustshield.ai
SMTP_TLS=true
FRONTEND_URL=https://your-domain.com
```

### Local Development Setup (No SMTP Required)
When developing locally without an active SMTP server (`ENVIRONMENT=development`):
- Password reset requests still complete successfully and return generic anti-enumeration responses.
- To prevent credential leakage, tokens are **never** logged to stdout or exposed in API responses.
- Instead, reset notifications are safely recorded to the gitignored local development file:
  ```
  backend/.dev_mailbox.json
  ```
- Developers and test suites can inspect `backend/.dev_mailbox.json` or use `get_dev_latest_token(email)` to retrieve test reset links without needing a mail server.

---

## 🌐 Production Deployment & Hosting Guide

TrustShield AI supports two production deployment topologies:

### Topology A: Same-Origin / Reverse Proxy (Recommended)
Both the React frontend (static files) and FastAPI backend are served behind a unified reverse proxy (such as Nginx, Caddy, Cloudflare, Traefik, or AWS ALB):
- Route `/api/*` to the FastAPI backend (`http://backend:8000`).
- Route all other requests `/*` to the static Vite build (`dist/index.html`).
- **Frontend Configuration:** Leave `VITE_API_URL` unset. Axios defaults to the relative `/api` path, eliminating cross-origin preflight latency and CORS complexity.
- **SPA Deep Linking:** Web server rules redirect all missing routes to `/index.html` (Netlify/Cloudflare `_redirects` and `vercel.json` are included in `frontend/`).

### Topology B: Decoupled / Cross-Origin Services
The frontend and backend are hosted on separate domains or cloud services (e.g. Vercel frontend + Render/Railway backend):
1. **Frontend Environment:**
   Build the frontend with `VITE_API_URL` set to the live backend URL:
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```
2. **Backend Environment:**
   Configure explicit allowed origins in `backend/.env`:
   ```env
   FRONTEND_URL=https://app.yourdomain.com
   ALLOWED_ORIGINS=https://app.yourdomain.com
   ```
   *Security Note:* The backend strictly prohibits wildcard `*` with credentials. Only explicit origins are permitted.

### Persistence & Production Storage
- **Database:** SQLite (`DATABASE_URL=sqlite:///./trustshield.db`) is intended for local development only. In production environments where container disks are ephemeral (Render, Heroku, Railway, Fly.io, Kubernetes), use a managed PostgreSQL instance:
  ```env
  DATABASE_URL=postgresql://user:password@db-host:5432/trustshield_production
  ```
- **Community Attachments:** Attachments are stored on disk. If container storage is ephemeral, configure `COMMUNITY_UPLOAD_DIR` to point to a persistent volume mount (e.g. `/mnt/storage/uploads/reports`).
- **Secret Hygiene:** Never commit `.env` or development keys. Generate a cryptographically random `JWT_SECRET_KEY` on the production host using:
  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- **Process Binding:** Production startup binds to `--host 0.0.0.0 --port ${PORT:-8000}`.

