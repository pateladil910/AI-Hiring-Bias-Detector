# memory.md — Session & Context Tracker

Update this file at the **end of every work session** (yours or an AI coding assistant's). It's
the single source of truth for "what's done, what's next, what decisions were already made" —
so you never have to re-explain the project from scratch.

---

## Project Snapshot

- **Project:** AI Hiring Bias Detector & Fair Hiring Pipeline
- **Docs:** `prd.md` (scope) · `architecture.md` (stack/flow) · `rules.md` (standards) ·
  `phase_planning.md` (milestones) · `design.md` (UI system)
- **Current phase:** Phase 1 — JD Creation + Bias Scanner
- **Build type:** Full-stack student project (React.js + Node.js/Express + Python FastAPI AI microservice)
- **Stack change:** Switched from Next.js/FastAPI to React (Vite) + Node.js + Python AI microservice per user preference.

---

## Completed So Far
- [x] Phase 0 — Foundation complete
  - Docker Compose (5 services: postgres, redis, backend, ai-service, frontend)
  - Node.js/Express backend with JWT auth, RBAC, Sequelize models (9 tables), auth & jobs routes
  - Python FastAPI AI microservice with health check + 5 stub endpoints
  - React/Vite frontend with full design system (design.md tokens), React Router v6, role-based guards, AuthContext
  - Pages: Landing, Login, Register, Recruiter Dashboard, Candidate Status Tracker
  - Layouts: Recruiter sidebar (collapsible), Candidate top nav

## In Progress
- [ ] Phase 1 — JD Creation + Live Bias Scanner

## Next Up
- [ ] JD create/edit page with live-typing bias score (WebSocket)
- [ ] Bias detection service (BERT stub → real model)
- [ ] Inline flag + remediation suggestions (Claude API)
- [ ] JD Skill Profiler
- [ ] Publish JD → visible on candidate job list

---

## Key Decisions Log
*(append one line per decision so it's never re-litigated)*

- Using Claude API for remediation, test generation, and the chatbot agent; HuggingFace
  BERT/RoBERTa for bias classification — one generation provider, one classification provider.
- Eligibility Engine must never take demographic-adjacent fields as input (see `rules.md` §4).
- Borderline eligibility cases always route to human review — no silent auto-rejection
  (see `prd.md` §6).

## Open Questions / Blockers
- [ ] *(e.g. "need a labelled bias dataset or will start with a mocked classifier for Phase 1")*

## Session Log
| Date | What happened | Next step |
|---|---|---|
| *(fill in)* | *(fill in)* | *(fill in)* |

---

### How to use this file with an AI coding assistant
At the start of a new session, paste this file (or point the assistant to it) along with
`phase_planning.md` so it picks up exactly where you left off instead of re-planning the whole
project. At the end of the session, ask it to update the three sections above
(Completed / In Progress / Next Up) plus add a Session Log row.
