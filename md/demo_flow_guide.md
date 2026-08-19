# FairHire — End-to-End Demo & Verification Flow Guide

> **Project:** AI-Powered Hiring Bias Detector & Unbiased Recruitment Pipeline  
> **Repository:** `pateladil910/AI-Hiring-Bias-Detector`  
> **Status:** All 8 Phases (0 to 7) Fully Implemented & Production-Ready.

---

## 🏗️ Architecture & Quick Start

### 1. Services & Ports
| Service | Technology | Port | Health Check |
|---|---|---|---|
| **Frontend** | React 18 + Vite + React Router v6 | `5173` | http://localhost:5173 |
| **Backend** | Node.js + Express 4 + Sequelize ORM + WS | `5000` | http://localhost:5000/health |
| **AI Microservice** | Python 3.11 + FastAPI + Uvicorn | `8000` | http://localhost:8000/health |
| **Database** | PostgreSQL 16 | `5432` | `hiring_bias_db` |
| **Cache / Queue** | Redis 7 | `6379` | — |

### 2. Running Locally (Manual Terminals)

```powershell
# Terminal 1 — AI Microservice
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Backend API & WebSocket
cd backend
npm install
npm run dev

# Terminal 3 — Frontend UI
cd Frontend
npm install
npm run dev
```

---

## 🎬 Step-by-Step End-to-End Demo Scenarios

---

### 🔹 Flow 1: Recruiter Creates Job & Live Bias Scanner (Phase 1)
1. Navigate to `http://localhost:5173/register` and create a **Recruiter** account (or login).
2. Click **"Post a Job"** (`/recruiter/jobs/new`).
3. In the Job Description editor, type intentionally biased keywords:
   - *"We are looking for an aggressive rockstar ninja developer who thrives in a dominant fast-paced environment. Native English speaker required."*
4. Observe the **Live Typing SVG Bias Score Ring** (powered by WebSocket) dynamically dropping below 60/100 and highlighting flags under Gendered and Cultural categories.
5. Edit text to inclusive phrasing:
   - *"We are seeking a collaborative Full Stack Developer with strong React, Node.js, and SQL proficiency to join our supportive engineering team."*
6. Observe score rising to **90+/100 (Safe / Green)**.
7. Click **"Run Full Analysis"** → Click **"Publish Job"**.

---

### 🔹 Flow 2: Candidate Discovers Job & Blind Resume Screening (Phase 2)
1. Logout or open an incognito window, then register/login as a **Candidate**.
2. Click **"Browse Jobs"** (`/candidate/jobs`).
3. Click **"Apply"** on the published Full Stack Developer job.
4. Upload a sample PDF/DOCX/TXT resume containing personal PII (e.g. John Doe, +1-555-0199, 123 Main St).
5. Submit application.
6. The AI parser extracts text, strips all PII (names, phone, email, address), scores resume bias, and stores anonymised profile.
7. Switch back to **Recruiter Portal** → **"Candidates"** (`/recruiter/candidates`).
8. Notice candidate is listed as **"Candidate #001"** with **ZERO personal demographic information exposed**.

---

### 🔹 Flow 3: Skill-Tailored Aptitude Test Assessment (Phase 3)
1. In the **Recruiter Candidates** page, click **"📋 Send Test"** next to Candidate #001.
2. The AI generator creates a tailored 10-question assessment (8 MCQs + 2 Short Answers) based on the JD's extracted skill profile (`react`, `node.js`, `sql`, `javascript`).
3. Switch to **Candidate Portal** → **"My Applications"** (`/candidate/status`).
4. Notice the purple alert **"Aptitude Test Available"** → Click **"Take Test →"** (`/candidate/test/:testId`).
5. Experience the test UI:
   - Active 30-minute countdown timer.
   - Question navigator dot matrix sidebar (answered / flagged / active).
   - MCQ selection with option pills (A / B / C / D).
   - Short-answer text areas with real-time character count.
6. Complete questions and click **"Submit Assessment"**.
7. Observe immediate animated SVG score results and breakdown.
8. Recruiter can click **"Results"** on the Candidates page to inspect detailed question-by-question scoring and rubric keyword match highlights.

---

### 🔹 Flow 4: Objective AI Eligibility & Human Review Queue (Phase 4)
1. In the **Recruiter Candidates** page, click **"⚡ Run Eligibility"** for the candidate.
2. The AI Eligibility Engine calculates the verdict using **ONLY objective signals** (Test Score + Resume Skill Match) with **0 demographic inputs**:
   - **`Eligible`**: Test Score ≥ 70% AND Skill Match ≥ 55%.
   - **`Needs Review`**: Borderline scores (40%–69%) → automatically routed to Human Review Queue.
   - **`Not Eligible`**: Test Score < 40%.
3. In **Candidate Portal** (`/candidate/status`), observe the transparent **AI Decision Explanation Card** showing the exact technical reasons.
4. If flagged as `Needs Review`, open **Recruiter Portal** → **"Review Queue"** (`/recruiter/review`):
   - Review anonymous candidate score bars and AI reasoning.
   - Click **"Approve as Eligible"** or **"Custom Override"**.
   - Input mandatory reason (min 10 characters) → Confirm.
   - An immutable record is immediately written to the PostgreSQL `audit_logs` table.

---

### 🔹 Flow 5: Interactive AI Hiring Assistant Chatbot (Phase 5)
1. On any page in either Recruiter or Candidate portal, click the floating **"FairHire AI"** widget at the bottom right.
2. For Candidates:
   - Click suggestion pills: *"How does blind screening work?"*, *"What is the aptitude test format?"*.
   - Ask open-ended questions about hiring transparency and test time limits.
3. For Recruiters:
   - Click suggestion pills: *"How does the JD bias scanner work?"*, *"How do I review borderline candidates?"*.
   - Ask for tips to make job descriptions more inclusive.
4. Experience session persistence, clean Markdown message formatting, and reset chat actions.

---

### 🔹 Flow 6: Compliance Audit Trail Explorer & Live Analytics (Phase 6)
1. Open **"Audit Trail"** (`/recruiter/audit`):
   - Inspect logged events (`ELIGIBILITY_OVERRIDDEN`, `ELIGIBILITY_COMPUTED`, `TEST_SUBMITTED`, `JOB_PUBLISHED`).
   - Use search and action dropdown filters.
   - Click **"View"** to inspect structured JSON payloads (previous vs new verdicts, test sub-scores, user roles).
   - Click **"Export CSV"** to download the official compliance audit report.
2. Open **"Dashboard"** (`/recruiter/dashboard`):
   - View live KPI cards calculated from real database records (Jobs Posted, Applications, Review Queue count, Avg Bias Score).
   - View interactive **Pipeline Stage Funnel** progress bars.
   - View **Recent Compliance Activity** feed.

---

## 🛡️ Core Fair Hiring Constraints Checklist
- [x] **Zero PII Exposure**: Recruiter views candidate skills and scores only.
- [x] **Zero Demographic Signals in AI Decisions**: Age, gender, ethnicity, address are excluded from prompt and eligibility computation.
- [x] **No Silent Auto-Rejections**: Borderline candidates route to human review with transparent explanations provided to applicants.
- [x] **Full Audit Traceability**: Every override, publication, and AI decision is recorded with user identity and justification.
