# rules.md — Coding Standards & Guardrails

These rules apply to every file generated in this project (by you or by an AI coding assistant).
Keep them visible/pinned so an AI pair-programmer follows them consistently across sessions.

## 1. General Principles

- **Small, working increments.** Every phase in `phase_planning.md` should end with something
  runnable — never leave the app in a broken state between commits.
- **No silent failures.** Every API call, AI call, and DB query must handle its error case
  explicitly — no bare `except: pass` / empty `.catch(() => {})`.
- **Explainability is a first-class citizen.** Any AI output that affects a candidate (bias flag,
  test score, eligibility verdict) must be stored with a human-readable explanation string, not
  just a number.
- **Human override always possible.** No code path should hard-block a recruiter from overriding
  an AI verdict.

## 2. Frontend Rules (Next.js + TypeScript)

- Strict TypeScript (`strict: true`); no `any` unless justified with a comment.
- Server Components by default; use Client Components only where interactivity is needed
  (live score, chat widget, test timer).
- All API calls go through a single typed API client in `lib/api.ts` — no ad-hoc `fetch()` calls
  scattered across components.
- Loading and error states are mandatory for every data-fetching component (skeletons, not blank
  screens).
- No inline styles — Tailwind utility classes + tokens from `design.md` only.
- Component size limit: if a component exceeds ~200 lines, split it.

## 3. Backend Rules (FastAPI + Python)

- Pydantic schemas for every request/response — no raw dicts crossing the API boundary.
- Each service (`bias_detection.py`, `eligibility_engine.py`, etc.) is pure business logic with
  no direct DB access — DB access goes through a repository layer.
- All AI calls (Claude API, HuggingFace models) are wrapped in a retry-with-backoff helper and a
  timeout; a failed AI call must degrade gracefully (e.g. route to "Needs Review" instead of
  crashing the request).
- Long-running AI work (test generation, batch resume scans) goes through Celery — never block
  a request thread on a multi-second model call.
- Every write to `eligibility_verdicts` and every recruiter override writes a row to `audit_logs`
  in the same transaction — never as an afterthought.

## 4. AI / Prompting Rules

- All Claude prompts live in `backend/ml/prompts/` as versioned template files, not inline
  strings — makes it easy to track what prompt produced what output.
- Every AI-generated candidate-facing message (test result, rejection reason) must be reviewed
  against a "no unexplained rejection" checklist: does it say *why*?
- The Eligibility Engine must never use demographic-adjacent fields (name, address, age, photo)
  as model input — enforce this with a schema-level allowlist of fields the engine is permitted
  to read, not a manual reminder.
- Log the model/version used for every AI decision (`model_version` field) so verdicts are
  reproducible/auditable later.

## 5. Library / Dependency Limits

- Prefer the stack already chosen in `architecture.md` — don't add a new charting library, state
  manager, or ORM without a clear gap the current stack can't fill.
- Backend: FastAPI + SQLAlchemy + Pydantic + Celery + Redis. No second web framework.
- Frontend: Next.js + Tailwind + shadcn/ui + Recharts (or Chart.js — pick one, not both).
- One AI provider for generation (Claude API) + one for classification (HuggingFace
  BERT/RoBERTa) — don't mix in a third LLM provider without a documented reason.
- Avoid heavyweight infra (Kubernetes, Terraform, multi-cloud) — this is a student full-stack
  build; `docker-compose` is enough.

## 6. Error Handling Conventions

- Backend errors return a consistent shape: `{ "error": { "code": str, "message": str } }`.
- Frontend shows user-facing errors in plain language — never a raw stack trace or "undefined".
- AI-call failures (timeout, rate limit, malformed response) fall back to a safe default:
  - Bias scan fails → JD/resume marked "scan pending", never silently published unscanned.
  - Eligibility engine fails → application routed to "Needs Human Review", never auto-rejected.
- Validation errors (bad file type, oversized upload) are caught before hitting any AI service.

## 7. Git / Workflow Conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- One feature branch per phase-planning milestone.
- No direct commits to `main` — even solo, use PRs to keep a reviewable history (useful for a
  college project submission/demo too).

## 8. Testing Expectations

- Backend: pytest for every service function, especially `eligibility_engine.py` (test the
  Eligible / Not Eligible / Needs Review boundary conditions explicitly).
- Frontend: at least smoke tests for the three critical flows (JD create, candidate apply,
  recruiter review).
- Any bug fix in the eligibility or bias-scoring logic must add a regression test.
