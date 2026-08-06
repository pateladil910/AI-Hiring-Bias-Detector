# PRD — AI Hiring Bias Detector & Fair Hiring Pipeline

Version 2.0 · Extends the original "AI Hiring Bias Detector" blueprint into a full end‑to‑end
hiring platform: bias detection **+** an automated, explainable candidate pipeline
(JD → Apply → Aptitude Test → AI Eligibility Decision → Recruiter Review → Interview),
run by an AI agent chatbot that talks to both candidates and recruiters.

---

## 1. Product Vision

Build a fair, explainable, and largely self-driving hiring platform where:

- Every **job description** is scanned and cleaned of biased language before it goes live.
- Every **candidate** is screened on merit (skills + a field-specific aptitude test), not on
  name, photo, address, or other bias-triggering signals.
- An **AI decision layer** filters candidates into "Eligible" / "Not Eligible" / "Needs Human
  Review" with a full explanation for every call — never a silent black-box rejection.
- A **recruiter** stays in the loop as the final authority — the AI recommends, a human decides
  and can always override, with the override logged for audit.
- An **AI agent chatbot** handles the repetitive load automatically: guiding candidates through
  each step, answering FAQs, sending test links, nudging recruiters, and summarizing shortlists.

> One-line pitch: *"Post a fair JD, let AI screen and test candidates without bias, and let a
> recruiter make the final, explainable call — with a chatbot doing the busywork."*

---

## 2. Target Audience

| Persona | Who they are | What they need from the product |
|---|---|---|
| **Recruiter / HR Lead** | Posts jobs, reviews shortlists, makes hiring calls | Fast, unbiased shortlist; explanations for every AI flag; override control |
| **Compliance Officer** | Ensures hiring is legally defensible | Audit trail, EEOC/GDPR-style reporting, bias score history |
| **Candidate / Job Seeker** | Applies for a job, takes the aptitude test | Transparent process, fast feedback, no unexplained rejection |
| **Company Admin** | Manages org, seats, and integrations | User roles, billing, ATS integration, security |

*(This is a college project / portfolio build — "Enterprise" tier language from the original
roadmap is kept only as a design reference, not a real go-to-market requirement.)*

---

## 3. Core User Journey (New — the heart of v2.0)

```
Recruiter                Candidate                       AI Layer                  Recruiter
   |                          |                               |                          |
1. Create JD -----------> AI Bias Scan (live) ---------------->|                          |
   |                          |                               |                          |
   |                     2. Candidate applies                  |                          |
   |                          | Resume upload -----------------> AI Resume Bias Scan       |
   |                          |                               | (anonymised mode)         |
   |                          |                               |                          |
   |                     3. Aptitude Test                       |                          |
   |                          | AI auto-generates field-        |                          |
   |                          | specific test from JD skills -->| AI grades + scores       |
   |                          |                               |                          |
   |                     4. AI Eligibility Decision              |                          |
   |                          |<------------------------------- Eligible / Not / Review    |
   |                          |                               |                          |
   |                                                           5. Recruiter Dashboard ----->|
   |                                                              (AI shortlist +           |
   |                                                               explanations)            |
   |                                                                                        |
   |<------------------------------------------------------------------------------- 6. Recruiter decides
                                                                                            (approve / override, logged)
   |
7. AI Chatbot notifies candidate of result + next steps (interview / rejection reason)
```

### Step-by-step scope

1. **JD Creation**
   - Recruiter writes or pastes a JD.
   - Real-time bias score (0–100) + inline flags, same as original roadmap.
   - AI auto-tags the JD with a **skill/field profile** (e.g. "Frontend – React, 2 yrs") — this
     tag drives the aptitude test generator later.

2. **Candidate Application**
   - Candidate applies with resume (PDF/DOCX) + basic info.
   - Resume goes through the bias scanner in **Anonymised Mode** by default: name, photo, address,
     age-revealing dates stripped from what reviewers/AI see first.

3. **Aptitude Test (new)**
   - AI generates a **field-specific test** from the JD's skill profile (e.g. ECE/embedded,
     frontend, data, etc.) — MCQs + 1–2 short technical questions.
   - Candidate takes the test in-app, timed.
   - AI auto-grades objective questions instantly; short-answers scored by an LLM rubric with a
     confidence score.

4. **AI Eligibility Decision (new)**
   - A rules + ML layer combines: test score, resume-skill match, and bias-adjusted resume signal
     (never demographic signal) into one **Eligibility Verdict**:
     - ✅ **Eligible** → auto-advance to recruiter shortlist
     - ❌ **Not Eligible** → auto-notify candidate with a plain-English reason (never a raw score)
     - ⚠️ **Needs Human Review** → borderline cases always routed to a recruiter, never
       auto-rejected silently
   - Every verdict carries a SHAP-style explanation, same explainability spirit as the bias
     engine.

5. **Recruiter Review**
   - Recruiter dashboard shows the AI-ranked shortlist with reasons, not just scores.
   - Recruiter can approve, reject, or override any AI verdict — override requires a one-line
     justification, which is logged to the audit trail.

6. **Interview Scheduling**
   - Approved candidates move to interview; AI chatbot handles scheduling back-and-forth.

7. **AI Agent Chatbot (new, cross-cutting)**
   - **Candidate-facing:** answers FAQs about the role/process, sends the test link, reminds
     about deadlines, delivers results with an explanation, schedules interviews.
   - **Recruiter-facing:** summarizes the day's shortlist in plain language ("14 eligible, 3 need
     your review — here's why"), drafts interview questions from the JD, flags any bias risk it
     notices in recruiter notes.
   - Built as a conversational agent with tool-calling into the same APIs the dashboard uses
     (no separate "shadow" logic — the chatbot is a UI on top of the same eligibility engine).

---

## 4. Feature Scope

### 4.1 Carried over from original roadmap (bias detection core)
- Resume Bias Scanner, JD Bias Analyzer, Real-Time Bias Score, Comparative Benchmarking,
  AI Remediation Engine (rewrite suggestions)
- Executive Dashboard, Bias Trend Reports, Diversity Funnel Metrics, Audit Trail, Heat Map
- REST API, Document Upload (multi-format), Webhooks
- EEOC/GDPR-style compliance module, Explainability reports (SHAP/LIME-style)
- Anonymised Mode, Feedback Learning Loop

### 4.2 New in v2.0 — Pipeline & Automation
| # | Feature | Description |
|---|---|---|
| 1 | **JD Skill Profiler** | Extracts a structured skill/field tag from the JD to drive test generation |
| 2 | **Aptitude Test Generator** | AI builds a field-specific MCQ + short-answer test per JD |
| 3 | **Auto-Grading Engine** | Objective auto-grade + LLM-rubric grading for subjective answers |
| 4 | **AI Eligibility Engine** | Combines test + resume-skill-match + bias-safe signals into a verdict |
| 5 | **Human-in-the-loop Review Queue** | Borderline/ambiguous cases always routed to a recruiter |
| 6 | **Override & Audit Log** | Every recruiter override is logged with reason, timestamp, actor |
| 7 | **AI Agent Chatbot (candidate)** | Guides applicants end-to-end, answers questions, gives explained results |
| 8 | **AI Agent Chatbot (recruiter copilot)** | Summarizes shortlists, drafts interview Qs, flags bias in real time |
| 9 | **Candidate Status Tracker** | Applicant-facing page: Applied → Test → Decision → Interview |
| 10 | **Interview Scheduler** | Chatbot-driven slot booking between recruiter and candidate |

### 4.3 Explicitly out of scope (v1 build)
- Payment/billing (Stripe tiers) — kept as a design placeholder only
- Native mobile apps
- Multi-tenant enterprise SSO — a simple role-based auth is enough for the project
- Full ATS integrations (Workday/Greenhouse) — stub/mock connectors only, to demonstrate the
  architecture without needing real vendor contracts

---

## 5. Success Criteria (project-level, not company KPIs)

- A recruiter can create a JD, see a live bias score, and publish it.
- A candidate can apply, take an auto-generated aptitude test, and see a transparent result.
- The AI Eligibility Engine correctly explains *why* it made every verdict (no unexplained
  rejections).
- The chatbot can complete at least: FAQ answering, sending a test link, and delivering a result,
  without a human typing the message.
- Every AI decision and every recruiter override appears in the audit log.

---

## 6. Explainability & Fairness Principles (non-negotiable)

1. **No silent auto-rejection.** Borderline cases always go to a human.
2. **No demographic signal in scoring.** Only skill/test/resume-content signals are used —
   never name, photo, age, address, gender markers.
3. **Every AI verdict is explainable** in plain English, shown to both candidate and recruiter.
4. **Every override is logged** — who, when, why.
