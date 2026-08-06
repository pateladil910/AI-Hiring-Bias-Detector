"""
bias_detector.py — MOCK keyword-based bias classifier (Phase 1)

MOCK: This uses a curated keyword/pattern dictionary. Replace with a fine-tuned
      BERT/RoBERTa token classifier in Phase 1.5 when labelled training data is available.
      The API contract (input/output shape) is identical — only the classification logic changes.
"""

import re
from typing import List, Dict, Any


# ─── Bias Dictionary ─────────────────────────────────────────────────────────
# Each entry: { "pattern": regex, "type": category, "suggestion": replacement, "severity": 1-3 }

BIAS_PATTERNS = [
    # ── Gendered Language ────────────────────────────────────────────────────
    {"pattern": r"\b(rockstar|rock star)\b", "type": "gendered_language", "suggestion": "highly skilled professional", "severity": 2},
    {"pattern": r"\bninja\b", "type": "gendered_language", "suggestion": "expert", "severity": 2},
    {"pattern": r"\bguru\b", "type": "gendered_language", "suggestion": "specialist", "severity": 1},
    {"pattern": r"\bwizard\b", "type": "gendered_language", "suggestion": "expert", "severity": 1},
    {"pattern": r"\bhe or she\b", "type": "gendered_language", "suggestion": "they", "severity": 2},
    {"pattern": r"\bhe/she\b", "type": "gendered_language", "suggestion": "they", "severity": 2},
    {"pattern": r"\bhis or her\b", "type": "gendered_language", "suggestion": "their", "severity": 2},
    {"pattern": r"\bmanpower\b", "type": "gendered_language", "suggestion": "workforce", "severity": 2},
    {"pattern": r"\bworkman\b", "type": "gendered_language", "suggestion": "worker", "severity": 2},
    {"pattern": r"\bchairman\b", "type": "gendered_language", "suggestion": "chairperson", "severity": 2},
    {"pattern": r"\bsalesman\b", "type": "gendered_language", "suggestion": "salesperson", "severity": 2},
    {"pattern": r"\bfireman\b", "type": "gendered_language", "suggestion": "firefighter", "severity": 2},
    {"pattern": r"\bhustle\b", "type": "gendered_language", "suggestion": "work effectively", "severity": 1},
    {"pattern": r"\bdominant\b", "type": "gendered_language", "suggestion": "leading", "severity": 1},
    {"pattern": r"\baggressive\b", "type": "gendered_language", "suggestion": "results-driven", "severity": 2},
    {"pattern": r"\bcompetitive\b", "type": "gendered_language", "suggestion": "goal-oriented", "severity": 1},

    # ── Age Bias ─────────────────────────────────────────────────────────────
    {"pattern": r"\byoung\b", "type": "age_bias", "suggestion": "motivated", "severity": 3},
    {"pattern": r"\benergetic\b", "type": "age_bias", "suggestion": "motivated", "severity": 1},
    {"pattern": r"\bdigital native\b", "type": "age_bias", "suggestion": "proficient with digital tools", "severity": 3},
    {"pattern": r"\brecent graduate\b", "type": "age_bias", "suggestion": "entry-level candidate", "severity": 2},
    {"pattern": r"\bfresh graduate\b", "type": "age_bias", "suggestion": "entry-level candidate", "severity": 2},
    {"pattern": r"\b(0|1|2)\s*-\s*(1|2|3)\s*years?\s*(of\s*)?experience\b", "type": "age_bias", "suggestion": "demonstrated experience in the relevant area", "severity": 1},

    # ── Exclusionary / Insider Slang ──────────────────────────────────────────
    {"pattern": r"\bpingpong\b", "type": "exclusionary_culture", "suggestion": "recreational activities", "severity": 1},
    {"pattern": r"\bfoosball\b", "type": "exclusionary_culture", "suggestion": "team activities", "severity": 1},
    {"pattern": r"\bbeer\b", "type": "exclusionary_culture", "suggestion": "social events", "severity": 2},
    {"pattern": r"\bkeg\b", "type": "exclusionary_culture", "suggestion": "", "severity": 3},
    {"pattern": r"\bhero\b", "type": "exclusionary_culture", "suggestion": "key contributor", "severity": 1},
    {"pattern": r"\bsuperstar\b", "type": "exclusionary_culture", "suggestion": "high performer", "severity": 1},
    {"pattern": r"\bkill it\b", "type": "exclusionary_culture", "suggestion": "excel", "severity": 2},
    {"pattern": r"\bcrush\b", "type": "exclusionary_culture", "suggestion": "excel at", "severity": 1},

    # ── Ableist Language ──────────────────────────────────────────────────────
    {"pattern": r"\bcrazy\b", "type": "ableist_language", "suggestion": "unexpected", "severity": 2},
    {"pattern": r"\binsane\b", "type": "ableist_language", "suggestion": "remarkable", "severity": 2},
    {"pattern": r"\bstands on their own two feet\b", "type": "ableist_language", "suggestion": "works independently", "severity": 3},

    # ── Unnecessary Requirements ───────────────────────────────────────────────
    {"pattern": r"\bmust be (a\s)?native\b", "type": "unnecessary_requirement", "suggestion": "must be proficient in", "severity": 3},
    {"pattern": r"\bnative (english|language)\b", "type": "unnecessary_requirement", "suggestion": "fluent in English", "severity": 3},
    {"pattern": r"\bflawless english\b", "type": "unnecessary_requirement", "suggestion": "strong English communication skills", "severity": 2},
    {"pattern": r"\bperfect english\b", "type": "unnecessary_requirement", "suggestion": "strong English communication skills", "severity": 2},
    {"pattern": r"\b(10|15|20)\+?\s*years?\s*(of\s*)?experience\b", "type": "unnecessary_requirement", "suggestion": "extensive experience", "severity": 2},
]


class BiasDetector:
    """
    MOCK: Keyword/pattern-based bias detector.
    Replace `detect()` internals with a BERT token classifier call for Phase 1.5.
    """

    def detect(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        flags = []
        flagged_positions = set()

        for rule in BIAS_PATTERNS:
            pattern = re.compile(rule["pattern"], re.IGNORECASE)
            for match in pattern.finditer(text):
                start, end = match.start(), match.end()
                # Avoid duplicate overlapping flags
                span_key = (start, end)
                if span_key in flagged_positions:
                    continue
                flagged_positions.add(span_key)

                flags.append({
                    "token": match.group(0),
                    "type": rule["type"],
                    "suggestion": rule["suggestion"],
                    "severity": rule["severity"],  # 1=low, 2=medium, 3=high
                    "start": start,
                    "end": end,
                    "context": text[max(0, start - 30): end + 30].strip(),
                })

        score = self._compute_score(flags, len(text))
        explanation = self._explain(flags, score)

        return {
            "score": round(score, 1),
            "flags": flags,
            "flag_count": len(flags),
            "explanation": explanation,
            "model_version": "mock-keyword-v1",
        }

    def _compute_score(self, flags: List[Dict], text_length: int) -> float:
        """
        Score: 100 = perfectly unbiased, 0 = heavily biased.
        Deduct points per flag weighted by severity and text density.
        MOCK: Replace with model confidence output in Phase 1.5.
        """
        if not flags:
            return 100.0

        # Severity weights
        weights = {1: 4, 2: 8, 3: 15}
        total_deduction = sum(weights.get(f["severity"], 5) for f in flags)

        # Normalize against text length (longer JDs get slight leniency)
        length_factor = min(1.0, 500 / max(text_length, 1))
        deduction = total_deduction * (0.5 + 0.5 * length_factor)

        return max(0.0, min(100.0, 100.0 - deduction))

    def _explain(self, flags: List[Dict], score: float) -> str:
        if not flags:
            return "No bias signals detected. This job description appears inclusive."

        types = list({f["type"] for f in flags})
        type_labels = {
            "gendered_language": "gendered language",
            "age_bias": "age-related bias",
            "exclusionary_culture": "exclusionary cultural references",
            "ableist_language": "ableist language",
            "unnecessary_requirement": "potentially unnecessary requirements",
        }
        type_str = ", ".join(type_labels.get(t, t) for t in types)

        severity_counts = {1: 0, 2: 0, 3: 0}
        for f in flags:
            severity_counts[f["severity"]] += 1

        high = severity_counts[3]
        summary = f"{len(flags)} bias signal(s) detected: {type_str}."
        if high > 0:
            summary += f" {high} high-severity issue(s) require immediate attention."
        summary += f" Bias score: {score:.0f}/100 (higher = more inclusive)."
        return summary


# Singleton instance
bias_detector = BiasDetector()
