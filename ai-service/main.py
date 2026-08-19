"""
AI Hiring Bias Detector — Python AI Microservice
FastAPI entrypoint wiring all AI capabilities.
Phase 1: Bias detection (MOCK keyword classifier) + JD Skill Profiler active.
Phase 2: Resume scan + anonymiser active.
Phase 3: Test generation + auto-grading active.
Phase 4: Eligibility Engine active.
"""

import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# ─── Phase 1: Real services ───────────────────────────────────────────────────
from services.bias_detector import bias_detector
from services.skill_profiler import extract_skill_profile

# ─── Phase 2: Resume parser + anonymiser ─────────────────────────────────────
from services.resume_parser import extract_text_from_bytes, anonymise_text, extract_metadata

# ─── Phase 3: Test generator + grader ────────────────────────────────────────
from services.test_generator import generate_questions
from services.grader import grade

# ─── Phase 4: Eligibility engine ───────────────────────────────────────────
from services.eligibility_engine import compute_verdict

# ─── Phase 5: Chatbot service ──────────────────────────────────────────────
from services.chatbot_service import generate_chat_reply

app = FastAPI(
    title="AI Hiring Bias Detector — AI Service",
    description="Python microservice handling bias detection, test generation, grading, eligibility decisions, and interactive chatbot.",
    version="0.6.0",
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
    llm_confidence: float = 1.0   # Phase 4: pass grader confidence to adjust thresholds


class BiasAnalysisResponse(BaseModel):
    score: float
    flags: list
    explanation: str
    model_version: str = "stub-v0"


class EligibilityResponse(BaseModel):
    verdict: str
    explanation: str
    model_version: str = "stub-v0"


class ChatbotMessageRequest(BaseModel):
    role: str = "candidate"
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None
    context: Optional[Dict[str, Any]] = None


class ChatbotMessageResponse(BaseModel):
    reply: str
    suggestions: List[str]
    model_version: str


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "hiring-bias-ai-service",
        "phase": "5 — Bias + Skill profiler + Resume parser + Test generator + Grader + Eligibility + Chatbot active",
        "version": "0.6.0",
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


# ─── Phase 2 ACTIVE: Resume Analysis (parse + anonymise + bias scan) ────────────────
@app.post("/analyze/resume")
async def analyze_resume(file: UploadFile = File(...), application_id: str = Form(...)):
    """
    Phase 2 ACTIVE:
    1. Extract text from PDF/DOCX/TXT
    2. Anonymise PII (strip name, email, phone, address, etc.)
    3. Run bias detection on anonymised text
    Returns anonymised_text, bias_result, metadata for storage in backend.
    """
    if not file.filename:
        raise HTTPException(status_code=422, detail="No file provided")

    allowed_types = [".pdf", ".docx", ".txt"]
    suffix = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if suffix not in allowed_types:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{suffix}'. Allowed: {', '.join(allowed_types)}"
        )

    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=413, detail="File too large. Max 5MB.")

    # Step 1: Extract text
    raw_text = extract_text_from_bytes(file_bytes, file.filename)
    if not raw_text or len(raw_text.strip()) < 20:
        raise HTTPException(status_code=422, detail="Could not extract readable text from the resume. Try a .txt or .docx file.")

    # Step 2: Anonymise PII
    anon_result = anonymise_text(raw_text)
    anonymised_text = anon_result["anonymised_text"]

    # Step 3: Bias scan on anonymised text
    bias_result = bias_detector.detect(anonymised_text)

    # Step 4: Extract metadata
    metadata = extract_metadata(raw_text)

    return {
        "application_id": application_id,
        "anonymised_text": anonymised_text,
        "redacted_fields": anon_result["redacted_fields"],
        "bias_score": bias_result["score"],
        "bias_flags": bias_result["flags"],
        "bias_explanation": bias_result["explanation"],
        "metadata": metadata,
        "model_version": "mock-v2",
    }


@app.post("/analyze/resume/text")
async def analyze_resume_text(req: ResumeAnalyzeRequest):
    """
    Alternate endpoint: takes pre-extracted text (for testing without a file upload).
    """
    anon_result = anonymise_text(req.resume_text)
    bias_result = bias_detector.detect(anon_result["anonymised_text"])
    return {
        "application_id": req.application_id,
        "anonymised_text": anon_result["anonymised_text"],
        "redacted_fields": anon_result["redacted_fields"],
        "bias_score": bias_result["score"],
        "bias_flags": bias_result["flags"],
        "bias_explanation": bias_result["explanation"],
        "model_version": "mock-v2",
    }


# ─── Phase 3 ACTIVE: Test Generation ────────────────────────────────────────
@app.post("/generate/test")
def generate_test(req: TestGenerateRequest):
    """
    Phase 3 ACTIVE:
    Generates MCQ + short-answer questions from the JD skill profile.
    Uses Claude API if ANTHROPIC_API_KEY is set, else uses smart MOCK generator.
    IMPORTANT: correct_index and rubric_keywords are returned here for server-side
    storage; the backend MUST strip them before sending questions to candidates.
    """
    if not req.skill_profile:
        raise HTTPException(status_code=422, detail="skill_profile is required for test generation")

    result = generate_questions(
        skill_profile=req.skill_profile,
        num_mcq=req.num_mcq,
        num_short_answer=req.num_short_answer,
    )

    return {
        "job_id": req.job_id,
        "questions": result["questions"],
        "num_mcq": result["num_mcq"],
        "num_short_answer": result["num_short_answer"],
        "topics_covered": result["topics_covered"],
        "model_version": result["model_version"],
    }


# ─── Phase 3 ACTIVE: Auto-Grading ────────────────────────────────────────────
@app.post("/grade")
def grade_submission(req: GradeRequest):
    """
    Phase 3 ACTIVE:
    Grades submitted answers against stored questions.
    MCQ: rule-based (correct_index comparison).
    Short-answer: MOCK rubric keyword matching.
    Returns auto_score (0-100), llm_confidence, and per-question breakdown.
    """
    if not req.questions or not req.answers:
        raise HTTPException(status_code=422, detail="questions and answers are required")

    result = grade(
        questions=req.questions,
        answers=req.answers,
    )

    return {
        "test_id": req.test_id,
        "auto_score": result["auto_score"],
        "llm_confidence": result["llm_confidence"],
        "breakdown": result["breakdown"],
        "model_version": "mock-grader-v1",
    }


# ─── Phase 4 ACTIVE: Eligibility Engine ──────────────────────────────────────────
@app.post("/eligibility", response_model=EligibilityResponse)
def compute_eligibility(req: EligibilityRequest):
    """
    Phase 4 ACTIVE:
    Computes eligibility verdict from objective signals only.
    NEVER uses demographic signals (name, age, gender, address, etc.).
    Returns: eligible | not_eligible | needs_review + plain-English explanation.
    """
    result = compute_verdict(
        test_score=req.test_score,
        resume_skill_match=req.resume_skill_match,
        llm_confidence=req.llm_confidence,
        application_id=req.application_id,
    )
    return EligibilityResponse(
        verdict=result["verdict"],
        explanation=result["explanation"],
        model_version=result["model_version"],
    )


# ─── Phase 5 ACTIVE: Interactive AI Chatbot ──────────────────────────────────
@app.post("/chatbot/message", response_model=ChatbotMessageResponse)
def chatbot_message(req: ChatbotMessageRequest):
    """
    Phase 5 ACTIVE:
    Contextual, fair hiring assistant for candidates and recruiters.
    Provides transparent explanations, bias recommendations, and policy guidance.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=422, detail="message is required")

    result = generate_chat_reply(
        role=req.role,
        message=req.message.strip(),
        conversation_history=req.conversation_history,
        context=req.context,
    )
    return ChatbotMessageResponse(
        reply=result["reply"],
        suggestions=result.get("suggestions", []),
        model_version=result.get("model_version", "rule-v1"),
    )
