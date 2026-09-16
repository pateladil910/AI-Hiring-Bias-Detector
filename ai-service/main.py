"""
AI Hiring Bias Detector — Python AI Microservice (v2 Production Spec)
FastAPI entrypoint wiring all AI capabilities:
- Hybrid Bias Detection (Layer 1 Lexicon + Layer 2 LLM Deep Scan)
- Resume Parsing + Spacy PII Anonymizer
- Tailored Assessment Generator
- Rubric-Based Auto Grader
- Objective Eligibility Engine
- Context-Aware Chatbot
"""

import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# ─── Services ─────────────────────────────────────────────────────────────────
from services.bias_detector import bias_detector
from services.skill_profiler import extract_skill_profile
from services.resume_parser import extract_text_from_bytes, anonymise_text, extract_metadata
from services.test_generator import generate_questions
from services.grader import grade
from services.eligibility_engine import compute_verdict
from services.chatbot_service import generate_chat_reply

app = FastAPI(
    title="FairHire AI Microservice",
    description="Python microservice handling hybrid bias detection, blind resume anonymization, test generation, grading, and eligibility.",
    version="2.0.0",
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
    role_title: Optional[str] = None


class ScanBiasRequest(BaseModel):
    job_id: Optional[str] = None
    text: str
    role_title: Optional[str] = None


class ChatbotMessageRequest(BaseModel):
    role: str = "candidate"
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None
    context: Optional[Dict[str, Any]] = None


# ─── Root & Health Check ──────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
def root():
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FairHire AI Microservice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #09121a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
    .card { background: #0f1d2a; border: 1px solid #1e354a; border-radius: 16px; padding: 2.5rem; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .badge { background: #1e3a5f; color: #93c5fd; padding: 4px 12px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin-bottom: 1rem; }
    h1 { margin: 0 0 0.5rem; color: #fff; font-size: 1.8rem; }
    p { color: #94a3b8; line-height: 1.6; margin: 0.5rem 0 1.5rem; }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .btn { display: inline-block; background: #3b82f6; color: #ffffff; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 8px; transition: all 0.2s; }
    .btn:hover { background: #60a5fa; transform: translateY(-1px); }
    .btn-outline { background: transparent; color: #93c5fd; border: 1px solid #2563eb; }
    .btn-outline:hover { background: #1e3a5f; }
    .endpoints { border-top: 1px solid #1e354a; padding-top: 1.2rem; font-size: 0.9rem; }
    code { background: #071018; padding: 2px 6px; border-radius: 4px; color: #93c5fd; font-family: monospace; }
    ul { padding-left: 1.2rem; margin: 0.5rem 0 0; color: #94a3b8; }
    li { margin-bottom: 0.4rem; }
    a { color: #60a5fa; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">● AI Microservice Active</span>
    <h1>FairHire AI Microservice</h1>
    <p>FastAPI engine delivering hybrid bias detection, blind resume anonymization, and algorithmic fairness audits.</p>
    <div class="actions">
      <a class="btn" href="/docs">Open Swagger API Docs →</a>
      <a class="btn btn-outline" href="/health">View /health Status</a>
    </div>
    <div class="endpoints">
      <div style="color: #93c5fd; font-weight: 600; margin-bottom: 0.3rem;">Service Resources:</div>
      <ul>
        <li>Interactive Swagger UI: <a href="/docs"><code>/docs</code></a></li>
        <li>ReDoc Documentation: <a href="/redoc"><code>/redoc</code></a></li>
        <li>Health Check: <a href="/health"><code>/health</code></a></li>
        <li>Main Frontend: <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></li>
      </ul>
    </div>
  </div>
</body>
</html>"""


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "fairhire-ai-service",
        "version": "2.0.0",
        "hybrid_bias_engine": "active",
    }


# ─── Hybrid Bias Detection Endpoints (v2 Spec) ────────────────────────────────
@app.post("/scan-bias")
async def scan_bias_deep(req: ScanBiasRequest):
    """
    v2 Deep Scan REST endpoint:
    Executes Layer 1 Lexicon + Layer 2 LLM Analysis (if Anthropic key is set) + Layer 3 Score Merge.
    """
    if not req.text or len(req.text.strip()) < 5:
        return {
            "score": 100.0,
            "rating": "fair_and_inclusive",
            "flags": [],
            "structural_notes": [],
            "model": "lexicon-layer1",
        }

    result = await bias_detector.scan_deep(req.text, req.role_title)
    return result


@app.post("/analyze/jd")
async def analyze_jd(req: JDAnalyzeRequest):
    """
    Legacy and main JD analysis endpoint:
    Combines hybrid bias detection with technical skill profile extraction.
    """
    if not req.text or len(req.text.strip()) < 5:
        raise HTTPException(status_code=422, detail="JD text too short for analysis")

    bias_result = await bias_detector.scan_deep(req.text, req.role_title)
    skill_profile = extract_skill_profile(req.text)

    return {
        "score": bias_result["score"],
        "rating": bias_result["rating"],
        "flags": bias_result["flags"],
        "flag_count": bias_result["flag_count"],
        "structural_notes": bias_result.get("structural_notes", []),
        "explanation": f"Fairness score: {bias_result['score']}/100. {bias_result['flag_count']} bias flag(s) identified.",
        "skill_profile": skill_profile,
        "model_version": bias_result.get("model", "hybrid-v2"),
    }


@app.post("/analyze/jd/quick")
def analyze_jd_quick(req: JDAnalyzeRequest):
    """
    Layer 1 fast keystroke scanner for live WebSocket usage (<50ms).
    """
    if not req.text or len(req.text.strip()) < 5:
        return {"score": 100.0, "rating": "fair_and_inclusive", "flags": [], "flag_count": 0}

    return bias_detector.scan_lexicon(req.text)


# ─── Resume Analysis & Anonymization ──────────────────────────────────────────
@app.post("/analyze/resume")
async def analyze_resume(file: UploadFile = File(...), application_id: str = Form(...)):
    """
    1. Extract text from PDF/DOCX/TXT
    2. Anonymise PII (Name, Email, Phone, Location)
    3. Run bias check on anonymised text
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
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 5MB.")

    raw_text = extract_text_from_bytes(file_bytes, file.filename)
    if not raw_text or len(raw_text.strip()) < 20:
        raise HTTPException(status_code=422, detail="Could not extract readable text from resume.")

    anonymised_res = anonymise_text(raw_text)
    anonymised_text_str = anonymised_res.get("anonymised_text", raw_text) if isinstance(anonymised_res, dict) else anonymised_res
    metadata = extract_metadata(raw_text)
    bias_result = bias_detector.scan_lexicon(anonymised_text_str)

    return {
        "application_id": application_id,
        "raw_text_length": len(raw_text),
        "anonymised_text": anonymised_text_str,
        "redacted_fields": anonymised_res.get("redacted_fields", []) if isinstance(anonymised_res, dict) else [],
        "bias_result": bias_result,
        "metadata": metadata,
    }


@app.post("/analyze/resume/text")
def analyze_resume_text(req: Dict[str, Any]):
    """
    Direct text endpoint for resume anonymization and analysis.
    """
    resume_text = req.get("resume_text", "")
    application_id = req.get("application_id", "direct-scan")
    if not resume_text:
        raise HTTPException(status_code=422, detail="resume_text is required")

    anonymised_res = anonymise_text(resume_text)
    anonymised_text_str = anonymised_res.get("anonymised_text", resume_text) if isinstance(anonymised_res, dict) else anonymised_res
    metadata = extract_metadata(resume_text)
    bias_result = bias_detector.scan_lexicon(anonymised_text_str)

    return {
        "application_id": application_id,
        "raw_text_length": len(resume_text),
        "anonymised_text": anonymised_text_str,
        "redacted_fields": anonymised_res.get("redacted_fields", []) if isinstance(anonymised_res, dict) else [],
        "bias_result": bias_result,
        "metadata": metadata,
    }


# ─── Test Generation & Grading ───────────────────────────────────────────────
@app.post("/generate/test")
def generate_test(req: Dict[str, Any]):
    skill_profile = req.get("skill_profile", {})
    num_mcq = req.get("num_mcq", 8)
    num_short_answer = req.get("num_short_answer", req.get("num_short", 2))
    test_data = generate_questions(skill_profile, num_mcq=num_mcq, num_short_answer=num_short_answer)
    questions = test_data.get("questions", []) if isinstance(test_data, dict) else test_data
    return {
        "job_id": req.get("job_id"),
        "questions": questions,
        "question_count": len(questions),
        "topics_covered": test_data.get("topics_covered", []) if isinstance(test_data, dict) else [],
        "model_version": test_data.get("model_version", "mock-bank-v1") if isinstance(test_data, dict) else "mock-bank-v1",
    }


@app.post("/grade")
@app.post("/grade/test")
def grade_test(req: Dict[str, Any]):
    questions = req.get("questions", [])
    answers = req.get("answers", [])
    result = grade(questions, answers)
    return result


# ─── Eligibility Engine ───────────────────────────────────────────────────────
@app.post("/eligibility")
@app.post("/eligibility/evaluate")
def evaluate_eligibility(req: Dict[str, Any]):
    test_score = req.get("test_score", 0.0)
    resume_skill_match = req.get("resume_skill_match", 0.0)
    return compute_verdict(test_score, resume_skill_match)


# ─── AI Chatbot Assistant ────────────────────────────────────────────────────
@app.post("/chat")
@app.post("/chatbot/message")
def chat_endpoint(req: ChatbotMessageRequest):
    reply = generate_chat_reply(
        role=req.role,
        message=req.message,
        conversation_history=req.conversation_history or [],
        context=req.context or {}
    )
    return reply
