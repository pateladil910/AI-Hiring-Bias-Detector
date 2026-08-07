"""
AI Hiring Bias Detector — Grader Service
Phase 3: Auto-grades candidate test submissions.

Grading strategy:
  - MCQ:          Rule-based (compare submitted answer_index to correct_index). 100% or 0% per question.
  - Short-answer: MOCK rubric — checks how many rubric_keywords appear in the answer.
                  Score = (keywords_matched / total_keywords) * max_score.
                  LLM confidence reported as a normalised float.

Returns a detailed breakdown so recruiters can see per-question results.
"""

from typing import List, Dict, Any


def grade(
    questions: List[Dict[str, Any]],
    answers: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Grade a submitted test.

    Args:
        questions: List of question objects (from AptitudeTest.questionsJson).
                   MCQ questions include `correct_index`.
                   Short-answer questions include `rubric_keywords`.
        answers:   List of answer objects submitted by candidate.
                   MCQ format:          {"question_id": "q1_abc", "answer_index": 2}
                   Short-answer format: {"question_id": "q2_def", "answer_text": "..."}

    Returns:
        {
            "auto_score":     float (0-100, overall percentage),
            "llm_confidence": float (0.0-1.0, average grading confidence),
            "breakdown":      list of per-question result objects,
        }
    """
    # Build a lookup: question_id → question
    question_map: Dict[str, Dict] = {q["id"]: q for q in questions}

    # Build a lookup: question_id → answer
    answer_map: Dict[str, Dict] = {a["question_id"]: a for a in answers}

    breakdown = []
    total_score = 0.0
    total_max = 0.0
    confidence_sum = 0.0
    graded_count = 0

    for q in questions:
        qid = q["id"]
        qtype = q.get("type", "mcq")
        answer = answer_map.get(qid)
        max_score = 1.0  # Each question worth 1 point

        if qtype == "mcq":
            result = _grade_mcq(q, answer, max_score)
        else:
            result = _grade_short_answer(q, answer, max_score)

        breakdown.append(result)
        total_score += result["score"]
        total_max += result["max_score"]
        confidence_sum += result["confidence"]
        graded_count += 1

    auto_score = (total_score / total_max * 100) if total_max > 0 else 0.0
    avg_confidence = (confidence_sum / graded_count) if graded_count > 0 else 1.0

    return {
        "auto_score": round(auto_score, 2),
        "llm_confidence": round(avg_confidence, 3),
        "breakdown": breakdown,
    }


def _grade_mcq(
    question: Dict[str, Any],
    answer: Dict[str, Any],
    max_score: float = 1.0,
) -> Dict[str, Any]:
    """
    Rule-based MCQ grading.
    Returns the per-question breakdown dict.
    """
    correct_index: int = question.get("correct_index", -1)
    submitted_index: int = answer.get("answer_index", -1) if answer else -1

    not_answered = submitted_index == -1 or answer is None
    is_correct = (not not_answered) and (submitted_index == correct_index)
    score = max_score if is_correct else 0.0

    correct_option = None
    options = question.get("options") or []
    if 0 <= correct_index < len(options):
        correct_option = options[correct_index]

    submitted_option = None
    if not not_answered and 0 <= submitted_index < len(options):
        submitted_option = options[submitted_index]

    return {
        "question_id": question["id"],
        "type": "mcq",
        "question": question.get("question", ""),
        "topic": question.get("topic", ""),
        "submitted_answer": submitted_option,
        "correct_answer": correct_option,
        "submitted_index": submitted_index,
        "correct_index": correct_index,
        "is_correct": is_correct,
        "not_answered": not_answered,
        "score": score,
        "max_score": max_score,
        "confidence": 1.0,  # Rule-based: always 100% confident
        "feedback": (
            "Correct!" if is_correct
            else "Not answered." if not_answered
            else f"Incorrect. The correct answer was: {correct_option}"
        ),
    }


def _grade_short_answer(
    question: Dict[str, Any],
    answer: Dict[str, Any],
    max_score: float = 1.0,
) -> Dict[str, Any]:
    """
    MOCK rubric-based short-answer grading.
    Counts how many rubric_keywords appear in the candidate's answer text.
    Score is proportional to keyword coverage.
    """
    rubric_keywords: List[str] = question.get("rubric_keywords") or []
    answer_text: str = (answer.get("answer_text", "") if answer else "").lower().strip()
    not_answered = not answer_text or answer is None

    if not_answered or not rubric_keywords:
        matched = 0
        total_keywords = max(len(rubric_keywords), 1)
        score = 0.0
        confidence = 0.85
        feedback = "No answer provided." if not_answered else "Unable to grade (no rubric)."
    else:
        matched = sum(1 for kw in rubric_keywords if kw.lower() in answer_text)
        total_keywords = len(rubric_keywords)
        score = round((matched / total_keywords) * max_score, 4)
        # Confidence decreases when few keywords match (more uncertain grading)
        confidence = round(0.6 + (0.4 * (matched / total_keywords)), 3)
        feedback = (
            f"Good answer — covered {matched}/{total_keywords} key concepts."
            if matched >= total_keywords * 0.6
            else f"Partial answer — only {matched}/{total_keywords} key concepts addressed."
        )

    return {
        "question_id": question["id"],
        "type": "short_answer",
        "question": question.get("question", ""),
        "topic": question.get("topic", ""),
        "submitted_answer": answer_text or None,
        "correct_answer": None,  # No single correct answer for short-answer
        "rubric_keywords": rubric_keywords,
        "keywords_matched": matched if not not_answered else 0,
        "total_keywords": len(rubric_keywords),
        "is_correct": None,  # Not applicable
        "not_answered": not_answered,
        "score": score,
        "max_score": max_score,
        "confidence": confidence,
        "feedback": feedback,
        "grading_method": "mock-rubric-keyword-v1",
    }
