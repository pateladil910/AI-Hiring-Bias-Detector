"""
AI Hiring Bias Detector — Eligibility Engine Service
Phase 4: Computes a fair eligibility verdict from objective signals only.

Inputs (all numeric / objective — ZERO demographic signals):
  - test_score         : float 0–100 (from TestSubmission.autoScore)
  - resume_skill_match : float 0–1   (fraction of JD tech_stack tags found in anonymised resume)
  - llm_confidence     : float 0–1   (grader confidence — used to widen the needs_review band)

Output:
  - verdict:     'eligible' | 'not_eligible' | 'needs_review'
  - explanation: plain-English reason (always provided — per rules.md: no silent rejections)
  - score_detail: breakdown dict for audit trail
  - model_version: 'eligibility-v1'

Thresholds (tunable via env-vars in future):
  ELIGIBLE        test_score >= 70  AND  resume_skill_match >= 0.55
  NOT_ELIGIBLE    test_score <  40  OR   resume_skill_match <  0.20
  NEEDS_REVIEW    everything else (borderline)

IMPORTANT: This function must NEVER receive or evaluate:
  name, email, phone, address, gender, age, ethnicity, nationality, photo
  — see rules.md §4 (Eligibility Engine constraints)
"""

from typing import Dict, Any


# ── Thresholds ────────────────────────────────────────────────────────────────
ELIGIBLE_TEST_MIN       = 70.0   # test score must be ≥ this
ELIGIBLE_SKILL_MIN      = 0.55   # skill match must be ≥ this

NOT_ELIGIBLE_TEST_MAX   = 40.0   # test score below this → hard reject
NOT_ELIGIBLE_SKILL_MAX  = 0.20   # skill match below this → hard reject

# When LLM confidence is low, widen the needs_review band by this much
LOW_CONFIDENCE_BUFFER   = 5.0    # extra test score points pushed into needs_review


def compute_verdict(
    test_score: float,
    resume_skill_match: float,
    llm_confidence: float = 1.0,
    application_id: str = "",
) -> Dict[str, Any]:
    """
    Core eligibility computation.

    Args:
        test_score:          Overall test score 0–100.
        resume_skill_match:  Fraction of JD skill tags found in anonymised resume (0.0–1.0).
        llm_confidence:      Grader confidence for short-answer questions (0.0–1.0).
                             Low confidence widens the needs_review band.
        application_id:      Passed through for audit context only.

    Returns:
        {
            verdict:       str,
            explanation:   str,
            score_detail:  dict,
            model_version: str,
        }
    """
    # Clamp inputs
    test_score         = max(0.0, min(100.0, float(test_score)))
    resume_skill_match = max(0.0, min(1.0,   float(resume_skill_match)))
    llm_confidence     = max(0.0, min(1.0,   float(llm_confidence)))

    # Adjust eligible threshold upward when grader confidence is low
    confidence_penalty = 0.0
    if llm_confidence < 0.70:
        confidence_penalty = LOW_CONFIDENCE_BUFFER * (1.0 - llm_confidence)

    effective_eligible_test_min = ELIGIBLE_TEST_MIN + confidence_penalty

    skill_pct = round(resume_skill_match * 100, 1)

    # ── Decision tree ─────────────────────────────────────────────────────────

    # Hard reject: test score critically low OR skills almost completely absent
    if test_score < NOT_ELIGIBLE_TEST_MAX:
        verdict = "not_eligible"
        explanation = (
            f"The candidate scored {round(test_score, 1)}% on the aptitude test, which is below "
            f"the minimum threshold of {NOT_ELIGIBLE_TEST_MAX}%. "
            f"Resume skill match was {skill_pct}%. "
            "This decision was made on objective technical performance only."
        )

    elif resume_skill_match < NOT_ELIGIBLE_SKILL_MAX:
        verdict = "not_eligible"
        explanation = (
            f"The candidate's resume skill match was {skill_pct}%, which is below the minimum "
            f"threshold of {round(NOT_ELIGIBLE_SKILL_MAX * 100)}% required for this role. "
            f"Aptitude test score was {round(test_score, 1)}%. "
            "This decision was made on objective skills alignment only."
        )

    # Clear pass: strong test score AND good skill match
    elif test_score >= effective_eligible_test_min and resume_skill_match >= ELIGIBLE_SKILL_MIN:
        verdict = "eligible"
        confidence_note = (
            f" (Grader confidence: {round(llm_confidence * 100)}% — threshold adjusted accordingly.)"
            if confidence_penalty > 0 else ""
        )
        explanation = (
            f"The candidate scored {round(test_score, 1)}% on the aptitude test "
            f"(threshold: {round(effective_eligible_test_min, 1)}%) and the resume "
            f"matched {skill_pct}% of the required skill tags "
            f"(threshold: {round(ELIGIBLE_SKILL_MIN * 100)}%). "
            f"Both thresholds met — candidate is eligible for the next stage.{confidence_note}"
        )

    # Borderline: everything else routes to human review
    else:
        verdict = "needs_review"
        # Build a detailed reason describing which signal is borderline
        reasons = []
        if test_score < effective_eligible_test_min:
            reasons.append(
                f"test score {round(test_score, 1)}% is borderline "
                f"(threshold: {round(effective_eligible_test_min, 1)}%)"
            )
        if resume_skill_match < ELIGIBLE_SKILL_MIN:
            reasons.append(
                f"resume skill match {skill_pct}% is borderline "
                f"(threshold: {round(ELIGIBLE_SKILL_MIN * 100)}%)"
            )
        reason_str = " and ".join(reasons) if reasons else "signals are borderline"
        explanation = (
            f"The {reason_str}. "
            "This candidate cannot be automatically approved or rejected — "
            "a human recruiter must review and make the final decision. "
            "Per our fair hiring policy, borderline cases are never silently rejected."
        )

    return {
        "verdict": verdict,
        "explanation": explanation,
        "score_detail": {
            "test_score":          round(test_score, 2),
            "resume_skill_match":  round(resume_skill_match, 4),
            "skill_match_pct":     skill_pct,
            "llm_confidence":      round(llm_confidence, 3),
            "confidence_penalty":  round(confidence_penalty, 2),
            "effective_eligible_test_min": round(effective_eligible_test_min, 2),
            "thresholds": {
                "eligible_test_min":    ELIGIBLE_TEST_MIN,
                "eligible_skill_min":   ELIGIBLE_SKILL_MIN,
                "not_eligible_test_max": NOT_ELIGIBLE_TEST_MAX,
                "not_eligible_skill_max": NOT_ELIGIBLE_SKILL_MAX,
            },
        },
        "model_version": "eligibility-v1",
    }
