# phase_planning.md — Build Roadmap

Adapted from the original 8-week roadmap, extended to cover the aptitude test + eligibility +
chatbot pipeline. Sized for a student/duo build — each phase should end in a demoable state.

---

## Phase 0 — Foundation (Week 1)

- [ ] Repo scaffolding: `frontend/` (Next.js + TS + Tailwind + shadcn/ui), `backend/` (FastAPI)
- [ ] `docker-compose.yml`: Postgres, Redis, backend, frontend
- [ ] Auth: JWT login/register, roles (Admin, HR Lead, Recruiter, Compliance, Candidate)
- [ ] DB schema v1: `users`, `organisations`, `jobs`, `applications`
- [ ] Base layout + navigation for recruiter and candidate portals

**Demo at end of phase:** Login works for both a recruiter and a candidate account.

---

## Phase 1 — JD Creation + Bias Scanner (Week 2)

- [ ] JD create/edit page with live-typing bias score (WebSocket)
- [ ] Bias detection service: BERT token classifier (or a well-documented stubbed/mock model if
      training data isn't available yet — mark clearly as `MOCK` in code)
- [ ] Inline flag + remediation suggestions (Claude API)
- [ ] JD Skill Profiler: extract a structured skill/field tag from the JD (feeds Phase 3)
- [ ] Publish JD → visible on a public/candidate job list

**Demo:** Recruiter writes a biased JD, sees flags + score drop, accepts a rewrite, publishes.

---

## Phase 2 — Candidate Application + Resume Scanner (Week 3)

- [ ] Candidate-facing job listing + application form (resume upload)
- [ ] Resume parser (PDF/DOCX) → clean text + metadata
- [ ] Resume bias scanner in Anonymised Mode (strip name/photo/address before scoring)
- [ ] Application record created with status `applied`

**Demo:** Candidate applies to a job; resume is parsed and bias-scanned; application appears in
recruiter's applicant list.

---

## Phase 3 — Aptitude Test Engine (Week 4)

- [ ] Test Generator service: Claude API builds MCQ + short-answer test from the JD skill profile
- [ ] Candidate test-taking UI (timer, question navigation, autosave)
- [ ] Auto-grading: objective MCQs graded by rule; short answers graded via LLM rubric with a
      confidence score
- [ ] Test results stored with per-question breakdown

**Demo:** Candidate takes a generated test for a specific JD and gets an instant objective score.

---

## Phase 4 — AI Eligibility Engine + Human Review Queue (Week 5)

- [ ] Eligibility Engine: combines test score + resume-skill match → verdict
      (`Eligible` / `Not Eligible` / `Needs Review`)
- [ ] Explanation generator: plain-English reason attached to every verdict
- [ ] Recruiter review queue UI for `Needs Review` and full shortlist
- [ ] Override action: recruiter can flip a verdict, must enter a reason → written to audit log

**Demo:** A batch of test applications produces a ranked, explained shortlist; recruiter
overrides one verdict and the reason is visible in the audit trail.

---

## Phase 5 — AI Agent Chatbot (Week 6)

- [ ] Chatbot backend service using Claude API with tool-calling into existing endpoints
      (see `architecture.md` §6)
- [ ] Candidate-facing chat widget: FAQs, "where's my test link", explained result delivery
- [ ] Recruiter copilot chat: "summarize today's shortlist", "draft interview questions for X"
- [ ] Interview scheduling flow through the chatbot

**Demo:** A candidate asks the chatbot for their status and gets an explained answer; a recruiter
asks the chatbot to summarize the shortlist and gets a plain-language digest.

---

## Phase 6 — Dashboard, Reports & Audit Trail (Week 7)

- [ ] Executive dashboard: bias score trends, diversity funnel, department breakdown (charts)
- [ ] Audit trail viewer: filterable log of every AI verdict + every recruiter override
- [ ] PDF/CSV export of a bias/compliance-style report
- [ ] Heat-map visualisation for JD/resume text

**Demo:** Compliance-style view shows a full history of decisions and overrides for a job.

---

## Phase 7 — Polish, UI Pass & Deployment (Week 8)

- [ ] Full UI pass against `design.md` (spacing, color, typography consistency)
- [ ] Mobile-responsive check on all key screens
- [ ] Error/loading states audit across the app (per `rules.md` §6)
- [ ] Basic e2e test pass on the 3 critical flows
- [ ] Deploy: docker-compose on a single VM (or Railway/Render-style free-tier host) for demo

**Demo:** Full pipeline walkthrough, JD → apply → test → AI verdict → recruiter review →
chatbot-delivered result, on a deployed link — ready to present.

---

## Status Legend (update as you go)
- `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

> Keep `memory.md` updated at the end of every session with which checkboxes moved and what's
> next — that file is the single source of truth for "where did I leave off".
