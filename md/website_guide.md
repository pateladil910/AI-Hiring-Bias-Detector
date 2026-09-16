# 🌐 FairHire v2 — Full Production Website Documentation & Architecture Blueprint

Please refer to the comprehensive primary production-grade website documentation at:
👉 [**`WEBSITE.md`**](file:///e:/SE/AI-Hiring-Bias-Detector/WEBSITE.md)

### Key Highlights in the v2 Production Specification:
1. **Hardened Role & Access Control:**
   - Public Candidate Registration (`/register/candidate`) vs Employer Access Vetting (`/employers/request-access`).
   - Work email domain verification and signed 72h single-use recruiter invite tokens.
   - Non-discoverable Admin review queue (`/admin/*`) returning 404 to unauthenticated requests.
2. **Rebuilt Split-Screen Login & Landing Visuals:**
   - 50/50 split layout with candid workplace imagery, dark gradient overlays, and floating trust cards.
   - Preserved dark color system (`#0B0F17`, `#131826`, `#262E42`, `#5B7FFF`, `#7C5CFF`).
   - "How Employers Get Access" 3-step vetting strip.
3. **AI-Based Bias Detector (Hybrid 3-Layer Engine):**
   - Layer 1: Keystroke Lexicon Scanner (<50ms, deterministic regex dictionary).
   - Layer 2: On-Demand LLM Analysis (1-3s, Claude with fixed JSON rubric).
   - Layer 3: Score Merge & Redis Cache (Caps, weights, SHA-256 diff hash logging).
4. **Updated Database Schema:**
   - New `ORGANIZATIONS` and `RECRUITER_REQUESTS` tables.
   - `USERS.email_verified` and `USERS.organization_id` foreign keys.
   - New audit actions: `RECRUITER_REQUEST_APPROVED`, `BIAS_SUGGESTION_ACCEPTED`, `BIAS_FLAG_DISMISSED`.
5. **Complete Page Connection Maps:**
   - Visual Mermaid navigation graphs for Public, Recruiter, Candidate, and Admin flows.
