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
| 🔍 **AI Scam Message Detector** | Identifies SMS, WhatsApp, and email phishing, fake rewards, and urgency threats |
| 🔗 **URL Safety Checker** | Analyzes URL structures, suspicious TLDs, IP hosts, and SSL certificate flags |
| 📊 **Explainable AI Risk Reports** | Circular risk gauges (0–100), severity levels, warning signs, and recommendations |
| 🌐 **Bilingual (English + Hindi)** | Instant language switching across all pages and AI analysis |

### Phase 2 Advanced Capabilities
| Feature | Description |
|---|---|
| 📸 **Screenshot Scam Analyzer** | Drag & drop chat/payment screenshots; extracts text via OCR (Tesseract) and flags scam patterns |
| 📰 **Fake News Verification** | Checks viral headlines and claims against real-time credible reference archives |
| 🔐 **User Authentication** | Secure JWT authentication with bcrypt password hashing, login, signup, and user profiles |
| 🗂️ **Scan History Dashboard** | Searchable personal scan portal with multi-tenancy privacy, risk filtering, and detail view |
| 📄 **Downloadable PDF Reports** | Professional cybersecurity PDF reports generated server-side via Python ReportLab |
| 🤖 **AI Safety Chatbot** | Floating interactive safety assistant answering fraud questions and explaining scan reports |

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
- **Tesseract OCR** + **Pillow** (In-memory image validation & text extraction)
- **ReportLab** (High-fidelity PDF generation)
- **SQLAlchemy** (Relational ORM with auto-migrations; SQLite default, PostgreSQL ready)
- **PyJWT** + **Passlib** + **Bcrypt** (JWT authentication & password hashing)

**Browser Extension**
- **Google Chrome Manifest V3**
- Service worker background architecture (`background.js`)
- Tab URL detection (`chrome.tabs.query`) & local storage synchronization
- Responsive popup UI with real-time risk gauges

---

## 🧩 Chrome Browser Extension

TrustShield AI includes a ready-to-load Manifest V3 Chrome Extension located in `browser-extension/`.

### How to Install:
1. Open Chrome/Brave/Edge and navigate to `chrome://extensions`
2. Enable **"Developer mode"** in the top-right corner.
3. Click **"Load unpacked"** and select the folder:
   ```bash
   /Users/kushalpandya/TrustShield Ai/browser-extension
   ```
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
│       ├── ocr_service.py          # Tesseract OCR processor
│       └── auth_service.py         # Role verification & JWT handling
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

**1. Start the Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
- Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

**2. Start the Frontend:**
```bash
cd frontend
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 📡 Comprehensive API Reference

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
| `POST` | `/api/community/reports` | Submits incident report, returns unique `TSA-REP-XXXXXX` |
| `GET` | `/api/community/reports` | Returns reports filed by authenticated user |
| `GET` | `/api/community/reports/{id}` | Returns single report details (scoped to owner) |
| `DELETE` | `/api/community/reports/{id}` | Deletes owned report |

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

---

## 🔒 Security Architecture

1. **Role-Based Access Control (RBAC):** Admin endpoints are protected by `get_current_admin` dependency; unauthorized users are blocked with HTTP 403 Forbidden.
2. **Cheat-Proof Quiz Design:** Question options never include correct answers or explanations prior to submission; validation occurs strictly on the backend.
3. **Multi-Tenant Data Privacy:** Users can only view, track, or delete reports they created. Incident moderation is strictly reserved for audited administrators.
4. **Safe OCR & Image Handling:** Screenshot files are validated in-memory for size and valid image magic bytes. Files are never executed.
5. **Real-World Advisories:** Pre-seeded with official advisories from CERT-In, RBI, NPCI, and I4C regarding Digital Arrest scams, Fake APKs, and UPI payment frauds.
