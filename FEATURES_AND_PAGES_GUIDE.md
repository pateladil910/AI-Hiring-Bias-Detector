# FairHire & EquiHire AI — Features and Pages Comprehensive Guide

> **Version 3.0.0** · *Comprehensive Architecture, Feature Matrix, Page Workflow & API Manual*

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Multi-Tier System Architecture & Services](#2-multi-tier-system-architecture--services)
3. [Complete Pages Directory & User Workflows](#3-complete-pages-directory--user-workflows)
   - [A. Modern React Web Application (Port 5173)](#a-modern-react-web-application-port-5173)
   - [B. EquiHire Assessment & Evaluation Portal](#b-equihire-assessment--evaluation-portal)
   - [C. Shared, Legal & System Pages](#c-shared-legal--system-pages)
4. [Deep-Dive Feature Specifications](#4-deep-dive-feature-specifications)
5. [Data Model Overview](#5-data-model-overview)
6. [User Roles & Access Control Matrix](#6-user-roles--access-control-matrix)
7. [API Endpoints & WebSocket Reference](#7-api-endpoints--websocket-reference)
8. [Non-Functional Requirements & Compliance](#8-non-functional-requirements--compliance)
9. [Quick Start & Verification](#9-quick-start--verification)
10. [Page Count Summary](#10-page-count-summary)

---

## 1. Executive Summary

**FairHire / EquiHire AI** is an algorithmic fairness and demographic-neutral hiring platform. Traditional recruitment pipelines frequently introduce unconscious bias — screening out qualified talent due to names, gender pronouns, age indicators, location, or school prestige.

This platform replaces biased screening with:
- **Pre-Publication Bias Prevention** — Analyzes Job Descriptions (JDs) for gendered, exclusionary, or age-biased wording before jobs are published.
- **Blind Demographic Shield** — Redacts PII (Personally Identifiable Information) before human recruiters see applications.
- **Deterministic Technical Testing** — Evaluates candidates through timed MCQs and sandboxed JavaScript/Python code runners with test assertions.
- **Transparent Composite Scoring** — Replaces subjective ratings with mathematical scoring formulas visible to candidates.
- **Tamper-Evident Audit Trails** — Logs every decision, access event, and score modification for EEOC and GDPR accountability.
- **Closed-Loop Candidate Experience** — Notifications, interview scheduling, and results history keep candidates informed at every stage, without ever exposing recruiters to demographic signals.
- **Operational Visibility for Employers** — Analytics dashboards, billing/subscription management, and multi-tenant admin tooling so organizations can run the platform at scale.

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
│  • Notification Dispatcher         • Interview Scheduler               │
│  • Billing & Subscription Manager  • Analytics Aggregator              │
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
│  • Resume Parser & Ranking Model                                       │
│  • Interactive Swagger Docs: /docs                                     │
└────────────────────────────────────────────────────────────────────────┘
```

| Service | Port | URL | Health Check | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI** | `5173` | `http://localhost:5173` | `HTTP 200` | Modern React + Vite application |
| **Backend API** | `5000` | `http://localhost:5000` | `/health` | Express server, SQLite DB, WebSockets |
| **AI Microservice** | `8000` | `http://localhost:8000` | `/health` | FastAPI, PyTorch/regex bias engine |

### Tech Stack Summary
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router, TailwindCSS, Lucide Icons |
| **Backend** | Node.js, Express, Sequelize ORM, WebSocket (`ws`) |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **AI Microservice** | Python 3.11, FastAPI, spaCy, PyTorch, regex lexicons |
| **Auth** | JWT (access + refresh tokens), bcrypt password hashing |
| **File Storage** | Local disk (dev) / S3-compatible object storage (prod) |
| **Notifications**| In-app + SMTP email + WebSocket push |

---

## 3. Complete Pages Directory & User Workflows

### A. Modern React Web Application (Port 5173)

#### 1. Landing Page (`/`)
- **File**: `Frontend/src/pages/Landing.jsx` · **Access**: Public
- Displays the platform hero banner, core mission, and feature pillars.
- **Interactive Trust & Bias Demo**: Allows users to paste or select sample job descriptions (e.g. *"Aggressive Ninja Developer wanted"*) to watch real-time bias detection in action.
- **Live Bias Score Meter**: Computes masculine, feminine, ageist, and exclusionary bias scores with color-coded badges and alternative recommendations.
- **Direct CTAs**: Quick links to candidate registration, job listings, employer onboarding requests, and role-based login.

#### 2. Authentication & Login (`/login`)
- **File**: `Frontend/src/pages/Login.jsx` · **Access**: Public
- Unified credential login using JWT authentication.
- Supports role-based redirects: `admin` → `/admin/dashboard`, `recruiter` → `/recruiter/jobs`, `candidate` → `/jobs`.
- Prevents credential enumeration with generic error messaging.

#### 3. Forgot Password (`/forgot-password`)
- **File**: `Frontend/src/pages/ForgotPassword.jsx` · **Access**: Public
- Collects an account email and, without revealing whether it exists, sends a single-use reset link if a matching account is found.
- Rate-limited per IP and per email to block enumeration and brute-force attempts.

#### 4. Reset Password (`/reset-password`)
- **File**: `Frontend/src/pages/ResetPassword.jsx` · **Access**: Public with Reset Token
- Validates the `?token=...` query parameter, enforces password-strength rules, and invalidates the token after first use.
- Automatically expires unused reset links after 30 minutes.

#### 5. Candidate Registration (`/register-candidate`)
- **File**: `Frontend/src/pages/candidate/RegisterCandidate.jsx` · **Access**: Public
- Candidate onboarding form: First Name, Last Name, Email, Password, and Resume upload (PDF/DOCX).
- Sends a verification email (console or SMTP provider) and automatically stores an anonymized profile.

#### 6. Candidate Job Board (`/jobs`)
- **File**: `Frontend/src/pages/candidate/Jobs.jsx` · **Access**: Candidate / Public
- Lists approved and active job openings filtered by department, location, and employment type.
- Shows JD bias status (e.g. *"Bias-Scanned & EEOC Verified"*).
- Enables one-click application with candidate's cloaked profile.

#### 7. Job Detail Page (`/jobs/:id`)
- **File**: `Frontend/src/pages/candidate/JobDetail.jsx` · **Access**: Candidate / Public
- Full job description, responsibilities, and requirements, rendered from the bias-cleared version of the JD.
- Shows the company's neutrality badge and a plain-language summary of the assessment steps the candidate will go through.
- "Apply Now" CTA that carries the candidate straight into the assessment funnel.

#### 8. Candidate Application Tracker (`/applications`)
- **File**: `Frontend/src/pages/candidate/Applications.jsx` · **Access**: Candidate
- A single table of every job the candidate has applied to, with a status pill (Submitted, In Assessment, Under Review, Advanced, Declined).
- Deep-links into the relevant assessment or result page depending on current stage.

#### 9. Candidate Profile & Settings (`/profile`)
- **File**: `Frontend/src/pages/candidate/Profile.jsx` · **Access**: Candidate
- Update contact email, password, and notification preferences.
- Re-upload or replace resume, triggering a fresh redaction and skill-parse pass.
- Download or permanently delete personal data (GDPR data-portability and right-to-erasure support).

#### 10. Notifications Center (`/notifications`)
- **File**: `Frontend/src/pages/Notifications.jsx` · **Access**: Candidate / Recruiter / Admin
- Unified inbox for in-app notifications: application status changes, interview invites, new bias-scan results, and system announcements.
- Real-time updates over WebSocket, with a fallback poll every 60 seconds if the socket disconnects.
- Mark-as-read, filter by category, and jump straight to the related page.

#### 11. Employer Onboarding Request (`/employer-request`)
- **File**: `Frontend/src/pages/EmployerRequest.jsx` · **Access**: Public (Companies wishing to hire)
- Form capturing Company Name, Work Email, Contact Person, Company Size, and Hiring Volume.
- Enters the application into a `pending_review` queue for Super Admin approval.

#### 12. Super Admin Dashboard (`/admin/dashboard`)
- **File**: `Frontend/src/pages/admin/AdminDashboard.jsx` · **Access**: `admin` role only
- Employer Approval Queue: Review incoming employer requests, approve/reject them, and automatically send invitation tokens.
- System Metrics: Total active employers, live jobs, candidate pool volume, and system-wide bias reduction rate.
- User Management: View, provision, or deactivate recruiters and candidates.

#### 13. Admin Billing & Subscription (`/admin/billing`)
- **File**: `Frontend/src/pages/admin/Billing.jsx` · **Access**: `admin` role only
- Manage each employer's subscription tier (Starter, Growth, Enterprise), seat count, and renewal date.
- View invoice history and payment method status, and trigger manual plan upgrades or downgrades.
- Flags employers approaching their monthly assessment-volume cap.

#### 14. Admin Global Audit Explorer (`/admin/audit`)
- **File**: `Frontend/src/pages/admin/AuditExplorer.jsx` · **Access**: `admin` role only
- Organization-wide, cross-tenant view of the same audit trail recruiters see scoped to their own company.
- Supports export to CSV/PDF for compliance reviews and legal holds.

#### 15. Recruiter Job Creator (`/recruiter/jobs/create`)
- **File**: `Frontend/src/pages/recruiter/JobCreate.jsx` · **Access**: `recruiter` or `admin`
- Form to author job titles, departments, requirements, and full descriptions.
- **Real-Time WebSocket Bias Assistant**: As the recruiter types, the editor communicates over `ws://localhost:5000/ws/bias-score` or queries the AI microservice.
- **Flagged Phrase Highlighting**: Flags words like *"rockstar"*, *"digital native"*, *"aggressive"*, providing gender-neutral and age-inclusive substitutes.
- Blocks publishing if severe bias thresholds are exceeded.

#### 16. Recruiter Job Management (`/recruiter/jobs`)
- **File**: `Frontend/src/pages/recruiter/Jobs.jsx` · **Access**: `recruiter` or `admin`
- Manage existing job listings, review application count per job, inspect the job's bias score, and toggle active/closed status.

#### 17. Recruiter Candidates Blind Review (`/recruiter/candidates`)
- **File**: `Frontend/src/pages/recruiter/Candidates.jsx` · **Access**: `recruiter` or `admin`
- **Anonymized Candidate Grid**: Shows applicants with randomized identifiers (e.g. `CAND-4F2A`) and cloaked pseudonyms.
- Candidate names, universities, photos, age markers, and emails are completely hidden.
- Shows validated skill match percentages, technical assessment scores, and experience levels.
- **Human Decision Form**: Allows recruiters to advance, hold, or decline candidates while requiring an explicit justification note.

#### 18. Recruiter Interview Scheduler (`/recruiter/interviews`)
- **File**: `Frontend/src/pages/recruiter/Interviews.jsx` · **Access**: `recruiter` or `admin`
- Calendar view of upcoming interviews with drag-to-reschedule slots and panellist assignment.
- Sends candidates an interview invite (with a neutral, non-identifying interviewer list) and tracks acceptance status.
- Integrates with external calendars via `.ics` export; optional Google/Outlook calendar sync.

#### 19. Recruiter Analytics Dashboard (`/recruiter/analytics`)
- **File**: `Frontend/src/pages/recruiter/Analytics.jsx` · **Access**: `recruiter` or `admin`
- Funnel visualization from applications → assessments → shortlisted → hired, per job posting.
- Time-to-hire, average bias score of published JDs, and demographic-neutral outcome distribution charts.
- Exportable weekly/monthly hiring-health report.

#### 20. Audit Trail & Compliance Explorer (`/recruiter/audit`)
- **File**: `Frontend/src/pages/recruiter/AuditTrail.jsx` · **Access**: `recruiter` or `admin`
- Searchable, tamper-evident chronological event log.
- Tracks user logins, bias scans, profile redactions, recruiter reviews, and authorized identity reveals.
- Generates compliance reports ready for audit inspection.

#### 21. Email Verification (`/verify-email`)
- **File**: `Frontend/src/pages/VerifyEmail.jsx` · **Access**: Public with Token
- Validates `?token=...` query parameters to activate candidate and recruiter accounts.

#### 22. Employer Invite Acceptance (`/accept-invite`)
- **File**: `Frontend/src/pages/AcceptInvite.jsx` · **Access**: Public with Invite Token
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
| **Results History** | `results-history.html` | Candidate-facing archive of every past assessment attempt, with score trend and downloadable PDF summaries. |
| **Interview Scheduling** | `interview-schedule.html` | Lets a shortlisted candidate pick from recruiter-offered interview slots and confirm attendance. |
| **Recruiter Blind Portal** | `recruiter-dashboard.html` | Blind candidate pool table, domain/status filters, and human review form. |
| **Post-Assessment Feedback** | `feedback.html` | Optional short survey candidates fill out about the fairness and clarity of the assessment experience. |

---

### C. Shared, Legal & System Pages

| Page | Route / File | Access | Purpose |
| :--- | :--- | :--- | :--- |
| **Help & Support Center** | `/help` (`help.html`) | Public | Searchable FAQ, contact form, and status of open support tickets. |
| **Privacy Policy** | `/privacy` (`privacy.html`) | Public | Explains what data is collected, how PII redaction works, and data retention periods. |
| **Terms of Service** | `/terms` (`terms.html`) | Public | Platform usage terms for candidates, recruiters, and employer organizations. |
| **Accessibility Statement** | `/accessibility` (`accessibility.html`) | Public | WCAG 2.1 AA conformance summary and how to report accessibility issues. |
| **System Status** | `/status` (`status.html`) | Public | Live uptime indicator for the three services, plus incident history. |
| **404 Not Found** | `*` (catch-all route) | Public | Friendly not-found page with links back to the dashboard appropriate to the visitor's role. |
| **403 Forbidden** | Global error boundary | Authenticated | Shown when a logged-in user tries to reach a route outside their role's permissions. |
| **Session Expired** | Global auth interceptor | Authenticated | Prompts re-login when a JWT access token expires mid-session, preserving the page the user was on. |

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

### 8. Notification & Alert System
- Three delivery channels — in-app (Notifications Center), email (SMTP/console provider), and WebSocket push for real-time toasts.
- Event-driven: triggered by application status changes, interview invites/updates, new bias-scan completions, subscription/billing alerts, and admin announcements.
- Per-user notification preferences (`/profile`) let candidates and recruiters opt in or out of non-critical channels while critical security alerts (password reset, login from a new device) are always sent.

### 9. Interview Scheduling & Calendar Integration
- Recruiters propose one or more time slots; candidates confirm through either the React app or the Assessment Portal's `interview-schedule.html`.
- Automatic `.ics` calendar file generation, with optional two-way sync for Google Calendar and Outlook.
- Reminder notifications sent 24 hours and 1 hour before the scheduled interview.
- Reschedule and cancellation flows keep the audit trail updated with who changed what and when.

### 10. Analytics & Reporting Dashboard
- Recruiter- and admin-facing funnel analytics: applications → assessments started → assessments completed → shortlisted → interviewed → hired.
- Bias-reduction trend line showing the average JD neutrality score over time, per department and company-wide.
- Downloadable CSV/PDF hiring-health reports for leadership review.

### 11. Multi-Tenant Billing & Subscription Management
- Tiered plans (Starter, Growth, Enterprise) with seat limits and monthly assessment-volume caps.
- Self-service plan upgrade/downgrade for employer admins, with prorated billing.
- Usage alerts when an organization approaches its plan's assessment or seat limit.

### 12. Localization & Accessibility
- UI strings externalized for future multi-language support (English shipped by default).
- WCAG 2.1 AA target: keyboard navigability across all forms and the coding sandbox, ARIA labeling on interactive bias-gauge widgets, and minimum contrast ratios enforced in the design system.

### 13. Security & Rate Limiting
- JWT access + refresh token rotation, with refresh tokens stored as httpOnly cookies.
- Per-IP and per-account rate limiting on authentication, password-reset, and bias-scan endpoints to deter brute-force and scraping.
- All resume and profile file storage is access-controlled and served through signed, time-limited URLs rather than public paths.

### 14. Resume Parsing & Skill Vector Profiling
- AI microservice extracts structured skills, years of experience bands, and domain tags from uploaded resumes after PII redaction.
- Produces a skill-match percentage against a job's required and preferred skill tags, shown to recruiters instead of the raw resume text until an official identity reveal occurs.

---

## 5. Data Model Overview

| Entity | Purpose |
| :--- | :--- |
| **User** | Base identity record for Candidate, Recruiter, and Admin roles, with role-based permissions. |
| **Organization** | An employer tenant; owns Jobs, Recruiters, and a Subscription. |
| **Job** | A job posting, including raw and bias-cleared JD text, status, and neutrality score. |
| **Application** | Links a Candidate to a Job; tracks pipeline stage and outcome. |
| **Assessment** | An MCQ/coding test attempt tied to an Application, with autosaved answers and final composite score. |
| **Resume** | Uploaded file plus its parsed, redacted profile and skill vector. |
| **Interview** | A scheduled interview tied to an Application, with slot options, confirmation status, and panellists. |
| **Notification** | An event-driven message delivered to a User across one or more channels. |
| **AuditLog** | Immutable record of a sensitive action (login, scan, redaction, reveal, review, billing change). |
| **Subscription** | An Organization's plan tier, seat count, and billing cycle. |

---

## 6. User Roles & Access Control Matrix

| Capability / Route | Public / Guest | Candidate | Recruiter | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Landing & Trust Demo | ✅ | ✅ | ✅ | ✅ |
| View Public Job Listings & Job Detail | ✅ | ✅ | ✅ | ✅ |
| Submit Employer Request | ✅ | ❌ | ❌ | ❌ |
| Self-Register Account | ✅ (Candidate only) | ❌ | ❌ | ❌ |
| Reset Own Password | ✅ | ✅ | ✅ | ✅ |
| Upload & Redact Resume | ❌ | ✅ | ❌ | ❌ |
| Take MCQ & Coding Tests | ❌ | ✅ | ❌ | ❌ |
| View Own Results, History & Formula | ❌ | ✅ | ❌ | ❌ |
| Track Own Applications | ❌ | ✅ | ❌ | ❌ |
| Confirm Interview Slot | ❌ | ✅ | ❌ | ❌ |
| Manage Notification Preferences | ❌ | ✅ | ✅ | ✅ |
| Author Jobs with Live Bias Meter | ❌ | ❌ | ✅ | ✅ |
| View Anonymized Candidate Pool | ❌ | ❌ | ✅ | ✅ |
| Submit Blind Hiring Decision | ❌ | ❌ | ✅ | ✅ |
| Schedule / Manage Interviews | ❌ | ❌ | ✅ | ✅ |
| View Recruiter Analytics | ❌ | ❌ | ✅ | ✅ |
| Approve Employer Applications | ❌ | ❌ | ❌ | ✅ |
| Manage Billing & Subscriptions | ❌ | ❌ | ❌ | ✅ |
| View Full System Audit Trail | ❌ | ❌ | ✅ (Limited) | ✅ (Full) |
| Provision Recruiter Accounts | ❌ | ❌ | ❌ | ✅ |

---

## 7. API Endpoints & WebSocket Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Candidate registration (bcrypt hash, JWT issue).
- `POST /api/auth/login` — Account sign-in (rate-limited, generic error protection).
- `POST /api/auth/forgot-password` — Issues a single-use password-reset token via email.
- `POST /api/auth/reset-password` — Consumes a reset token and sets a new password.
- `GET /api/auth/me` — Return authenticated user profile.
- `POST /api/auth/provision` — Admin-only recruiter provisioning.

### Real-Time Bias & Jobs (`/api/bias`, `/api/jobs`)
- `POST /api/bias/scan` — Proxy call to Python AI microservice for deep bias scan.
- `GET /api/jobs` — Retrieve active public job listings.
- `GET /api/jobs/:id` — Retrieve a single job's bias-cleared detail view.
- `POST /api/jobs` — Create new job listing (includes bias validation guard).
- `WS /ws/bias-score` — WebSocket streaming bias feedback as text is typed.

### Resume & Applications (`/api/resume`, `/api/applications`)
- `POST /api/resume/upload` — Multipart PDF/DOCX upload, regex PII cloaking, skill extraction.
- `GET /api/resume/profile/:refId` — Get anonymized candidate profile.
- `POST /api/resume/confirm/:refId` — Candidate confirmation of redactions.
- `POST /api/applications` — Submit application to a specific job opening.
- `GET /api/applications/me` — Candidate's own application list with current stage.

### Assessment Engine (`/api/assessment`, `/api/tests`)
- `POST /api/assessment/start` — Initialize assessment and return sanitized questions.
- `PUT /api/assessment/:id/answers` — Autosave current question answers.
- `POST /api/assessment/:id/code-run` — Execute code against test cases in `vm` sandbox.
- `POST /api/assessment/:id/submit` — Final submission and deterministic composite scoring.
- `GET /api/assessment/results/me` — Retrieve candidate's score breakdown.
- `GET /api/assessment/results/history` — Retrieve candidate's full past-attempt history.

### Interviews & Notifications (`/api/interviews`, `/api/notifications`)
- `POST /api/interviews` — Recruiter proposes one or more interview slots for an application.
- `POST /api/interviews/:id/confirm` — Candidate confirms a proposed slot.
- `POST /api/interviews/:id/reschedule` — Either party requests a new time; logged to the audit trail.
- `GET /api/notifications/me` — Fetch the current user's notification inbox.
- `PUT /api/notifications/:id/read` — Mark a notification as read.
- `WS /ws/notifications` — Real-time push channel for new notifications.

### Recruiter & Audit (`/api/recruiter`, `/api/audit`)
- `GET /api/recruiter/candidates` — Anonymized pool (demographics stripped).
- `GET /api/recruiter/candidates/:refId` — Detailed blind assessment results.
- `POST /api/recruiter/reviews` — Record human review outcome and rationale.
- `GET /api/recruiter/analytics` — Funnel, time-to-hire, and neutrality-trend metrics.
- `GET /api/audit/my` — Candidate-facing audit log.
- `GET /api/audit/:candidateRef` — Administrative compliance audit trail.

### Billing & Admin (`/api/billing`, `/api/admin`)
- `GET /api/billing/subscription` — Retrieve the current organization's plan, seats, and usage.
- `POST /api/billing/subscription/change` — Upgrade or downgrade a plan tier.
- `GET /api/admin/employers/pending` — List employer requests awaiting approval.
- `POST /api/admin/employers/:id/approve` — Approve an employer and issue an invite token.

---

## 8. Non-Functional Requirements & Compliance

| Category | Requirement |
| :--- | :--- |
| **Performance** | Bias-score WebSocket updates return in under 100ms for typical JD lengths (< 2,000 characters). |
| **Availability** | Backend API and AI microservice target 99.5% monthly uptime, surfaced on the public `/status` page. |
| **Security** | JWT rotation, bcrypt password hashing, per-endpoint rate limiting, signed time-limited file URLs. |
| **Privacy** | PII redaction runs before any human recruiter view; data export and erasure supported for GDPR requests. |
| **Auditability** | Every scan, redaction, review, reveal, and billing change is written to an immutable audit log. |
| **Accessibility**| WCAG 2.1 AA target across all public and authenticated pages. |
| **Portability** | Candidate data exportable in a structured, machine-readable format on request. |

---

## 9. Quick Start & Verification

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

### Useful Links
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend API Dashboard**: [http://localhost:5000](http://localhost:5000)
- **Main Web Application**: [http://localhost:5173](http://localhost:5173)

---

## 10. Page Count Summary

| Suite | Pages |
| :--- | :---: |
| **A. React Web Application** | 22 |
| **B. EquiHire Assessment & Evaluation Portal** | 15 |
| **C. Shared, Legal & System Pages** | 8 |
| **Total** | **45** |
