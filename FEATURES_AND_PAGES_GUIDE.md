# FairHire & EquiHire AI — Features and Pages Comprehensive Guide
> **Version 2.5.0** | Comprehensive Architecture, Feature Matrix, and Page Workflow Manual

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Multi-Tier System Architecture & Services](#2-multi-tier-system-architecture--services)
3. [Complete Pages Directory & User Workflows](#3-complete-pages-directory--user-workflows)
   - [A. Modern React Web Application (Port 5173)](#a-modern-react-web-application-port-5173)
   - [B. EquiHire Assessment & Evaluation Portal](#b-equihire-assessment--evaluation-portal)
4. [Deep-Dive Feature Specifications](#4-deep-dive-feature-specifications)
   - [1. Real-Time Hybrid Bias Detection Engine](#1-real-time-hybrid-bias-detection-engine)
   - [2. Interactive Trust & Bias Demo](#2-interactive-trust--bias-demo)
   - [3. Blind Screening & Demographic PII Cloaking](#3-blind-screening--demographic-pii-cloaking)
   - [4. Sandboxed Code Execution & Skill Assessment](#4-sandboxed-code-execution--skill-assessment)
   - [5. Blind Recruiter Evaluation & Decision Logging](#5-blind-recruiter-evaluation--decision-logging)
   - [6. Multi-Tenant Employer Onboarding & Admin Workflow](#6-multi-tenant-employer-onboarding--admin-workflow)
   - [7. EEOC, GDPR & Algorithmic Audit Trail](#7-eeoc-gdpr--algorithmic-audit-trail)
5. [User Roles & Access Control Matrix](#5-user-roles--access-control-matrix)
6. [API Endpoints & WebSocket Reference](#6-api-endpoints--websocket-reference)
7. [Quick Start & Verification](#7-quick-start--verification)

---

## 1. Executive Summary

**FairHire / EquiHire AI** is an algorithmic fairness and demographic-neutral hiring platform. Traditional recruitment pipelines frequently introduce unconscious bias—screening out qualified talent due to names, gender pronouns, age indicators, location, or school prestige.

This platform replaces biased screening with:
- **Pre-Publication Bias Prevention**: Analyzes Job Descriptions (JDs) for gendered, exclusionary, or age-biased wording before jobs are published.
- **Blind Demographic Shield**: Redacts PII (Personally Identifiable Information) before human recruiters see applications.
- **Deterministic Technical Testing**: Evaluates candidates through timed MCQs and sandboxed JavaScript/Python code runners with test assertions.
- **Transparent Composite Scoring**: Replaces subjective ratings with mathematical scoring formulas visible to candidates.
- **Tamper-Evident Audit Trails**: Logs every decision, access event, and score modification for EEOC and GDPR accountability.

---

## 2. Multi-Tier System Architecture & Services

The system operates three specialized concurrent services:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Web Browser / Client UI                         │
│                                                                        │
│   • React Single Page App (Port 5173)                                  │
│   • EquiHire Static Assessment Suite (Port 5000 / Root)               │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
          HTTP / REST / JSON                 WebSocket (Real-Time)
                    │                                │
┌───────────────────▼────────────────────────────────▼───────────────────┐
│              Backend REST API & WebSocket (Node.js / Express)          │
│                              Port 5000                                 │
│                                                                        │
│  • Auth & RBAC Middleware          • Job & Application Management     │
│  • SQLite / Postgres (Sequelize)   • Audit Trail Logging               │
│  • WebSocket Bias Broadcaster      • Static File & Resume Serving      │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
                         HTTP Microservice Calls
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Python AI Microservice (FastAPI)                    │
│                              Port 8000                                 │
│                                                                        │
│  • Layer 1: Lexicon & Heuristic Bias Detection                         │
│  • Layer 2: LLM Deep Semantic Bias Analysis                            │
│  • PII Anonymizer & Skill Vector Profiler                              │
│  • Interactive Swagger Docs: /docs                                     │
└────────────────────────────────────────────────────────────────────────┘
```

| Service | Port | URL | Health Check | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI** | `5173` | `http://localhost:5173` | `HTTP 200` | Modern React + Vite application |
| **Backend API** | `5000` | `http://localhost:5000` | `/health` | Express server, SQLite DB, WebSockets |
| **AI Microservice** | `8000` | `http://localhost:8000` | `/health` | FastAPI, PyTorch/regex bias engine |

---

## 3. Complete Pages Directory & User Workflows

### A. Modern React Web Application (Port 5173)

#### 1. Landing Page (`/`)
- **File**: `Frontend/src/pages/Landing.jsx`
- **Access**: Public
- **What it does**:
  - Displays the platform hero banner, core mission, and feature pillars.
  - **Interactive Trust & Bias Demo**: Allows users to paste or select sample job descriptions (e.g. *“Aggressive Ninja Developer wanted”*) to watch real-time bias detection in action.
  - **Live Bias Score Meter**: Computes masculine, feminine, ageist, and exclusionary bias scores with color-coded badges and alternative recommendations.
  - **Direct CTAs**: Quick links to candidate registration, job listings, employer onboarding requests, and role-based login.

#### 2. Authentication & Login (`/login`)
- **File**: `Frontend/src/pages/Login.jsx`
- **Access**: Public
- **What it does**:
  - Unified credential login using JWT authentication.
  - Supports role-based redirects:
    - `admin` → `/admin/dashboard`
    - `recruiter` → `/recruiter/jobs`
    - `candidate` → `/jobs`
  - Prevents credential enumeration with generic error messaging.

#### 3. Candidate Registration (`/register-candidate`)
- **File**: `Frontend/src/pages/candidate/RegisterCandidate.jsx`
- **Access**: Public
- **What it does**:
  - Candidate onboarding form: First Name, Last Name, Email, Password, and Resume upload (PDF/DOCX).
  - Sends a verification email (console or SMTP provider) and automatically stores an anonymized profile.

#### 4. Candidate Job Board (`/jobs`)
- **File**: `Frontend/src/pages/candidate/Jobs.jsx`
- **Access**: Candidate / Public
- **What it does**:
  - Lists approved and active job openings filtered by department, location, and employment type.
  - Shows JD bias status (e.g. *"Bias-Scanned & EEOC Verified"*).
  - Enables one-click application with candidate's cloaked profile.

#### 5. Employer Onboarding Request (`/employer-request`)
- **File**: `Frontend/src/pages/EmployerRequest.jsx`
- **Access**: Public (Companies wishing to hire)
- **What it does**:
  - Form capturing Company Name, Work Email, Contact Person, Company Size, and Hiring Volume.
  - Enters the application into a `pending_review` queue for Super Admin approval.

#### 6. Super Admin Dashboard (`/admin/dashboard`)
- **File**: `Frontend/src/pages/admin/AdminDashboard.jsx`
- **Access**: `admin` role only
- **What it does**:
  - **Employer Approval Queue**: Review incoming employer requests, approve/reject them, and automatically send invitation tokens.
  - **System Metrics**: Total active employers, live jobs, candidate pool volume, and system-wide bias reduction rate.
  - **User Management**: View, provision, or deactivate recruiters and candidates.

#### 7. Recruiter Job Creator (`/recruiter/jobs/create`)
- **File**: `Frontend/src/pages/recruiter/JobCreate.jsx`
- **Access**: `recruiter` or `admin`
- **What it does**:
  - Form to author job titles, departments, requirements, and full descriptions.
  - **Real-Time WebSocket Bias Assistant**: As the recruiter types, the editor communicates over `ws://localhost:5000/ws/bias-score` or queries the AI microservice.
  - **Flagged Phrase Highlighting**: Flags words like *"rockstar"*, *"digital native"*, *"aggressive"*, providing gender-neutral and age-inclusive substitutes.
  - Blocks publishing if severe bias thresholds are exceeded.

#### 8. Recruiter Job Management (`/recruiter/jobs`)
- **File**: `Frontend/src/pages/recruiter/Jobs.jsx`
- **Access**: `recruiter` or `admin`
- **What it does**:
  - Manage existing job listings, review application count per job, inspect the job's bias score, and toggle active/closed status.

#### 9. Recruiter Candidates Blind Review (`/recruiter/candidates`)
- **File**: `Frontend/src/pages/recruiter/Candidates.jsx`
- **Access**: `recruiter` or `admin`
- **What it does**:
  - **Anonymized Candidate Grid**: Shows applicants with randomized identifiers (e.g. `CAND-4F2A`) and cloaked pseudonyms.
  - Candidate names, universities, photos, age markers, and emails are completely hidden.
  - Shows validated skill match percentages, technical assessment scores, and experience levels.
  - **Human Decision Form**: Allows recruiters to advance, hold, or decline candidates while requiring an explicit justification note.

#### 10. Audit Trail & Compliance Explorer (`/recruiter/audit`)
- **File**: `Frontend/src/pages/recruiter/AuditTrail.jsx`
- **Access**: `recruiter` or `admin`
- **What it does**:
  - Searchable, tamper-evident chronological event log.
  - Tracks user logins, bias scans, profile redactions, recruiter reviews, and authorized identity reveals.
  - Generates compliance reports ready for audit inspection.

#### 11. Email Verification (`/verify-email`)
- **File**: `Frontend/src/pages/VerifyEmail.jsx`
- **Access**: Public with Token
- **What it does**:
  - Validates `?token=...` query parameters to activate candidate and recruiter accounts.

#### 12. Employer Invite Acceptance (`/accept-invite`)
- **File**: `Frontend/src/pages/AcceptInvite.jsx`
- **Access**: Public with Invite Token
- **What it does**:
  - Allows approved employer contacts to set their organization password, initialize their company profile, and activate their recruiter seats.

---

### B. EquiHire Assessment & Evaluation Portal

This suite handles technical assessment workflows, code evaluation sandboxes, and candidate-facing result breakdowns:

| Page | File | Primary Function |
| :--- | :--- | :--- |
| **Assessment Home** | `index.html` | Hero, problem statement, live bias meter, and process overview. |
| **Candidate Signup** | `signup.html` | Candidate-only public registration with client-side password strength validation. |
| **Role Login** | `login.html` | Role-aware login tabs for Candidates and Recruiters with generic error protection. |
| **Candidate Dashboard** | `candidate-dashboard.html` | Interactive 5-step visual stepper tracking real-time progress. |
| **Resume Upload** | `upload-resume.html` | Drag-and-drop resume upload with candidate consent, XHR progress bar, and instant redaction preview. |
| **Domain Selection** | `select-domain.html` | 10 specialized engineering domains (Frontend, Backend, DevOps, Data Science, etc.) with required skill tags. |
| **Timed MCQ Assessment** | `assessment.html` | Instructions pre-check, countdown timer, autosaving every 30 seconds, and answer key sanitization. |
| **Coding Sandbox** | `coding-test.html` | Dual-pane code editor (problem on left, code on right) with test cases and sandbox execution. |
| **Resume Skill Analysis** | `resume-analysis.html` | Displays parsed technical skills, domain skill gaps, and redaction confirmation buttons. |
| **Process Audit Report** | `bias-report.html` | Transparent process audit displaying redaction coverage and procedural checks (no fake 100% claims). |
| **Final Score Breakdown** | `final-score.html` | Displays the transparent composite score formula: `(MCQ×0.4) + (Coding×0.4) + (Resume×0.2)` with neutral status. |
| **Recruiter Blind Portal** | `recruiter-dashboard.html` | Blind candidate pool table, domain/status filters, and human review form. |

---

## 4. Deep-Dive Feature Specifications

### 1. Real-Time Hybrid Bias Detection Engine
- **Two-Layer Architecture**:
  - **Layer 1 (Heuristics & Lexicons)**: Scans text against research-backed dictionaries for masculine-coded terms (*dominant, aggressive, rockstar*), feminine-coded terms (*nurturing, supportive*), ageist terms (*energetic, digital native*), and exclusionary language.
  - **Layer 2 (Semantic Engine)**: Python microservice evaluates contextual sentence semantics.
- **WebSocket Streaming (`ws://localhost:5000/ws/bias-score`)**: As recruiters type job requirements, the score updates with sub-100ms latency.
- **Actionable Alternatives**: Suggests neutral replacements (e.g. replaces *"ninja"* with *"experienced engineer"*).

### 2. Interactive Trust & Bias Demo
- Embedded directly into the landing page.
- Users can toggle between **Pre-loaded Samples** (Biased vs. Neutral JDs) or paste their own copy.
- Visual breakdown:
  - **Overall Neutrality Score** (0–100 scale).
  - **Category Gauges**: Gender, Age, and Exclusionary meters.
  - **Annotated Text Preview**: Color-highlighted problem phrases with click-to-replace recommendations.

### 3. Blind Screening & Demographic PII Cloaking
- **Automatic Marker Detection**:
  - Emails: Regex pattern matching and replacement with `[REDACTED_EMAIL]`.
  - Phone numbers: International and local formatting stripped.
  - Physical addresses & ZIP codes: Masked to prevent zip-code-based demographic assumptions.
  - Gendered pronouns: Converted to neutral terms (`[THEY/THEM]`).
  - Social & Portfolio Links: Stripped of personal vanity usernames.
- **Pseudonymous Identification**: Each candidate receives an immutable identifier (e.g., `CAND-E82B`) and a cloaked avatar.

### 4. Sandboxed Code Execution & Skill Assessment
- **Zero Client-Side Leaks**: Answer keys (`correct` option indices) are stripped on the server before transmitting questions.
- **Isolated Node.js `vm` Sandbox**:
  - 3000ms strict execution timeout.
  - Stripped global access (`process`, `fs`, `child_process`, and network access are nullified).
  - Public test cases run for developer feedback; hidden test cases execute upon final submission.
- **Autosave Protection**: Candidate MCQ and Aptitude selections autosave every 30 seconds to MongoDB / SQLite.

### 5. Blind Recruiter Evaluation & Decision Logging
- Recruiters see technical capability, code efficiency, and skill matches without demographic context.
- **Human In the Loop**: AI never makes automated rejection or hiring decisions. It provides scores and evidence; human recruiters must submit:
  - **Outcome**: `Advance`, `Hold`, or `Decline`.
  - **Mandatory Justification**: At least 10 characters explaining the objective rationale.
  - **Identity Reveal Logging**: If a recruiter unmasks identity for interview scheduling, an audit log entry is recorded with timestamp and reason.

### 6. Multi-Tenant Employer Onboarding & Admin Workflow
- Self-service employer registration with email domain validation.
- Administrative review queue allows platform administrators to approve verified organizations.
- Secure single-use invitation tokens generate credentials for corporate recruiter seats.

### 7. EEOC, GDPR & Algorithmic Audit Trail
- **7 Monitored Categories**:
  1. `redaction_coverage`: Audit of redacted PII categories.
  2. `resume_readability`: Verification that skills remain intelligible after cloaking.
  3. `question_language`: Regular review of question neutrality.
  4. `assessment_consistency`: Ensures consistent rubrics and time limits across cohorts.
  5. `access_control`: Logs every profile view and unmasking event.
  6. `result_traceability`: Mathematical derivation of composite scores.
  7. `outcome_monitoring`: Demographic neutral aggregate distribution.
- **Audit Disclaimers**: Explicitly states that process checks do not replace qualified legal compliance reviews.

---

## 5. User Roles & Access Control Matrix

| Capability / Route | Public / Guest | Candidate | Recruiter | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Landing & Trust Demo | ✅ | ✅ | ✅ | ✅ |
| View Public Job Listings | ✅ | ✅ | ✅ | ✅ |
| Submit Employer Request | ✅ | ❌ | ❌ | ❌ |
| Self-Register Account | ✅ (Candidate only) | ❌ | ❌ | ❌ |
| Upload & Redact Resume | ❌ | ✅ | ❌ | ❌ |
| Take MCQ & Coding Tests | ❌ | ✅ | ❌ | ❌ |
| View Own Results & Formula | ❌ | ✅ | ❌ | ❌ |
| Author Jobs with Live Bias Meter | ❌ | ❌ | ✅ | ✅ |
| View Anonymized Candidate Pool | ❌ | ❌ | ✅ | ✅ |
| Submit Blind Hiring Decision | ❌ | ❌ | ✅ | ✅ |
| Approve Employer Applications | ❌ | ❌ | ❌ | ✅ |
| View Full System Audit Trail | ❌ | ❌ | ✅ (Limited) | ✅ (Full) |
| Provision Recruiter Accounts | ❌ | ❌ | ❌ | ✅ |

---

## 6. API Endpoints & WebSocket Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Candidate registration (bcrypt hash, JWT issue).
- `POST /api/auth/login` — Account sign-in (rate-limited, generic error protection).
- `GET /api/auth/me` — Return authenticated user profile.
- `POST /api/auth/provision` — Admin-only recruiter provisioning.

### Real-Time Bias & Jobs (`/api/bias`, `/api/jobs`)
- `POST /api/bias/scan` — Proxy call to Python AI microservice for deep bias scan.
- `GET /api/jobs` — Retrieve active public job listings.
- `POST /api/jobs` — Create new job listing (includes bias validation guard).
- `WS /ws/bias-score` — WebSocket streaming bias feedback as text is typed.

### Resume & Applications (`/api/resume`, `/api/applications`)
- `POST /api/resume/upload` — Multipart PDF/DOCX upload, regex PII cloaking, skill extraction.
- `GET /api/resume/profile/:refId` — Get anonymized candidate profile.
- `POST /api/resume/confirm/:refId` — Candidate confirmation of redactions.
- `POST /api/applications` — Submit application to a specific job opening.

### Assessment Engine (`/api/assessment`, `/api/tests`)
- `POST /api/assessment/start` — Initialize assessment and return sanitized questions.
- `PUT /api/assessment/:id/answers` — Autosave current question answers.
- `POST /api/assessment/:id/code-run` — Execute code against test cases in `vm` sandbox.
- `POST /api/assessment/:id/submit` — Final submission and deterministic composite scoring.
- `GET /api/assessment/results/me` — Retrieve candidate's score breakdown.

### Recruiter & Audit (`/api/recruiter`, `/api/audit`)
- `GET /api/recruiter/candidates` — Anonymized pool (demographics stripped).
- `GET /api/recruiter/candidates/:refId` — Detailed blind assessment results.
- `POST /api/recruiter/reviews` — Record human review outcome and rationale.
- `GET /api/audit/my` — Candidate-facing audit log.
- `GET /api/audit/:candidateRef` — Administrative compliance audit trail.

---

## 7. Quick Start & Verification

### Running All 3 Services

1. **Start Backend API (Port 5000)**:
   ```bash
   cd backend
   node src/index.js
   ```

2. **Start AI Microservice (Port 8000)**:
   ```bash
   cd ai-service
   uvicorn main:app --port 8000
   ```

3. **Start Frontend Web App (Port 5173)**:
   ```bash
   cd Frontend
   npm run dev
   ```

### Default Credentials for Testing
- **Admin Portal**: `admin@fairhire.io` / `password123` (or `admin@equihire.demo` / `Admin@12345!`)
- **Recruiter**: `recruiter@equihire.demo` / `Recruit@12345!`
- **Candidate**: `candidate@equihire.demo` / `Candidate@12345!`
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend API Dashboard**: [http://localhost:5000](http://localhost:5000)
- **Main Web Application**: [http://localhost:5173](http://localhost:5173)
