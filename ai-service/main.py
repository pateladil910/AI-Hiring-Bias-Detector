"""
AI Hiring Bias Detector — Python AI Microservice
FastAPI entrypoint with route stubs for all AI capabilities.
Phase 0: Health check + stub responses only.
Phase 1+: Replace stubs with real model calls.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="AI Hiring Bias Detector — AI Service",
    description="Python microservice handling bias detection, test generation, grading, and eligibility decisions.",
    version="0.1.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://backend:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ──────────────────────────────────────────────────────────────────
class JDAnalyzeRequest(BaseModel):
    jd_id: str
    text: str


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
    # NOTE: demographic fields are explicitly excluded — see rules.md §4


class BiasAnalysisResponse(BaseModel):
    score: float  # 0–100, higher = less bias
    flags: list
    explanation: str
    model_version: str = "stub-v0"


class EligibilityResponse(BaseModel):
    verdict: str  # "eligible" | "not_eligible" | "needs_review"
    explanation: str
    model_version: str = "stub-v0"


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "hiring-bias-ai-service",
        "phase": "0 — stubs active, real models load in Phase 1",
    }


# ─── Phase 1 Stub: JD Bias Analysis ──────────────────────────────────────────
@app.post("/analyze/jd", response_model=BiasAnalysisResponse)
def analyze_jd(req: JDAnalyzeRequest):
    """
    STUB — Phase 1 will replace this with a real BERT/RoBERTa bias classifier.
    Returns a mock response so the Node.js backend can integrate and test the flow.
    """
    # TODO Phase 1: Run BERT token classifier on req.text
    return BiasAnalysisResponse(
        score=72.0,
        flags=[
            {"token": "rockstar", "type": "gendered_language", "suggestion": "highly skilled"},
            {"token": "ninja", "type": "exclusionary_slang", "suggestion": "expert"},
        ],
        explanation="STUB: 2 potentially biased terms detected. Score reflects mock output.",
        model_version="stub-v0",
    )


# ─── Phase 2 Stub: Resume Bias Scan ──────────────────────────────────────────
@app.post("/analyze/resume", response_model=BiasAnalysisResponse)
def analyze_resume(req: ResumeAnalyzeRequest):
    """
    STUB — Phase 2. Anonymised mode: name/photo/address stripped before this is called.
    """
    # TODO Phase 2: Run anonymised resume through bias classifier
    return BiasAnalysisResponse(
        score=85.0,
        flags=[],
        explanation="STUB: No bias signals detected in anonymised resume.",
        model_version="stub-v0",
    )


# ─── Phase 3 Stub: Test Generation ───────────────────────────────────────────
@app.post("/generate/test")
def generate_test(req: TestGenerateRequest):
    """
    STUB — Phase 3. Claude API will generate MCQ + short answer from skill_profile.
    """
    # TODO Phase 3: Call Claude API with skill_profile to generate test
    return {
        "job_id": req.job_id,
        "questions": [
            {
                "id": "q1",
                "type": "mcq",
                "question": "STUB: Which of the following is a JavaScript promise method?",
                "options": [".then()", ".go()", ".execute()", ".run()"],
                "correct": 0,
            }
        ],
        "model_version": "stub-v0",
    }


# ─── Phase 3 Stub: Auto-Grading ──────────────────────────────────────────────
@app.post("/grade")
def grade_submission(req: GradeRequest):
    """
    STUB — Phase 3. Rules engine for MCQ, LLM rubric for short answers.
    """
    # TODO Phase 3: Grade MCQs by rule; grade short answers via Claude rubric
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
    """
    STUB — Phase 4. Combines test_score + resume_skill_match into a verdict.
    IMPORTANT: Never uses demographic signals — only skill/test/resume-content fields.
    """
    # TODO Phase 4: Replace with real weighted scoring + SHAP explainability
    if req.test_score >= 70 and req.resume_skill_match >= 0.6:
        verdict = "eligible"
        explanation = "STUB: Candidate meets test and skill match thresholds."
    elif req.test_score < 40:
        verdict = "not_eligible"
        explanation = "STUB: Test score below minimum threshold."
    else:
        verdict = "needs_review"
        explanation = "STUB: Borderline result — routed to recruiter for human review."

    return EligibilityResponse(
        verdict=verdict,
        explanation=explanation,
        model_version="stub-v0",
    )
