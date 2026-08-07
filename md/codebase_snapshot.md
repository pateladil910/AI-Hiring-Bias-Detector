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
│       │   └── tests.js          # POST /generate/:appId, GET /:id, POST /:id/submit, GET /by-application/:appId
│       ├── services/
│       │   └── biasDetectionService.js  # Thin HTTP wrapper → AI service
│       └── websocket/
│           └── biasScoreWS.js    # ws:// live bias score (WebSocket server)
├── ai-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                   # FastAPI app, all endpoints (v0.4.0)
│   └── services/
│       ├── bias_detector.py      # MOCK keyword classifier → score + flags
│       ├── skill_profiler.py     # Keyword-based JD skill extractor
│       ├── resume_parser.py      # PDF/DOCX/TXT parser + PII anonymiser
│       ├── test_generator.py     # Phase 3: MOCK+Claude question generator
│       └── grader.py             # Phase 3: Rule-based MCQ + rubric short-answer grader
└── Frontend/                     # NOTE: capital "F" — always use this exact casing
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx              # ReactDOM.createRoot
        ├── App.jsx               # BrowserRouter + all Routes + guards
        ├── index.css             # Design system (tokens + Phase 3 test-UI classes)
        ├── context/
        │   └── AuthContext.jsx   # user, login(), logout(), isRecruiterSide, isCandidate
        ├── lib/
        │   └── api.js            # Axios instance + authAPI, jobsAPI, applicationsAPI, testsAPI, eligibilityAPI, auditAPI
        ├── layouts/
        │   ├── RecruiterLayout.jsx  # Collapsible sidebar nav for recruiter portal
        │   └── CandidateLayout.jsx  # Top nav bar for candidate portal
        ├── components/
        │   ├── BiasScoreRing.jsx    # Animated SVG ring showing bias score 0–100
        │   └── BiasFlagPanel.jsx    # Expandable list of bias flags by category
        └── pages/
            ├── Landing.jsx          # Public hero page
            ├── Login.jsx            # Auth form
            ├── Register.jsx         # Auth form (role selector: recruiter/candidate)
            ├── recruiter/
            │   ├── Dashboard.jsx    # KPI cards + quick actions
            │   ├── Jobs.jsx         # Recruiter's own jobs list
            │   ├── JobCreate.jsx    # Full JD editor + live bias score + publish
            │   ├── Candidates.jsx   # Anonymised applicant list + Send Test + Results link [Phase 3]
            │   └── TestResults.jsx  # Per-question test breakdown view [Phase 3]
            └── candidate/
                ├── Jobs.jsx         # Browse published jobs
                ├── Apply.jsx        # Resume upload + application submit
                ├── Status.jsx       # Status tracker + Take Test CTA [Phase 3]
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
ANTHROPIC_API_KEY=your_claude_api_key_here      # optional — test gen falls back to MOCK if missing
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
| `EligibilityVerdict` | `eligibility_verdicts` | `id`, `verdict` (ENUM), `explanation`, `overriddenBy`, `overrideReason`, `overriddenAt` |
| `AuditLog` | `audit_logs` | `id`, `action`, `entityType`, `entityId`, `reason`, `meta` (JSONB) |
| `ChatbotSession` | `chatbot_sessions` | `id`, `role`, `messagesJson` (JSONB) |

### ENUMs
- `USER_ROLES`: `admin`, `hr_lead`, `recruiter`, `compliance`, `candidate`
- `JOB_STATUS`: `draft`, `published`, `closed`
- `APPLICATION_STATUS`: `applied`, `test_sent`, `test_completed`, `eligible`, `not_eligible`, `needs_review`, `interview`, `rejected`, `hired`
- `VERDICT`: `eligible`, `not_eligible`, `needs_review`

### Key Associations
- `Organisation` → has many `User`, `Job`
- `User` → has many `Application` (as `Candidate`), `Job` (as `Creator`), `AuditLog`
- `Job` → has many `Application`
- `Application` → has one `AptitudeTest` → has one `TestSubmission`
- `Application` → has one `EligibilityVerdict`

---

## Backend API Routes

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register user (firstName, lastName, email, password, role, orgName) |
| `POST` | `/api/auth/login` | Public | Login → returns `{ token, user }` |
| `GET` | `/api/auth/me` | JWT | Get current user profile |

### Jobs (`/api/jobs`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | JWT | List published jobs (candidate browse) |
| `GET` | `/api/jobs/my` | recruiter+ | Recruiter's own jobs |
| `GET` | `/api/jobs/:id` | JWT | Single job detail |
| `POST` | `/api/jobs` | recruiter | Create JD |
| `PUT` | `/api/jobs/:id` | recruiter | Update JD |
| `POST` | `/api/jobs/:id/analyze` | recruiter | Run full bias analysis via AI service |
| `PATCH` | `/api/jobs/:id/publish` | recruiter | Publish JD (requires bias scan first) |
| `PATCH` | `/api/jobs/:id/unpublish` | recruiter | Unpublish JD |

### Applications (`/api/applications`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/applications` | candidate | Submit application + resume upload (multipart/form-data) |
| `GET` | `/api/applications/my` | candidate | Candidate's own applications (includes Job title) |
| `GET` | `/api/applications/job/:jobId` | recruiter+ | Anonymised applicants for a job (no PII) |
| `GET` | `/api/applications/:id` | JWT | Single application detail |

### Tests (`/api/tests`) — Phase 3
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/tests/generate/:applicationId` | recruiter | Generate test from JD skill profile → sets status `test_sent` |
| `GET` | `/api/tests/:testId` | JWT | Fetch test questions — `correct_index` & `rubric_keywords` stripped for candidates |
| `POST` | `/api/tests/:testId/submit` | candidate | Submit answers → AI grades → stores result → sets status `test_completed` |
| `GET` | `/api/tests/by-application/:applicationId` | recruiter+ | View test + submission breakdown for an applicant |

### WebSocket
- `ws://localhost:5000/ws/bias-score`
- Send `{ text: "..." }` → Receive `{ score: 82.5, flag_count: 2 }` (live typing, Phase 1)

---

## AI Service Endpoints (`http://localhost:8000`)

| Method | Path | Status | Description |
|---|---|---|---|
| `GET` | `/health` | ✅ Active | Health check + phase info (v0.4.0) |
| `POST` | `/analyze/jd` | ✅ Phase 1 Active | Full JD bias analysis + skill profiler |
| `POST` | `/analyze/jd/quick` | ✅ Phase 1 Active | Lightweight score for WebSocket live typing |
| `POST` | `/analyze/resume` | ✅ Phase 2 Active | Upload file → parse + anonymise PII + bias scan |
| `POST` | `/analyze/resume/text` | ✅ Phase 2 Active | Text-only version (no file upload) |
| `POST` | `/generate/test` | ✅ Phase 3 Active | Generate MCQ+short-answer from skill profile (MOCK or Claude) |
| `POST` | `/grade` | ✅ Phase 3 Active | Auto-grade submitted answers (MCQ rule-based + rubric short-answer) |
| `POST` | `/eligibility` | 🔶 Phase 4 STUB | Compute eligibility verdict (returns basic threshold logic) |

### AI Service Python Files
| File | Purpose |
|---|---|
| `services/bias_detector.py` | MOCK keyword classifier → `{score, flags[], flag_count, explanation, model_version}` |
| `services/skill_profiler.py` | Keyword-based JD skill extractor → `{primary_field, experience_level, tech_stack[], soft_skills[]}` |
| `services/resume_parser.py` | `extract_text_from_bytes()`, `anonymise_text()`, `extract_metadata()` — supports PDF/DOCX/TXT |
| `services/test_generator.py` | `generate_questions(skill_profile, num_mcq, num_short_answer)` — MOCK bank covers React, Node.js, Python, SQL, DSA, DevOps, JS, General. Falls back to MOCK if no Claude key |
| `services/grader.py` | `grade(questions, answers)` → `{auto_score, llm_confidence, breakdown[]}` — MCQ rule-based, short-answer rubric keyword match |

### test_generator.py — MOCK Question Bank Coverage
- `react` / `node.js` / `javascript` / `python` / `sql` / `data_structures` / `devops` / `general`
- Resolves from `skill_profile.tech_stack` tags → `SKILL_TAG_MAP` → picks from bank
- Each MCQ: `{id, type, question, topic, options[4], correct_index}` — `correct_index` is server-side only
- Each short-answer: `{id, type, question, topic, rubric_keywords[]}` — keywords are server-side only

### grader.py — Grading Logic
- **MCQ**: `submitted_index == correct_index` → 1.0 score, else 0. Confidence always 1.0
- **Short-answer**: Count rubric keywords appearing in answer text. Score = matched/total. Confidence = `0.6 + 0.4 * (matched/total)`
- Returns per-question `breakdown[]` with `is_correct`, `feedback`, `score`, `max_score`, `confidence`

---

## Frontend Architecture

### Auth Flow
- `AuthContext.jsx` stores `user` + `token` in `localStorage`
- `isRecruiterSide = ['admin','hr_lead','recruiter','compliance'].includes(role)`
- `isCandidate = role === 'candidate'`
- Route guards: `RequireAuth`, `RequireRecruiter`, `RequireCandidate` in `App.jsx`

### API Client (`lib/api.js`)
- Axios instance with `baseURL = VITE_API_URL || http://localhost:5000`
- Auto-attaches `Authorization: Bearer <token>` on every request
- Auto-redirects to `/login` on 401

```js
authAPI        = { register, login, me }
jobsAPI        = { list, myJobs, get, create, update, analyze, publish, unpublish }
applicationsAPI = { apply, myApplications, get, byJob }
testsAPI = {
  get(testId),                        // Fetch test for candidate (sanitised)
  submit(testId, answers),             // Submit answers
  generateForApplication(appId),       // Recruiter generates test
  getByApplication(appId),             // Recruiter views test + result
}
eligibilityAPI = { getVerdict(applicationId), override(id, reason) }
auditAPI       = { list(params) }
```

### Design System (`index.css`)
Key CSS variables (from `design.md`):
```css
--color-bg:          #0B0F17   /* Page background */
--color-surface:     #131826   /* Card background */
--color-surface-alt: #1B2233   /* Input / alt surface */
--color-border:      #262E42
--color-primary:     #5B7FFF   /* Brand blue */
--color-accent:      #7C5CFF   /* Brand purple */
--color-success:     #34C77B
--color-warning:     #F5B93D
--color-danger:      #F0554C
--font-sans:         'Inter', system-ui
--font-mono:         'JetBrains Mono', 'Fira Code'
```

Key utility classes (Phases 0–3):
```
Layout:   .page  .page-header  .page-title  .page-subtitle  .container
Grid:     .grid-2  .grid-3  .grid-4
Cards:    .card
Buttons:  .btn  .btn-primary  .btn-ghost  .btn-accent  .btn-sm  .btn-lg
Badges:   .badge  .badge-success  .badge-warning  .badge-neutral  .badge-primary
Forms:    .form-group  .form-label  .form-input  .form-select  .form-error
Alerts:   .alert  .alert-error  .alert-success  .alert-warning
Stats:    .stat-card  .stat-value  .stat-label
Misc:     .spinner  .divider

Phase 3 test-UI additions:
  .question-option  .question-option.selected  .question-option.correct  .question-option.incorrect
  .option-label
  .q-nav-dot  .q-nav-dot.answered  .q-nav-dot.flagged  .q-nav-dot.active
  .progress-bar-track  .progress-bar-fill  .progress-bar-fill.success/warning/danger
  .test-timer  .test-timer.warning  .test-timer.danger  (pulse-red animation)
  .score-ring-wrapper  .score-ring-label
  .breakdown-row  .breakdown-row.correct  .breakdown-row.incorrect
```

### App Router (All Current Routes)
```
/                               → Landing (or redirect if logged in)
/login                          → Login
/register                       → Register

Recruiter portal (RequireRecruiter):
  /recruiter/dashboard          → RecruiterDashboard
  /recruiter/jobs               → RecruiterJobs
  /recruiter/jobs/new           → JobCreate
  /recruiter/jobs/:id/edit      → JobCreate (edit mode)
  /recruiter/candidates         → RecruiterCandidates
  /recruiter/test-results/:testId → TestResults   [Phase 3]

Candidate portal (RequireCandidate):
  /candidate/status             → CandidateStatus
  /candidate/jobs               → CandidateJobs
  /candidate/apply/:jobId       → Apply
  /candidate/test/:testId       → TakeTest        [Phase 3]
```

### Phase 3 Pages — Key Details

#### `TakeTest.jsx` (Candidate)
- Loads test via `testsAPI.get(testId)` on mount
- Countdown timer (`useCountdown` hook) — auto-submits on expiry
- Left sidebar: question navigator grid (32×32 dots — grey/green/yellow/blue states)
- MCQ: 4 `<button className="question-option">` with `A/B/C/D` pill labels
- Short-answer: `<textarea>` with character counter
- Flag for review button per question
- Submit confirmation modal: shows unanswered count + flagged count + time remaining
- Result screen: animated SVG score ring, pass/fail badge, MCQ breakdown table, short-answer rubric accordion

#### `TestResults.jsx` (Recruiter — takes `applicationId` as `:testId` URL param)
- Calls `testsAPI.getByApplication(applicationId)`
- Shows MiniScoreRing + KPI cards (total Q, correct, incorrect, AI confidence)
- MCQ breakdown table with correct/incorrect reveal
- Collapsible accordion per short-answer: rubric keywords highlighted green (matched) or grey (missed)

#### `Candidates.jsx` (Recruiter — Phase 3 additions)
- `Send Test` button (status: `applied`) → calls `testsAPI.generateForApplication(appId)`
- `⏳ Awaiting` badge (status: `test_sent`)
- `Results` button (status: `test_completed`/`eligible`/`not_eligible`) → navigate to `/recruiter/test-results/:appId`
- Grid columns expanded to `60px 1fr 160px 140px 160px`

#### `Status.jsx` (Candidate — Phase 3 additions)
- `ApplicationCard` fetches test via `testsAPI.getByApplication(app.id)` when status is `test_sent`
- Shows purple "Aptitude Test Available" CTA with `Take Test →` button
- Shows green "Test submitted" confirmation when `test_completed`

---

## Current Status — Phase Tracker

| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Foundation | ✅ **Done** | Docker, Auth, DB, base UI layouts |
| 1 | JD Bias Scanner | ✅ **Done** | Live WebSocket, full bias analysis, publish flow |
| 2 | Resume Application | ✅ **Done** | Upload, anonymise PII, bias scan, recruiter view |
| 3 | Aptitude Test Engine | ✅ **Done** | Generate, take, grade, per-question breakdown |
| 4 | Eligibility Engine | 🔴 **Next** | See Phase 4 plan below |
| 5 | Chatbot | ⬜ Not started | |
| 6 | Dashboard & Audit | ⬜ Not started | |
| 7 | Polish & Deploy | ⬜ Not started | |

---

## Phase 4 — Work To Do (Eligibility Engine + Human Review Queue)

> **DO NOT start Phase 4 without user approval.**

### What to build:
1. **`ai-service/services/eligibility_engine.py`** [NEW]
   - Activate real scoring: `test_score + resume_skill_match → verdict`
   - Returns `eligible` / `not_eligible` / `needs_review` + plain-English explanation
   - Replace the current STUB logic in `/eligibility`

2. **`backend/src/routes/eligibility.js`** [NEW]
   - `POST /api/eligibility/compute/:applicationId` — recruiter triggers eligibility after test_completed
   - `GET /api/eligibility/:applicationId` — get stored verdict
   - `PATCH /api/eligibility/:id/override` — recruiter overrides verdict (writes to AuditLog)

3. **`backend/src/index.js`** [MODIFY]
   - Register `app.use('/api/eligibility', eligibilityRouter)`

4. **`Frontend/src/pages/recruiter/ReviewQueue.jsx`** [NEW]
   - `needs_review` candidate queue with override UI
   - Override modal: reason input (required) + confirm → PATCH + AuditLog

5. **`Frontend/src/pages/recruiter/Candidates.jsx`** [MODIFY]
   - After `test_completed` → recruiter sees "Run Eligibility" button
   - Shows verdict badge after computation (`eligible` / `not_eligible` / `needs_review`)

6. **`Frontend/src/App.jsx`** [MODIFY]
   - Add `/recruiter/review` route → `ReviewQueue`

7. **`Frontend/src/lib/api.js`** [ALREADY has]
   - `eligibilityAPI.getVerdict(applicationId)` and `eligibilityAPI.override(id, reason)` already defined

---

## Key Engineering Rules (from `rules.md`)

- **No PII in recruiter API responses** — `candidateId`, name, email NEVER returned in `/applications/job/:id`
- **Eligibility engine must NEVER take demographic signals** (gender, age, nationality, address)
- **Borderline eligibility → human review**, never silent auto-rejection
- **AuditLog must be written** for every AI verdict, publish action, status change, override
- **Bias scan required before publish** — enforced server-side in `jobs.js`
- **All AI services degrade gracefully** — if AI service is down, app continues (application still saved)
- **All MOCK classifiers clearly marked** in code comments until replaced with real models
- **`correct_index` and `rubric_keywords` NEVER sent to candidate** — stripped in `GET /api/tests/:testId`

---

## How to Start the App Locally

```powershell
# Option A: Docker Compose (all 5 services at once)
docker-compose up --build

# Option B: Manual (4 terminals)
# Terminal 1 — AI service
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend
cd backend
npm run dev

# Terminal 3 — Frontend
cd Frontend
npm run dev
```

**Ports:** Frontend → http://localhost:5173 | Backend → http://localhost:5000 | AI → http://localhost:8000

**Health checks:**
- Backend: `GET http://localhost:5000/health`
- AI service: `GET http://localhost:8000/health`

---

## Session Log

| Date | Work Done | Next Step |
|---|---|---|
| 2026-08-06 | Phase 0 complete (Docker, Auth, DB, UI). Phase 1 complete (JD bias scanner, WebSocket, publish). Phase 2 complete (resume upload, anonymise, applicant view). Pushed to GitHub. | Start Phase 3 |
| 2026-08-07 | Created `codebase_snapshot.md`. Built complete Phase 3 — Aptitude Test Engine: `test_generator.py` (MOCK question bank + Claude fallback), `grader.py` (rule-based MCQ + rubric keyword short-answer), `routes/tests.js` (4 REST endpoints), `TakeTest.jsx` (countdown timer, question navigator, MCQ/short-answer, result screen), `TestResults.jsx` (per-question breakdown, rubric accordion), Phase 3 CTAs in `Status.jsx` and `Candidates.jsx`. Updated `codebase_snapshot.md`. | Start Phase 4 (Eligibility Engine + Human Review Queue) |
