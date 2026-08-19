# FairHire — AI Hiring Bias Detector & Unbiased Recruitment Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/AI%20Microservice-Python%203.11%20%2B%20FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Orchestration-Docker%20Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**FairHire** is an end-to-end, AI-powered hiring platform designed to eliminate systemic and unconscious bias across the entire recruitment lifecycle. From real-time job description bias scanning and blind resume anonymization to skill-tailored assessments, transparent eligibility decisions, and immutable compliance audit trails.

---

## 🌟 Key Highlights & Implemented Features

### 1. 🛡️ Real-Time JD Bias Scanner & Optimizer (Phase 1)
- **Sub-second Live Typing Score:** WebSocket connection (`ws://localhost:5000/ws/bias-score`) updates an animated SVG score ring as recruiters type.
- **Categorized Bias Flagging:** Detects and flags gender-coded words (e.g. *rockstar*, *ninja*, *dominant* vs *collaborative*), ageist tropes, and non-inclusive phrasing.
- **Automated Skill Profiling:** Extracts tech stack tags and soft skills to guide downstream assessments.
- **Enforced Safety Threshold:** JDs cannot be published without completing a bias scan.

### 2. 🕶️ Blind Resume Screening & PII Stripping (Phase 2)
- **Multi-Format Resume Parser:** Extracts clean text from PDF, DOCX, and TXT files.
- **Zero PII Exposure:** Automatically detects and strips names, email addresses, phone numbers, physical addresses, and demographic markers.
- **Blind Candidate Review:** Recruiters evaluate applicants labeled anonymously (e.g. *Candidate #001*) based purely on verified skills and background.

### 3. ⏱️ Skill-Tailored Aptitude Test Assessment (Phase 3)
- **Dynamic Question Generator:** Automatically generates 10 tailored assessment questions (8 MCQs + 2 Short Answers) matched to the JD’s required skill profile.
- **Interactive Timed Assessment UI:** 30-minute countdown timer with auto-submit on expiration, question navigator dot-matrix sidebar, and flag-for-review capabilities.
- **Automated Rubric Grader:** Rule-based MCQ evaluation and keyword rubric matching for technical short-answer responses.
- **Confidentiality:** Answer keys and grading rubrics are strictly secured server-side and never leaked to candidates.

### 4. ⚖️ Objective AI Eligibility Engine & Human Review Queue (Phase 4)
- **Zero Demographic Inputs:** Verdicts are calculated using **ONLY** objective technical signals (`Test Score` + `Resume Skill Match`).
- **No Silent Rejections:** Clear transparent thresholds (`Eligible`, `Needs Review`, `Not Eligible`) accompanied by **plain-English justifications**.
- **Human Review Queue:** Borderline candidates (40%–69%) are routed to a human recruiter queue.
- **Mandatory Override Reason:** Recruiter verdict overrides require a written justification (min 10 characters) saved permanently in the audit log.

### 5. 🤖 Interactive AI Hiring Assistant Chatbot (Phase 5)
- **Role-Aware Context:** Floating interactive widget customized for candidates (status explanations, test rules, blind screening FAQ) and recruiters (JD bias tips, review queue guidelines, audit compliance).
- **Suggestion Pills & Persistence:** Instant click-to-ask prompts, clean markdown formatting, session history tracking, and optional Claude 3.5 Haiku fallback.

### 6. 📜 Compliance Audit Trail Explorer & Live KPI Analytics (Phase 6)
- **Filterable Audit Log Explorer:** Search, filter by action types (`ELIGIBILITY_OVERRIDDEN`, `ELIGIBILITY_COMPUTED`, `TEST_SUBMITTED`, `JOB_PUBLISHED`), date ranges, and inspect formatted JSON event payloads.
- **One-Click CSV Export:** Download official compliance audit reports for legal and regulatory review.
- **Live Recruiter Dashboard:** Real-time KPI cards (Jobs Posted, Total Applications, Review Queue count, Avg Bias Score) and interactive **Pipeline Stage Funnel** progress bars.

### 7. 🚀 Hardening, Error Boundary & Demo Suite (Phase 7)
- **Graceful Error Recovery:** Custom React `<ErrorBoundary>` wrapped around the entire application.
- **Production Build Verified:** Optimized production bundle (`vite build`) passing in 11.73s with zero errors.
- **End-to-End Demo Guide:** Complete presentation and evaluation script in [`md/demo_flow_guide.md`](md/demo_flow_guide.md).

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │           React 18 + Vite (5173)        │
                               │  (Recruiter Portal & Candidate Portal)  │
                               └────────────────────┬────────────────────┘
                                                    │ HTTP / WebSocket
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │       Node.js + Express API (5000)      │
                               │  Auth • Jobs • Apps • Tests • Audit • WS│
                               └───────────┬─────────────────┬───────────┘
                                           │                 │
                           Sequelize (ORM) │                 │ HTTP (:8000)
                                           ▼                 ▼
                 ┌──────────────────────────────┐   ┌──────────────────────────────┐
                 │    PostgreSQL 16 Database    │   │  Python FastAPI AI Service   │
                 │  9 Models • Full Audit Trail │   │ Bias Scanner • Test Gen      │
                 └──────────────────────────────┘   │ Grader • Eligibility • Chat  │
                                                    └──────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Port |
|---|---|---|
| **Frontend** | React 18, Vite, React Router v6, Lucide React, Vanilla CSS Design System | `5173` |
| **Backend API** | Node.js, Express 4, Sequelize ORM, JWT, Multer, `ws` (WebSocket) | `5000` |
| **AI Microservice** | Python 3.11, FastAPI, Uvicorn, Pydantic, Claude API (Anthropic SDK) | `8000` |
| **Database** | PostgreSQL 16 (`hiring_bias_db`) | `5432` |
| **Cache / Queue** | Redis 7 | `6379` |
| **Containerization** | Docker, Docker Compose | — |

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (All 5 Services)

```powershell
# 1. Clone repository
git clone https://github.com/pateladil910/AI-Hiring-Bias-Detector.git
cd AI-Hiring-Bias-Detector

# 2. Build and launch all containers
docker-compose up --build
```
- **Frontend:** http://localhost:5173
- **Backend Health:** http://localhost:5000/health
- **AI Service Health:** http://localhost:8000/health

---

### Option 2: Local Development (Manual Terminals)

#### 1. Setup Environment Variables
Ensure `.env` exists in the root directory (copy from `.env.example`):
```ini
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
POSTGRES_DB=hiring_bias_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
JWT_SECRET=your_super_secret_jwt_key_at_least_64_characters_long
AI_SERVICE_URL=http://localhost:8000
VITE_API_URL=http://localhost:5000
ANTHROPIC_API_KEY=your_optional_claude_api_key
```

#### 2. Start Services

**Terminal 1 — AI Microservice:**
```powershell
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Backend API & WebSocket:**
```powershell
cd backend
npm install
npm run dev
```

**Terminal 3 — Frontend UI:**
```powershell
cd Frontend
npm install
npm run dev
```

---

## 🧪 Automated System Testing

We provide an automated end-to-end integration and compliance test runner that verifies all 8 phases:

```powershell
node scratch/system_test.js
```

---

## 📁 Repository Structure

```
AI-Hiring-Bias-Detector/
├── .env.example                  # Environment template
├── docker-compose.yml            # 5 multi-container service configurations
├── README.md                     # Master project documentation
├── md/
│   ├── demo_flow_guide.md        # Comprehensive presentation & testing script
│   ├── codebase_snapshot.md      # Full architecture & file status reference
│   ├── prd.md                    # Product requirements
│   ├── rules.md                  # Ethical & fair hiring standards
│   └── phase_planning.md         # 8-phase milestone breakdown
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry & route mounting
│   │   ├── models/               # 9 Sequelize models (User, Job, App, Test, Verdict, Audit, etc.)
│   │   ├── routes/               # auth, jobs, applications, tests, eligibility, chatbot, audit, analytics
│   │   └── websocket/            # biasScoreWS.js (Live typing bias scorer)
├── ai-service/
│   ├── main.py                   # FastAPI entrypoint (v0.6.0)
│   └── services/                 # bias_detector, skill_profiler, resume_parser, test_generator, grader, eligibility_engine, chatbot_service
└── Frontend/
    └── src/
        ├── App.jsx               # Route definitions & Error Boundary
        ├── index.css             # Dark-theme design tokens & utility classes
        ├── components/           # BiasScoreRing, BiasFlagPanel, ChatbotWidget, ErrorBoundary
        ├── layouts/              # RecruiterLayout, CandidateLayout
        └── pages/
            ├── recruiter/        # Dashboard, Jobs, JobCreate, Candidates, TestResults, ReviewQueue, AuditTrail
            └── candidate/        # Jobs, Apply, Status, TakeTest
```

---

## 📜 Ethical Hiring & Compliance Rules

1. **Strict Zero-Demographics Policy:** The AI Eligibility Engine never receives or processes age, gender, race, address, or photos.
2. **Transparent Candidate Explanations:** Candidates receive clear, objective feedback detailing why an application was approved or held for review.
3. **No Silent Auto-Rejections:** Borderline candidates are routed to human recruiters with full audit log tracking.
4. **Permanent Audit Trail:** Every status update, AI verdict, and manual recruiter override is recorded with user identity and timestamps.

---

## 📄 License & Attribution
Developed as part of the **AI-Hiring-Bias-Detector & Unbiased Recruitment Pipeline** initiative.  
Licensed under the [MIT License](LICENSE).