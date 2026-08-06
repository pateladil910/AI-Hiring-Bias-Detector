"""
AI Hiring Bias Detector — Python AI Microservice
FastAPI entrypoint wiring all AI capabilities.
Phase 1: Bias detection (MOCK keyword classifier) + JD Skill Profiler active.
Phase 2+: Resume scan, Test generation, Grading, Eligibility stubs remain.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# ─── Phase 1: Real services ───────────────────────────────────────────────────
from services.bias_detector import bias_detector
from services.skill_profiler import extract_skill_profile

app = FastAPI(
    title="AI Hiring Bias Detector — AI Service",
    description="Python microservice handling bias detection, test generation, grading, and eligibility decisions.",
    version="0.2.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://backend:5000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ──────────────────────────────────────────────────────────────────
class JDAnalyzeRequest(BaseModel):
    jd_id: Optional[str] = None
    text: str


class JDAnalyzeResponse(BaseModel):
    score: float
    flags: List[Dict[str, Any]]
    flag_count: int
    explanation: str
    skill_profile: Dict[str, Any]
    model_version: str


class ResumeAnalyzeRequest(BaseModel):
    application_id: str
    resume_text: str
    anonymised: bool = True


class TestGenerateRequest(BaseModel):
    job_id: str
    skill_profile: dict
    num_mcq: int = 10
    num_short_answer: int = 2


class GradeRequest(BaseModel):
    test_id: str
    questions: list
    answers: list


class EligibilityRequest(BaseModel):
    application_id: str
    test_score: float
    resume_skill_match: float


class BiasAnalysisResponse(BaseModel):
    score: float
    flags: list
    explanation: str
    model_version: str = "stub-v0"


class EligibilityResponse(BaseModel):
    verdict: str
    explanation: str
    model_version: str = "stub-v0"


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "hiring-bias-ai-service",
        "phase": "1 — Bias detection (MOCK keyword) + Skill profiler active",
        "version": "0.2.0",
    }


# ─── Phase 1: JD Bias Analysis (ACTIVE — MOCK keyword classifier) ─────────────
@app.post("/analyze/jd", response_model=JDAnalyzeResponse)
def analyze_jd(req: JDAnalyzeRequest):
    """
    Phase 1 ACTIVE:
    - Bias detection: MOCK keyword/pattern classifier (replace with BERT in Phase 1.5)
    - Skill profiler: MOCK keyword extractor (replace with Claude API in Phase 1.5)
    """
    if not req.text or len(req.text.strip()) < 10:
        raise HTTPException(status_code=422, detail="JD text too short for analysis")

    # Run bias detection
    bias_result = bias_detector.detect(req.text)

    # Run skill profiling
    skill_profile = extract_skill_profile(req.text)

    return JDAnalyzeResponse(
        score=bias_result["score"],
        flags=bias_result["flags"],
        flag_count=bias_result["flag_count"],
        explanation=bias_result["explanation"],
        skill_profile=skill_profile,
        model_version=bias_result["model_version"],
    )


# ─── Phase 1: Quick Bias Score (for live typing WebSocket use) ────────────────
@app.post("/analyze/jd/quick")
def analyze_jd_quick(req: JDAnalyzeRequest):
    """
    Lightweight endpoint for live-typing bias score.
    Returns only score + flag count (no full flag details) for speed.
    """
    if not req.text or len(req.text.strip()) < 5:
        return {"score": 100.0, "flag_count": 0}

    result = bias_detector.detect(req.text)
    return {
        "score": result["score"],
        "flag_count": result["flag_count"],
    }


# ─── Phase 2 Stub: Resume Bias Scan ──────────────────────────────────────────
@app.post("/analyze/resume", response_model=BiasAnalysisResponse)
def analyze_resume(req: ResumeAnalyzeRequest):
    """STUB — Phase 2. Anonymised mode resume scanner."""
    return BiasAnalysisResponse(
        score=85.0,
        flags=[],
        explanation="STUB: No bias signals detected in anonymised resume.",
        model_version="stub-v0",
    )


# ─── Phase 3 Stub: Test Generation ───────────────────────────────────────────
@app.post("/generate/test")
def generate_test(req: TestGenerateRequest):
    """STUB — Phase 3. Claude API will generate MCQ + short answer from skill_profile."""
    return {
        "job_id": req.job_id,
        "questions": [
            {
                "id": "q1",
                "type": "mcq",
                "question": f"STUB: Field detected: {req.skill_profile.get('primary_field', 'general')}",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct": 0,
            }
        ],
        "model_version": "stub-v0",
    }


# ─── Phase 3 Stub: Auto-Grading ──────────────────────────────────────────────
@app.post("/grade")
def grade_submission(req: GradeRequest):
    """STUB — Phase 3."""
    return {
        "test_id": req.test_id,
        "auto_score": 80.0,
        "llm_confidence": 0.92,
        "breakdown": [],
        "model_version": "stub-v0",
    }


# ─── Phase 4 Stub: Eligibility Engine ────────────────────────────────────────
@app.post("/eligibility", response_model=EligibilityResponse)
def compute_eligibility(req: EligibilityRequest):
    """STUB — Phase 4. IMPORTANT: Never uses demographic signals."""
    if req.test_score >= 70 and req.resume_skill_match >= 0.6:
        verdict, explanation = "eligible", "STUB: Candidate meets test and skill match thresholds."
    elif req.test_score < 40:
        verdict, explanation = "not_eligible", "STUB: Test score below minimum threshold."
    else:
        verdict, explanation = "needs_review", "STUB: Borderline result — routed to recruiter."
    return EligibilityResponse(verdict=verdict, explanation=explanation, model_version="stub-v0")
