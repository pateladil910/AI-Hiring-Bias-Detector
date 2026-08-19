"""
AI Hiring Bias Detector — Interactive Chatbot Service
Phase 5: Contextual AI assistant for candidates and recruiters.

Features:
  - Role-tailored conversational assistance (candidate vs recruiter).
  - Domain knowledge base:
      • Bias detection in JDs & inclusive rewrites
      • Blind screening & resume anonymization policies
      • Aptitude test rules, timing, and skill-tailored question structure
      • Objective eligibility thresholds (no demographic signals)
      • Recruiter review queue, human override standards, and audit trails
  - Smart keyword intent matching + optional Claude API integration when ANTHROPIC_API_KEY is available.
"""

import os
import json
from typing import List, Dict, Any, Optional

CANDIDATE_FAQS = [
    {
        "keywords": ["anonym", "blind", "pii", "personal", "privacy", "name", "photo"],
        "reply": (
            "🔒 **Blind Screening Policy:**\n\n"
            "When you submit your resume, our system automatically strips all personally identifiable "
            "information (PII) including your name, email, phone number, address, and demographic markers.\n\n"
            "Recruiters evaluate your application purely on your technical skills, work experience, and "
            "aptitude test results until you reach the final interview stage."
        ),
        "suggestions": ["How is the aptitude test scored?", "What do application statuses mean?", "How does fair hiring work?"]
    },
    {
        "keywords": ["test", "aptitude", "quiz", "mcq", "exam", "time", "duration", "limit", "short answer"],
        "reply": (
            "⏱️ **Aptitude Assessment Details:**\n\n"
            "• **Format:** 8 Multiple Choice Questions (MCQ) + 2 Short-Answer Questions tailored to the job's tech stack.\n"
            "• **Time Limit:** Exactly 30 minutes with an active countdown timer.\n"
            "• **Auto-Submit:** If time runs out, answers recorded so far are automatically submitted.\n"
            "• **Grading:** MCQs are rule-graded (0 or 100%). Short-answers are evaluated against technical concept rubrics."
        ),
        "suggestions": ["What happens after the test?", "What score do I need to pass?", "Can I retake the test?"]
    },
    {
        "keywords": ["status", "stages", "pipeline", "applied", "test_sent", "eligible", "needs_review", "rejected"],
        "reply": (
            "📋 **Application Pipeline Stages:**\n\n"
            "1. **Applied:** Resume uploaded, anonymised, and screened for technical skill tags.\n"
            "2. **Test Sent:** Aptitude test generated and available in your portal.\n"
            "3. **Test Completed:** Assessment submitted and auto-graded.\n"
            "4. **Eligible / Needs Review / Not Eligible:** Objective eligibility decision with a plain-English explanation.\n"
            "5. **Interview:** Recruiter schedules direct conversation for qualified candidates."
        ),
        "suggestions": ["Why is my application in review?", "How is eligibility decided?", "Do you give rejection reasons?"]
    },
    {
        "keywords": ["eligib", "pass", "score", "threshold", "decision", "criteria", "grade"],
        "reply": (
            "⚖️ **Fair Eligibility Evaluation:**\n\n"
            "Eligibility is calculated objectively from two factors only:\n"
            "• **Aptitude Test Score** (≥70% target)\n"
            "• **Resume Skill Match** (≥55% of required skill tags)\n\n"
            "💡 **Our Promise:** We never do silent auto-rejections. Every decision is accompanied by a plain-English explanation. "
            "Borderline scores (40%–69%) are routed to a human recruiter for manual review."
        ),
        "suggestions": ["What if my score is borderline?", "How does blind screening work?", "How can I contact support?"]
    },
]

RECRUITER_FAQS = [
    {
        "keywords": ["bias", "score", "scan", "words", "language", "gender", "age", "inclusive"],
        "reply": (
            "🛡️ **JD Bias Scanner Guidelines:**\n\n"
            "Our scanner analyzes Job Descriptions across multiple bias categories:\n"
            "• **Gendered Language:** e.g., 'rockstar', 'ninja', 'dominant' vs 'collaborative', 'supportive'.\n"
            "• **Ageism:** e.g., 'digital native', 'energetic youthful culture'.\n"
            "• **Racial / Cultural Nuances:** e.g., 'native English speaker' vs 'fluent professional proficiency'.\n\n"
            "Jobs must achieve a high bias safety score before they can be published to candidates."
        ),
        "suggestions": ["How to fix flagged JD words?", "How does the review queue work?", "What are the audit requirements?"]
    },
    {
        "keywords": ["review", "queue", "override", "borderline", "manual", "decision"],
        "reply": (
            "👥 **Human Review Queue:**\n\n"
            "When a candidate's test score or skill match falls into the borderline band (e.g. 40%–69%), "
            "the AI flags them as `Needs Review`.\n\n"
            "• As a recruiter, you can review the candidate's anonymous test breakdown and skill matches.\n"
            "• You can **Approve as Eligible** or **Mark Not Eligible**.\n"
            "• All manual overrides require an explanation (min 10 characters) and are permanently saved to the **Audit Log**."
        ),
        "suggestions": ["What goes into the audit log?", "How are tests generated?", "Can I edit published JDs?"]
    },
    {
        "keywords": ["audit", "compliance", "log", "traceab", "legal", "record"],
        "reply": (
            "📜 **Audit Trail & Compliance:**\n\n"
            "Every significant hiring action generates an immutable audit record:\n"
            "• JD bias analyses and publish events.\n"
            "• Aptitude test generation and candidate submissions.\n"
            "• AI eligibility verdict calculations.\n"
            "• Human recruiter override decisions with the recorded justification."
        ),
        "suggestions": ["How does blind screening protect against bias?", "How are aptitude tests graded?", "Explain review queue"]
    },
    {
        "keywords": ["generate", "test", "question", "rubric", "skill profile"],
        "reply": (
            "⚙️ **Aptitude Test Engine:**\n\n"
            "• Tests are generated dynamically from the job's extracted **Skill Profile** (e.g. React, Node.js, Python, SQL, DSA).\n"
            "• Contains 8 MCQs and 2 short-answer questions.\n"
            "• Candidates have 30 minutes to complete the assessment.\n"
            "• Correct answers and grading rubrics are strictly kept server-side and never leaked to candidates."
        ),
        "suggestions": ["How to send tests to candidates?", "What is the passing threshold?", "How to view candidate results?"]
    },
]


def _match_knowledge_base(role: str, user_message: str) -> Optional[Dict[str, Any]]:
    """Match user query against role-specific knowledge base."""
    text = user_message.lower()
    faqs = RECRUITER_FAQS if role in ["recruiter", "hr_lead", "admin", "compliance"] else CANDIDATE_FAQS

    for faq in faqs:
        if any(kw in text for kw in faq["keywords"]):
            return {
                "reply": faq["reply"],
                "suggestions": faq["suggestions"],
                "model_version": "kb-v1",
            }
    return None


def _call_claude_chatbot(
    role: str,
    message: str,
    conversation_history: List[Dict[str, str]],
    context: Optional[Dict[str, Any]] = None
) -> Optional[Dict[str, Any]]:
    """Optional Claude API integration for open-ended queries."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key or api_key in ("your_claude_api_key_here", "", "YOUR_KEY_HERE"):
        return None

    try:
        import anthropic  # type: ignore
        client = anthropic.Anthropic(api_key=api_key)

        system_prompt = f"""You are FairHire AI, a helpful, transparent, and objective hiring assistant.
Current User Role: {role.upper()}
Application Context: {json.dumps(context or {})}

Guidelines:
- Explain policies around fair hiring, unbiased blind screening, aptitude test grading, and plain-English eligibility.
- Uphold confidentiality: never invent or disclose private demographic data.
- Keep answers structured, concise, and friendly with markdown formatting."""

        messages = []
        for msg in conversation_history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": message})

        res = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )
        reply_text = res.content[0].text.strip()
        suggestions = ["How is fairness guaranteed?", "What are the test guidelines?", "Tell me about blind screening"]
        return {
            "reply": reply_text,
            "suggestions": suggestions,
            "model_version": "claude-3-5-haiku",
        }
    except Exception as e:
        print(f"[CHATBOT] Claude fallback failed: {e}")
        return None


def generate_chat_reply(
    role: str,
    message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Main entry point for Chatbot service.
    First checks Claude (if configured), then checks domain knowledge base,
    and falls back to intelligent role-based default.
    """
    history = conversation_history or []

    # 1. Try Claude if configured
    claude_res = _call_claude_chatbot(role, message, history, context)
    if claude_res:
        return claude_res

    # 2. Try Domain Knowledge Base
    kb_res = _match_knowledge_base(role, message)
    if kb_res:
        return kb_res

    # 3. Default fallback tailored by role
    if role in ["recruiter", "hr_lead", "admin", "compliance"]:
        return {
            "reply": (
                "👋 **Hello! I'm your FairHire Recruiter Assistant.**\n\n"
                "I can help you with:\n"
                "• **JD Bias Optimization:** How to eliminate biased phrases and write inclusive job descriptions.\n"
                "• **Candidate Pipeline & Assessments:** Generating tests, reviewing scores, and evaluation standards.\n"
                "• **Human Review Queue:** Guidelines for handling borderline candidates and required audit justifications.\n"
                "• **Audit Trail Compliance:** Ensuring all hiring decisions meet fair employment practices."
            ),
            "suggestions": [
                "How does the JD bias scanner work?",
                "How do I review borderline candidates?",
                "What is recorded in the audit log?",
                "How are aptitude tests generated?"
            ],
            "model_version": "rule-v1",
        }
    else:
        return {
            "reply": (
                "👋 **Hello! I'm your FairHire Candidate Assistant.**\n\n"
                "I'm here to ensure your job application process is transparent, fair, and unbiased.\n\n"
                "You can ask me about:\n"
                "• **Blind Screening:** How your personal data is protected and kept anonymous.\n"
                "• **Aptitude Tests:** What to expect during the 30-minute timed assessment.\n"
                "• **Application Status:** What each stage of your hiring pipeline means.\n"
                "• **AI Decision Explanations:** How eligibility is determined strictly on technical skills."
            ),
            "suggestions": [
                "How does blind screening work?",
                "What is the aptitude test format?",
                "How is my eligibility calculated?",
                "What do application statuses mean?"
            ],
            "model_version": "rule-v1",
        }
