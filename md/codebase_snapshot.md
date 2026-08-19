# codebase_snapshot.md — Complete Project Snapshot

> **Purpose:** Read this file at the start of ANY new session before touching any code.
> It tells you exactly what is built, how each file is structured, what the conventions are,
> and where to pick up next — without needing to open and analyse every file from scratch.
>
> **Update rule:** At the end of every session, update the `## Current Status` section and
> add a row to the `## Session Log` table.

---

## Tech Stack (Final, Locked)

| Layer | Technology | Port |
|---|---|---|
| Frontend | React 18 + Vite + React Router v6 | 5173 |
| Backend | Node.js + Express 4 + Sequelize ORM | 5000 |
| AI Microservice | Python 3.11 + FastAPI + Uvicorn | 8000 |
| Database | PostgreSQL 16 | 5432 |
| Cache / Queue | Redis 7 | 6379 |
| Auth | JWT (`jsonwebtoken`) via `Authorization: Bearer <token>` | — |
| File uploads | Multer → disk (`backend/uploads/resumes/`) | — |
| WebSocket | `ws` package, same port as Express via `http.createServer` | — |
| Containerisation | Docker Compose (`docker-compose.yml`) | — |

> Stack was changed from Next.js+FastAPI → React (Vite) + Node.js + Python AI microservice per user decision.

---

## Directory Tree (Flat Reference)

```
AI-Hiring-Bias-Detector/
├── .env                          # All env vars (see section below)
├── .env.example                  # Template (keep in sync with .env)
├── .gitignore
├── docker-compose.yml            # 5 services: postgres, redis, backend, ai-service, frontend
├── README.md
├── md/
│   ├── architecture.md           # Stack/flow docs
│   ├── design.md                 # UI design system tokens (maps to index.css)
│   ├── memory.md                 # Session tracker (update every session)
│   ├── phase_planning.md         # 8-phase build roadmap with checkboxes
│   ├── prd.md                    # Product requirements
│   ├── rules.md                  # Engineering standards
│   ├── demo_flow_guide.md        # End-to-end evaluation & presentation demo script [Phase 7]
│   └── codebase_snapshot.md      # ← THIS FILE
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── uploads/resumes/          # Resume files stored here by Multer
│   └── src/
│       ├── index.js              # Express app entry; registers all routes
│       ├── config/
│       │   └── db.js             # Sequelize + PostgreSQL connection
│       ├── middleware/
│       │   └── auth.js           # `authenticate` + `requireRole(...roles)` middleware
│       ├── models/
│       │   └── index.js          # All 9 Sequelize models + associations + syncModels()
│       ├── routes/
│       │   ├── auth.js           # POST /register, /login, GET /me
│       │   ├── jobs.js           # Full CRUD + /analyze + /publish + /unpublish
│       │   ├── applications.js   # POST submit, GET /my, /job/:id, /:id
│       │   ├── tests.js          # POST /generate/:appId, GET /:id, POST /:id/submit, GET /by-application/:appId [Phase 3]
│       │   ├── eligibility.js    # POST /compute/:appId, GET /:appId, PATCH /:id/override, GET /review-queue/all [Phase 4]
│       │   ├── chatbot.js        # POST /session, POST /session/new, GET /session/:id, POST /session/:id/message, DELETE /session/:id [Phase 5]
│       │   ├── audit.js          # GET /, GET /stats, GET /export/csv [Phase 6]
│       │   └── analytics.js      # GET /dashboard (live KPI metrics & funnel) [Phase 6]
│       ├── services/
│       │   └── biasDetectionService.js  # Thin HTTP wrapper → AI service
│       └── websocket/
│           └── biasScoreWS.js    # ws:// live bias score (WebSocket server)
├── ai-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                   # FastAPI app, all endpoints (v0.6.0)
│   └── services/
│       ├── bias_detector.py      # MOCK keyword classifier → score + flags
│       ├── skill_profiler.py     # Keyword-based JD skill extractor
│       ├── resume_parser.py      # PDF/DOCX/TXT parser + PII anonymiser
│       ├── test_generator.py     # Phase 3: MOCK+Claude question generator
│       ├── grader.py             # Phase 3: Rule-based MCQ + rubric short-answer grader
│       ├── eligibility_engine.py # Phase 4: Threshold-based verdict engine + plain-English explanation
│       └── chatbot_service.py    # Phase 5: Role-aware contextual hiring chatbot & FAQ engine
└── Frontend/                     # NOTE: capital "F" — always use this exact casing
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx              # ReactDOM.createRoot
        ├── App.jsx               # BrowserRouter + all Routes + ErrorBoundary [Phase 7]
        ├── index.css             # Design system (tokens + test-UI + Chatbot styles)
        ├── context/
        │   └── AuthContext.jsx   # user, login(), logout(), isRecruiterSide, isCandidate
        ├── lib/
        │   └── api.js            # Axios instance + authAPI, jobsAPI, applicationsAPI, testsAPI, eligibilityAPI, auditAPI, analyticsAPI, chatbotAPI
        ├── layouts/
        │   ├── RecruiterLayout.jsx  # Sidebar nav (with Review Queue & Audit Trail) + mounted ChatbotWidget
        │   └── CandidateLayout.jsx  # Top nav bar + mounted ChatbotWidget
        ├── components/
        │   ├── BiasScoreRing.jsx    # Animated SVG ring showing bias score 0–100
        │   ├── BiasFlagPanel.jsx    # Expandable list of bias flags by category
        │   ├── ChatbotWidget.jsx    # Floating interactive AI assistant widget [Phase 5]
        │   └── ErrorBoundary.jsx    # Graceful UI exception recovery boundary [Phase 7]
        └── pages/
            ├── Landing.jsx          # Public hero page
            ├── Login.jsx            # Auth form
            ├── Register.jsx         # Auth form (role selector: recruiter/candidate)
            ├── recruiter/
            │   ├── Dashboard.jsx    # Live calculated KPI metrics, funnel progression, recent audit feed [Phase 6]
            │   ├── Jobs.jsx         # Recruiter's own jobs list
            │   ├── JobCreate.jsx    # Full JD editor + live bias score + publish
            │   ├── Candidates.jsx   # Anonymised applicant list + Send Test + Run Eligibility [Phase 3 & 4]
            │   ├── TestResults.jsx  # Per-question test breakdown view [Phase 3]
            │   ├── ReviewQueue.jsx  # Human Review Queue for needs_review candidates [Phase 4]
            │   └── AuditTrail.jsx   # Filterable compliance audit explorer + CSV export [Phase 6]
            └── candidate/
                ├── Jobs.jsx         # Browse published jobs
                ├── Apply.jsx        # Resume upload + application submit
                ├── Status.jsx       # Status tracker + Take Test CTA + AI Verdict explanation [Phase 3 & 4]
                └── TakeTest.jsx     # Full test-taking UI (timer, navigator, MCQ, short-answer) [Phase 3]
```

---

## Environment Variables (`.env`)

```ini
NODE_ENV=development
PORT=5000

# Database
POSTGRES_DB=hiring_bias_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
DB_HOST=localhost          # use "postgres" when running in Docker
DB_PORT=5432

# Auth
JWT_SECRET=change_me_to_a_strong_random_secret_at_least_64_chars
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379   # use "redis://redis:6379" in Docker

# AI Microservice
AI_SERVICE_URL=http://localhost:8000  # use "http://ai-service:8000" in Docker
ANTHROPIC_API_KEY=your_claude_api_key_here      # optional — test gen & chatbot fall back to local KB if missing
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend (Vite)
VITE_API_URL=http://localhost:5000
```

---

## Database Models (`backend/src/models/index.js`)

All models use Sequelize with PostgreSQL. `sequelize.sync({ alter: true })` runs on every startup.

| Model | Table | Key Fields |
|---|---|---|
| `Organisation` | `organisations` | `id` (UUID), `name` |
| `User` | `users` | `id`, `email`, `passwordHash`, `firstName`, `lastName`, `role` (ENUM), `isActive` |
| `Job` | `jobs` | `id`, `title`, `rawText`, `biasScore`, `skillProfileJson` (JSONB), `status` (ENUM) |
| `Application` | `applications` | `id`, `resumeUrl`, `anonymisedText`, `resumeBiasScore`, `status` (ENUM) |
| `AptitudeTest` | `aptitude_tests` | `id`, `questionsJson` (JSONB), `generatedFromSkillProfile` (JSONB), `timeLimitMinutes` (default 30) |
| `TestSubmission` | `test_submissions` | `id`, `answersJson` (JSONB), `autoScore`, `llmConfidence`, `breakdown` (JSONB), `submittedAt` |
| `EligibilityVerdict` | `eligibility_verdicts` | `id`, `verdict` (ENUM), `explanation`, `scoreDetail` (JSONB), `overriddenBy`, `overrideReason`, `overriddenAt` |
| `AuditLog` | `audit_logs` | `id`, `action`, `entityType`, `entityId`, `reason`, `meta` (JSONB) |
| `ChatbotSession` | `chatbot_sessions` | `id`, `role`, `messagesJson` (JSONB) |

---

## Current Status — Phase Tracker

| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Foundation | ✅ **Done** | Docker, Auth, DB, base UI layouts |
| 1 | JD Bias Scanner | ✅ **Done** | Live WebSocket, full bias analysis, publish flow |
| 2 | Resume Application | ✅ **Done** | Upload, anonymise PII, bias scan, recruiter view |
| 3 | Aptitude Test Engine | ✅ **Done** | Generate, take, grade, per-question breakdown |
| 4 | Eligibility Engine | ✅ **Done** | Objective scoring, human review queue, audit trail, verdict explanations |
| 5 | Chatbot | ✅ **Done** | Interactive candidate & recruiter assistant, quick suggestions, session sync |
| 6 | Dashboard & Audit | ✅ **Done** | Compliance Audit Trail Explorer, CSV export, live KPI pipeline analytics |
| 7 | Polish & Deploy | ✅ **Done** | Production build verified (`npm run build`), ErrorBoundary, Demo guide created |

---

## Session Log

| Date | Work Done | Next Step |
|---|---|---|
| 2026-08-06 | Phase 0 complete (Docker, Auth, DB, UI). Phase 1 complete (JD bias scanner, WebSocket, publish). Phase 2 complete (resume upload, anonymise, applicant view). Pushed to GitHub. | Start Phase 3 |
| 2026-08-07 | Built Phase 3 Aptitude Test Engine (test_generator.py, grader.py, tests.js, TakeTest.jsx, TestResults.jsx). Pushed to GitHub (commit `84ed5d2`). | Start Phase 4 |
| 2026-08-07 | Built Phase 4 Eligibility Engine & Human Review Queue: `eligibility_engine.py` (objective thresholds + plain-English reasons + 0 demographic signals), `/eligibility` endpoints (compute, get, override, review-queue/all), `ReviewQueue.jsx` (needs_review queue with override modal), `Candidates.jsx` (Run Eligibility button), `Status.jsx` (AI Verdict explanation card), `api.js` + `App.jsx` integration. | Start Phase 5 (Chatbot) |
| 2026-08-19 | Built Phase 5 Interactive AI Chatbot Assistant: `chatbot_service.py` (role-aware knowledge base, FAQ intent matching, Claude API fallback), `/chatbot/message` endpoint, `routes/chatbot.js` (session persistence & history), `ChatbotWidget.jsx` (floating UI with quick prompts & role awareness), mounted in `RecruiterLayout.jsx` and `CandidateLayout.jsx`. | Start Phase 6 (Dashboard & Audit Trail Explorer) |
| 2026-08-19 | Built Phase 6 Compliance Audit Trail Explorer & Dashboard Analytics: `routes/audit.js` (filterable log queries, stats, CSV export), `routes/analytics.js` (live KPI cards, pipeline funnel, recent activity), `AuditTrail.jsx` (interactive log explorer with modal JSON inspector & CSV export), upgraded `Dashboard.jsx` (live pipeline progression & real-time metrics), `analyticsAPI` in `api.js`, mounted `/recruiter/audit` in `App.jsx`. | Start Phase 7 (Polish & Deploy) |
| 2026-08-19 | Completed Phase 7 Polish & Deployment Readiness: Added `ErrorBoundary.jsx` for frontend recovery, verified production build (`vite build` passed with zero errors in 11.73s), synced `.env.example`, created `demo_flow_guide.md` with complete walkthrough scripts for presentation. Project is 100% complete across all 8 phases. | Ready for testing & production release |
