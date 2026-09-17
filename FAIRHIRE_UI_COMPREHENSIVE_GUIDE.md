# FairHire & EquiHire AI — Master UI & Design System Specification

**Version 3.2.0 · Production Design System, Page Layouts, Component Directory & Interaction Manual**

---

## 📑 Table of Contents
1. [Design Philosophy & Algorithmic Fairness Principles](#1-design-philosophy--algorithmic-fairness-principles)
2. [Global Design System & CSS Token Architecture](#2-global-design-system--css-token-architecture)
3. [Navigation Architecture & Role-Based Shells](#3-navigation-architecture--role-based-shells)
4. [Candidate Experience Portal UI Specifications](#4-candidate-experience-portal-ui-specifications)
5. [Recruiter Hiring Suite UI Specifications](#5-recruiter-hiring-suite-ui-specifications)
6. [Enterprise Super-Admin Console UI Specifications](#6-enterprise-super-admin-console-ui-specifications)
7. [Public Onboarding & Shared System Pages](#7-public-onboarding--shared-system-pages)
8. [Interactive Widgets, Sandbox IDE & Real-Time Components](#8-interactive-widgets-sandbox-ide--real-time-components)
9. [Accessibility (WCAG 2.1 AA), Animations & Responsive Grids](#9-accessibility-wcag-21-aa-animations--responsive-grids)

---

## 1. Design Philosophy & Algorithmic Fairness Principles

FairHire / EquiHire AI is built around a single, foundational principle: **Eliminate unconscious bias by separating human demographics from technical competency evaluation**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FAIRHIRE FOUR PILLARS OF UI ETHICS                   │
├───────────────────┬───────────────────┬──────────────────┬─────────────┤
│ 1. Zero Demographic│ 2. Transparent    │ 3. Server-       │ 4. Candidate│
│    Exposure       │    Formulas       │    Authoritative │    Data     │
│ (PII Redaction)   │ (No Black Boxes)  │ (Anti-Tamper)    │    Rights   │
└───────────────────┴───────────────────┴──────────────────┴─────────────┘
```

1. **Demographic Masking**: The UI never exposes candidate real names, physical addresses, gender pronouns, phone numbers, or photographs to hiring panels during screening. Deterministic cloaked aliases (e.g. `Candidate #7A39`) are rendered everywhere.
2. **Transparent Mathematical Explanations**: Scores are never opaque AI "opinions". The UI always renders the exact weighted mathematical formula:
   $$\text{Composite Benchmark} = (\text{MCQ} \times 0.4) + (\text{Coding} \times 0.4) + (\text{Resume Match} \times 0.2)$$
3. **Server-Authoritative Timing & Integrity**: Countdown timers, autosaving, and code evaluations run in isolated sandboxes with server-synced expiration.
4. **Candidate Data Rights (GDPR / CCPA)**: The UI provides instant 1-click JSON data export and account erasure controls.

---

## 2. Global Design System & CSS Token Architecture

The application adopts an enterprise dark slate and emerald aesthetic (`Dark Slate / Emerald Glassmorphism`), engineered for high contrast, reduced visual fatigue, and crisp readability.

### A. Color Palette Tokens

```css
:root {
  /* Surface & Background */
  --color-bg: #0b1310;              /* Primary Deep Dark Slate Background */
  --color-surface: #121d18;         /* Card & Container Elevated Surface */
  --color-surface-hover: #182821;   /* Hover Surface Elevation */
  --color-border: #1e362c;          /* Muted Card & Table Border */
  --color-border-hover: #294c3e;    /* Interactive Element Focus Border */

  /* Primary Accent: Emerald / Mint */
  --color-primary: #10b981;         /* Emerald 500 - Brand Identity & Affirmations */
  --color-primary-hover: #059669;   /* Emerald 600 - Hover State */
  --color-primary-light: #34d399;   /* Emerald 400 - Badges & High Contrast Text */
  --color-primary-soft: rgba(16, 185, 129, 0.12); /* Translucent Pill Background */

  /* Secondary Accents: Ocean Blue & Violet */
  --color-blue: #38bdf8;            /* Sky Blue - Tests & Architecture Indicators */
  --color-blue-soft: rgba(56, 189, 248, 0.12);
  --color-purple: #a855f7;          /* Violet - Resume & Skills Matching */
  --color-purple-soft: rgba(168, 85, 247, 0.12);

  /* Status Colors */
  --color-success: #10b981;         /* Green - Passed, Confirmed, Online */
  --color-warning: #facc15;         /* Amber - Pending, In Review, Expiring */
  --color-error: #ef4444;           /* Red - Biased Flag, Test Failed, Suspended */

  /* Typography */
  --color-text-primary: #ffffff;    /* Pure White - Headings & Active Values */
  --color-text-secondary: #94a3b8;  /* Slate 400 - Body & Supporting Copy */
  --color-text-muted: #64748b;      /* Slate 500 - Labels, Hints, Timestamps */

  /* Radii & Shadows */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 25px rgba(16, 185, 129, 0.2);
}
```

### B. Typography Scale

* **Display 1** (`32px` / `800 Bold`): Landing hero headlines, final benchmark banners.
* **Heading 1** (`26px` / `800 Bold`): Section headers, candidate dashboard titles.
* **Heading 2** (`20px` / `700 Bold`): Card titles, stepper titles, modal headings.
* **Heading 3** (`16px` / `600 Semi-Bold`): Table headers, test questions, list items.
* **Body Regular** (`14px` / `400 Regular`): Descriptions, candidate instructions, notices.
* **Code / Monospace** (`13px` / `Consolas, Menlo`): Code sandbox, cloaked aliases (`#CAND-7A39`), formulas.
* **Micro Badge** (`11px` / `700 Bold`): Status pills, EEOC compliance tags, difficulty tags.

---

## 3. Navigation Architecture & Role-Based Shells

The frontend features 3 distinct shell layouts ensuring candidates, recruiters, and administrators have personalized, secure navigation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                             APP HEADER BAR                             │
├──────────────┬───────────────────────────────────────────┬─────────────┤
│  FairHire 🛡️ │  [Role-Specific Nav Links / Stepper]     │ 👤 User + 🚪│
└──────────────┴───────────────────────────────────────────┴─────────────┘
```

### 1. Candidate Portal Shell (`CandidateLayout.jsx`)
* **Header Components**:
  * **Brand**: `FairHire` logo + green `Candidate Portal` badge.
  * **7 Navigation Tabs**:
    1. 📊 **Dashboard** (`/candidate/dashboard`): 5-step journey stepper.
    2. 📄 **Resume & Redaction** (`/candidate/resume`): Upload & side-by-side PII masked preview.
    3. 🎯 **Assessments** (`/candidate/domain`): Domain track catalog & test launcher.
    4. 💼 **Browse Jobs** (`/candidate/jobs`): Active bias-scanned positions.
    5. 📁 **My Applications** (`/candidate/applications`): Submission progress tracker.
    6. 📅 **Interviews** (`/candidate/interviews`): Calendar slots & meeting video links.
    7. 👤 **Profile & Privacy** (`/candidate/profile`): Deterministic alias & GDPR export.
  * **Right Actions**: Live Cloaked Alias Pill (`Alias: CAND-XXXX`), notification bell with unread badge, sign-out button.

### 2. Recruiter Portal Shell (`RecruiterLayout.jsx`)
* **Header Components**:
  * **Brand**: `FairHire Enterprise` + blue `Recruiter Suite` badge.
  * **Navigation Tabs**:
    * 📊 **Dashboard**: Pipeline statistics and candidate conversion funnel.
    * 💼 **Jobs**: Create bias-scanned job postings.
    * 👥 **Candidates**: Blind candidate pool with filterable composite scores.
    * 📅 **Interviews**: Scheduled technical interview calendar.
    * 📈 **Analytics**: Demographic diversity & adverse impact ratio tracking.
    * 📜 **Audit Trail**: Verification log of all recruiter actions.

### 3. Super-Admin Console (`AdminDashboard.jsx`)
* **Header Components**:
  * **Brand**: `FairHire Internal Governance` + red `🔐 Super-Admin` badge.
  * **Live Multi-Tier Service Monitor**: Port 5000 REST API, Port 8000 AI Microservice, SQLite DB, WebSocket status.
  * **Quick Actions**: Broadcast Announcement Modal, Instant Data Refresh.
  * **Tabs**: Employer Access Queue, User Management, Job Listings, Security Audit Logs, System Config.

---

## 4. Candidate Experience Portal UI Specifications

### A. Candidate Dashboard (`/candidate/dashboard`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Welcome back, Alex!  [100% Demographic-Blind Evaluation Active]        │
│ [3 Applications]  [1 Scheduled Interview]  [Stage 03 Active]           │
├────────────────────────────────────────────────────────────────────────┤
│                      5-STAGE CANDIDATE STEPPER                         │
│  [Step 1: Resume] → [Step 2: Domain] → [Step 3: MCQ] → [Step 4: IDE] → │
│  ✓ Confirmed        ✓ Full Stack       ● 30m Timed     ○ Sandboxed     │
├──────────────────────────────────────┬─────────────────────────────────┤
│ OPEN VERIFIED ROLES                  │ BLIND HIRING PROTECTIONS        │
│ • Senior Full Stack (Score: 2.1)     │ ✓ PII Stripped before review    │
│ • Frontend Engineer (Score: 1.5)     │ ✓ Transparent weighted math     │
│ • AI/ML Systems Engineer (Score: 2.8)│ ✓ GDPR Data Portability rights  │
└──────────────────────────────────────┴─────────────────────────────────┘
```

* **Interactive Elements**:
  * **5-Stage Stepper Cards**: Cards display status badges (`Confirmed`, `Selected`, `Timed (30m)`, `Sandboxed`, `Pending Review`). Hovering lifts the card with green elevation shadow. Clicking routes directly to that active step.
  * **Verified Open Positions**: Direct "Apply Now" buttons triggering instant candidate profile linkage.
  * **Quick Action Links**: Direct routing to Interviews and GDPR controls.

---

### B. Resume Upload & PII Redaction Review (`/candidate/resume`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Stage 01: Resume Anonymization & Demographic Redaction                │
├────────────────────────────────────────────────────────────────────────┤
│ [DRAG & DROP OR FILE PICKER]                                           │
│ ☁️  Drop your PDF or DOCX resume here (Max 5MB)                         │
│ ✓ Selected: alex_resume.pdf (142 KB)                                   │
├────────────────────────────────────────────────────────────────────────┤
│ [x] Candidate Demographic Protection Consent:                          │
│     I consent to FairHire algorithmically parsing and redacting PII...  │
├────────────────────────────────────────────────────────────────────────┤
│                                  [Cancel]  [Upload & Scan PII →]       │
└────────────────────────────────────────────────────────────────────────┘
```

* **Side-by-Side Review Screen (`/candidate/resume/review`)**:
  * **Left Column**:
    * **Detected Markers Table**: Displays category (Name, Email, Phone, Address), count, and masked token example (`[REDACTED_EMAIL]`).
    * **Extracted Skills Tags**: Interactive chips showing verified competencies (e.g. `React`, `Node.js`, `SQL`, `TypeScript`).
  * **Right Column**:
    * **Terminal Preview Window**: Dark console preview (`#090f0c`) rendering the exact anonymized resume text that recruiters see.
  * **Action Bar**: "Confirm Anonymized Profile" (calls `/api/resume/confirm/:refId`) and "Proceed to Domain Selection".

---

### C. Domain Track Selection (`/candidate/domain`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Stage 02: Domain Assessment Track                                      │
├───────────────────────┬───────────────────────┬────────────────────────┤
│ FULL STACK ENGINEER   │ FRONTEND SPECIALIST   │ AI & MACHINE LEARNING  │
│ 5 MCQs + 1 Coding     │ 5 MCQs + 1 Coding     │ 5 MCQs + 1 Coding      │
│ ⏱️ 30 Minutes          │ ⏱️ 30 Minutes          │ ⏱️ 30 Minutes           │
│ [React] [Node] [SQL]  │ [TypeScript] [CSS/a11y│ [Python] [PyTorch] [NER│
│ [● Selected]          │ [○ Select]            │ [○ Select]             │
├───────────────────────┴───────────────────────┴────────────────────────┤
│ [Ready to begin? Server timer starts upon confirmation]  [Start Test →]│
└────────────────────────────────────────────────────────────────────────┘
```

* **Track Features**:
  * Visual green radio ring indicates selected track.
  * Duration, test structure, and required skill chips provided for each domain.
  * Server-authoritative start button initializes test record with `startedAt` and `expiresAt`.

---

### D. Timed MCQ Aptitude Assessment (`/candidate/assessment/:id`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Full Stack Engineering • Part 1 of 2              [Autosaved: 10:42 AM]│
│ Question 3 of 5        [ 1 ] [ 2 ] [ (3) ] [ 4 ] [ 5 ]   ⏱️ 28:14      │
├────────────────────────────────────────────────────────────────────────┤
│ What is the performance benefit of creating a B-Tree index on SQL?     │
│                                                                        │
│ ( ) Compresses database disk storage by 50%                           │
│ (●) Reduces search time complexity from O(N) scans to O(log N)         │
│ ( ) Prevents duplicate records from ever being inserted                │
│ ( ) Automatically encrypts table data at rest                          │
├────────────────────────────────────────────────────────────────────────┤
│ [← Previous]                              [Save & Next Question →]     │
└────────────────────────────────────────────────────────────────────────┘
```

* **UX Safeguards**:
  * **Pre-Test Instructions Modal**: Explains 30-min duration, autosave rules, and anti-cheat policies before the timer starts.
  * **Server Timer**: Large monospace countdown pill (`28:14`). Turns amber at $< 10$ minutes, red at $< 5$ minutes.
  * **Autosave Engine**: Automatically executes `PUT /api/assessment/:id/answers` every 30 seconds and upon question navigation.
  * **Question Carousel**: Numbers 1 through 5 highlight answered vs. unanswered state.
  * **Answer Protection**: Answer keys (`correctIndex`) are stripped server-side and never exist in client memory.

---

### E. Dual-Pane Coding Sandbox IDE (`/candidate/coding/:id`)

```
┌──────────────────────────────────────┬─────────────────────────────────┐
│ Stage 04: Coding Sandbox             │ solution.js   ● Autosave Active │
│ Valid Balanced Parentheses           ├─────────────────────────────────┤
├──────────────────────────────────────┤ function isValid(s) {           │
│ PROBLEM DESCRIPTION:                 │   const stack = [];             │
│ Write a function isValid(s) that     │   const map = { ')':'(' ... };  │
│ takes a string containing brackets   │   for (let char of s) { ... }   │
│ and returns true if balanced.        │   return stack.length === 0;    │
│                                      │ }                               │
│ SAMPLE CASES:                        ├─────────────────────────────────┤
│ Input: "()[]{}"  Expected: true      │ TERMINAL OUTPUT   [5/5 Passed ✓]│
│ Input: "([)]"    Expected: false     │ ✓ Test 1: Matching pair ()      │
│                                      │ ✓ Test 2: Multiple pairs ()[]{} │
├──────────────────────────────────────┼─────────────────────────────────┤
│ [Reset Code]                         │ [▶ Run Tests]  [Submit Test →]  │
└──────────────────────────────────────┴─────────────────────────────────┘
```

* **Engine Specifications**:
  * **Left Pane**: Problem description, input/output constraints, and sample test cases.
  * **Right Pane**: Monospace code editor with syntax indentation and line styling.
  * **Execution Sandbox**: Calls `POST /api/assessment/:id/code-run`. Runs code server-side inside an isolated Node.js `vm` sandbox with 3000ms timeout and zero network/filesystem permissions.
  * **Terminal Output**: Instant pass/fail badges with actual vs. expected results.
  * **Final Submit**: Submits both MCQs and code, grades dynamically, and routes to `/candidate/results/:id`.

---

### F. Transparent Score Card & Results Breakdown (`/candidate/results/:id`)

```
┌────────────────────────────────────────────────────────────────────────┐
│        🏆 ASSESSMENT COMPLETE — RECRUITER REVIEW PENDING               │
│                  FINAL COMPOSITE BENCHMARK: 96 / 100                   │
├────────────────────────────────────────────────────────────────────────┤
│ TRANSPARENT WEIGHTED SCORING FORMULA:                                  │
│ Composite Score = (MCQ × 0.4) + (Coding × 0.4) + (Resume Match × 0.2)  │
│                 = (100 × 0.4) + (100 × 0.4)   + (80 × 0.2)             │
│                 = 40.0        + 40.0          + 16.0 = 96 / 100        │
├─────────────────────┬─────────────────────┬────────────────────────────┤
│ MCQ APTITUDE (40%)  │ CODING SANDBOX (40%)│ RESUME MATCH (20%)         │
│ 100% (40.0 pts)     │ 100% (40.0 pts)     │ 80% (16.0 pts)             │
│ 5/5 Questions Correct│ 5/5 VM Tests Passed │ Verified Competencies      │
└─────────────────────┴─────────────────────┴────────────────────────────┘
```

* **Transparency Elements**:
  * No hidden or non-deterministic rankings.
  * Visual cards breaking down each weighted component.
  * Direct routing to Applications and Interviews hubs.

---

### G. Candidate Interviews Hub (`/candidate/interviews`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ SCHEDULED TECHNICAL INTERVIEWS                                         │
├────────────────────────────────────────────────────────────────────────┤
│ Senior Full Stack Engineer • FairHire Partner Network                  │
│ Status: [ATTENDANCE CONFIRMED ✓]               [📹 Open Video Room →]  │
│                                                                        │
│ 📅 Date & Time: Sep 20, 2026 - 2:00 PM UTC     ⏱️ Duration: 45 Mins    │
│ 🛡️ Protocol: Blind Technical Panel (Evaluators unaware of demographics)│
│                                                                        │
│ Notes: Please ensure modern browser with camera & audio enabled.       │
│                                           [Request Reschedule ↺]       │
└────────────────────────────────────────────────────────────────────────┘
```

* **Actions**:
  * **Confirm Attendance**: Calls `POST /api/interviews/:id/confirm`. Updates interview status to `confirmed`.
  * **Request Reschedule**: Opens interactive modal to enter preferred slots or conflict details, updating status to `reschedule_requested`.
  * **Meeting Link**: Direct launch to Google Meet / secure video portal.

---

### H. Candidate Profile & Privacy Console (`/candidate/profile`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ CANDIDATE IDENTITY & DATA PRIVACY CONSOLE                              │
├────────────────────────────────────────────────────────────────────────┤
│ PUBLIC RECRUITER ALIAS: [CAND-8F3A2E]        [● Active Cloaking]       │
│ Contact Information: Alex Morgan • alex@example.com (Encrypted)        │
│ Verified Skills: [React] [Node.js] [TypeScript] [SQL] [Algorithms]     │
├────────────────────────────────────────────────────────────────────────┤
│ DATA RIGHTS & PORTABILITY (GDPR / CCPA)                                │
│                                                                        │
│ 📥 Download Complete Data Package (JSON)       [Export My Data]        │
│    Export full resume records, test scores, and audit activity.        │
│                                                                        │
│ 🗑️ Right to Erasure (Delete Account)           [Delete My Account]     │
│    Permanently scrub personal identifiers from FairHire database.      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Recruiter Hiring Suite UI Specifications

### A. Anonymized Candidate Pool (`/recruiter/candidates`)
* **Blind Candidate Table**:
  * Displays: Reference ID (`CAND-XXXX`), Domain, Status, Composite Score (`96/100`), Submission Date.
  * **Zero PII**: No names, email addresses, schools, or demographic markers.
* **Side-Drawer Candidate Detail Panel**:
  * Skills Evidence chips.
  * Composite Score breakdown (`MCQ: 100`, `Coding: 100`, `Resume: 80`).
  * Blind human review form: Advance, Hold, Decline, or Request Technical Interview.

### B. Pre-Publication Bias Detection Suite (`/recruiter/jobs/new`)
* **Real-Time Job Description Editor**:
  * Left side: Rich text input for Job Description.
  * Right side: Real-time bias scoring meter (connected to WebSocket `ws://localhost:5000/ws/bias-score`).
  * Live flag badges: Gender-coded language ("rockstar", "aggressive"), age indicators ("fresh graduate"), excessive prestige demands.
  * "Accept AI Neutral Suggestion" button replaces biased phrases with neutral alternatives.

---

## 6. Enterprise Super-Admin Console UI Specifications

### Modern Governance Dashboard (`/admin/dashboard`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🔐 FairHire Global Administration Portal        [Broadcast Notice] ↻  │
├────────────────────────────────────────────────────────────────────────┤
│ MULTI-TIER ARCHITECTURE HEALTH:                                        │
│ ● REST API: Port 5000   ● AI Service: Port 8000   ● SQLite DB: Synced  │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│ USERS: 4        │ JOBS: 4         │ TESTS: 1         │ QUEUE: 1        │
│ 2 Cand • 1 Rec  │ Avg Bias: 2.1/10│ Algorithmic Tests│ Awaiting Review │
├─────────────────┴─────────────────┴──────────────────┴─────────────────┤
│ [1. Employer Queue] [2. Users] [3. Jobs] [4. Audit Logs] [5. Config]   │
├────────────────────────────────────────────────────────────────────────┤
│ ENTERPRISE RECRUITER ACCESS REQUESTS:                                  │
│ Company: Code Vortex • Email: adilp@gmail.in • Size: 1-50 • Status: PEND│
│                                            [✓ Approve & Invite] [✗ Reject]│
└────────────────────────────────────────────────────────────────────────┘
```

* **Interactive Controls**:
  1. **Employer Access Queue**: Approve & issue 72h cryptographic tokens, or reject with audit notes.
  2. **User Directory**: View candidates and recruiters, toggle `Active/Suspended` state, or click `+ Provision Recruiter` to provision pre-verified accounts.
  3. **Job Postings Oversight**: Inspect bias scores across all companies; override job status to `Published` or `Closed`.
  4. **Audit Logs Stream**: Real-time event log with filters for `USER_REGISTERED`, `RESUME_ANONYMIZED`, `TEST_SUBMITTED`, `GDPR_EXPORT`.
  5. **System Configuration**: Inspect Node.js VM timeout (3000ms), NER lexicon versions, and EEOC 80% rule thresholds.
  6. **Broadcast Notice Modal**: Broadcast platform-wide maintenance or rubric update alerts to all accounts.

---

## 7. Public Onboarding & Shared System Pages

| Page Path | Title | Key UI Elements | Target Audience |
| :--- | :--- | :--- | :--- |
| `/` | Landing Page | Hero banner, live bias demo, 5-step workflow explanation, privacy guarantee | Public |
| `/login` | Role-Aware Sign In | Dual-tab login (Candidate vs Recruiter/Admin), demo credential helper | All Users |
| `/register-candidate` | Candidate Registration | Name, Email, Password with strength indicator (Candidate-only) | Candidates |
| `/employer-request` | Request Recruiter Access | Company name, work domain email, size, use-case description | Employers |
| `/accept-invite` | Accept Recruiter Invite | 72h token validation, password creation, workspace onboarding | Approved Recruiters |
| `/notifications` | Notification Feed | System updates, interview alerts, application advancement notifications | Authenticated Users |
| `/help` | FAQ & Help Center | Algorithmic fairness documentation, EEOC 80% rule explanation | Public / Users |
| `/privacy` | Privacy & GDPR | Data retention policy, encryption standards, right to erasure guide | Legal / Public |
| `/accessibility` | Accessibility Policy | WCAG 2.1 AA compliance statement, screen-reader shortcuts | Public |
| `/status` | System Health | Real-time service uptime, latency, incident history | Public |

---

## 8. Interactive Widgets, Sandbox IDE & Real-Time Components

### A. Floating AI Chatbot Widget (`ChatbotWidget.jsx`)
* Rendered in bottom-right corner across all authenticated layouts (`bottom: 24px, right: 24px`).
* Collapsible bubble with pulsing emerald badge.
* Role-adaptive conversational assistance:
  * For Candidates: Explains how PII redaction works, what to expect in assessments, and interview prep.
  * For Recruiters: Explains bias score calculations, EEOC adverse impact metrics, and anonymization laws.

### B. Node.js VM Code Runner
* In-browser JavaScript editor connected to `/api/assessment/:id/code-run`.
* Execution characteristics:
  * CPU execution limit: $3000\text{ ms}$.
  * Scope isolation: Zero `process`, `fs`, `http`, or `require` bindings.
  * Reports input, expected output, received output, execution time, and runtime errors.

### C. Live Real-Time Bias WebSocket (`ws://localhost:5000/ws/bias-score`)
* Listens to keystrokes on job descriptions.
* Debounced 400ms broadcast to AI microservice.
* Real-time stream pushing updated score ($0.0 - 10.0$), detected male/female-coded phrases, and suggested replacements.

---

## 9. Accessibility (WCAG 2.1 AA), Animations & Responsive Grids

### A. Accessibility Standards
1. **Focus Rings**: High-contrast outline on all interactive inputs:
   ```css
   *:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
   ```
2. **Accessible Contrast**: Text-to-background contrast ratio exceeds $7:1$ for normal text and $4.5:1$ for large text.
3. **Screen-Reader Labels**: Every icon button includes `title` and `aria-label`. Timers announce remaining time at 10m, 5m, and 1m intervals.
4. **Reduced Motion Support**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
   }
   ```

### B. Responsive Breakpoints
* **Mobile (`< 640px`)**: Single column layout, collapsed header menu, stacked dual-pane IDE.
* **Tablet (`640px - 1024px`)**: 2-column card grid, collapsible navigation, modal drawers.
* **Desktop (`> 1024px`)**: Full sticky header navigation, split-screen redaction preview, side-by-side IDE editor and test runner output.

---

*FairHire & EquiHire AI — Committed to Algorithmic Fairness, Transparent Merit Evaluation, and Demographic Neutrality.*
