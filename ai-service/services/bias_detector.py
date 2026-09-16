"""
bias_detector.py — Hybrid Multi-Layer AI Bias Detection Engine (v2 Specification)

Layer 1: Deterministic Lexicon Scanner (<50ms) for sub-second keystroke feedback.
Layer 2: Structured LLM Analysis (Claude 3.5 Haiku) for nuanced tone, pedigree, and structural red flags.
Layer 3: Score Merge & Category-Capped Composite Score Formula.
"""

import os
import re
import json
from typing import List, Dict, Any, Optional

# ─── Layer 1 Curated Lexicon Patterns ─────────────────────────────────────────
BIAS_PATTERNS = [
    # ── Gender-Coded Phrasing ────────────────────────────────────────────────
    {"pattern": r"\b(rockstar|rock star)\b", "category": "gender_coded", "suggestion": "skilled professional", "severity": "medium", "explanation": "Masculine-coded framing linked to lower application rates from women."},
    {"pattern": r"\bninja\b", "category": "gender_coded", "suggestion": "expert engineer", "severity": "medium", "explanation": "Overly aggressive jargon that discourages diverse candidates."},
    {"pattern": r"\bguru\b", "category": "gender_coded", "suggestion": "technical specialist", "severity": "low", "explanation": "Jargon that can obscure objective job requirements."},
    {"pattern": r"\bwizard\b", "category": "gender_coded", "suggestion": "software specialist", "severity": "low", "explanation": "Exclusionary slang term."},
    {"pattern": r"\bdominant\b", "category": "gender_coded", "suggestion": "leading", "severity": "medium", "explanation": "Overly aggressive tone."},
    {"pattern": r"\baggressive\b", "category": "gender_coded", "suggestion": "results-driven", "severity": "medium", "explanation": "Masculine-coded trait."},
    {"pattern": r"\bcompetitive\b", "category": "gender_coded", "suggestion": "goal-oriented", "severity": "low", "explanation": "Can be perceived as hyper-competitive work culture."},
    {"pattern": r"\bhe or she\b", "category": "gender_coded", "suggestion": "they", "severity": "medium", "explanation": "Use gender-neutral pronouns (they/them)."},
    {"pattern": r"\bhe/she\b", "category": "gender_coded", "suggestion": "they", "severity": "medium", "explanation": "Use gender-neutral pronouns (they/them)."},
    {"pattern": r"\bhis or her\b", "category": "gender_coded", "suggestion": "their", "severity": "medium", "explanation": "Use gender-neutral pronouns (they/them)."},
    {"pattern": r"\bmanpower\b", "category": "gender_coded", "suggestion": "workforce", "severity": "medium", "explanation": "Gendered terminology."},
    {"pattern": r"\bchairman\b", "category": "gender_coded", "suggestion": "chairperson", "severity": "medium", "explanation": "Gendered title."},

    # ── Age Bias ─────────────────────────────────────────────────────────────
    {"pattern": r"\byoung\b", "category": "age_bias", "suggestion": "motivated", "severity": "high", "explanation": "Directly indicates preference for younger age demographic."},
    {"pattern": r"\benergetic\b", "category": "age_bias", "suggestion": "driven and dedicated", "severity": "medium", "explanation": "Often used as a proxy for younger candidates."},
    {"pattern": r"\bdigital native\b", "category": "age_bias", "suggestion": "proficient with digital tools", "severity": "high", "explanation": "Explicit ageist proxy excluding older qualified candidates."},
    {"pattern": r"\brecent graduate(s)? only\b", "category": "age_bias", "suggestion": "entry-level candidates", "severity": "high", "explanation": "Excludes experienced career changers."},
    {"pattern": r"\bfresh graduate(s)?\b", "category": "age_bias", "suggestion": "entry-level candidates", "severity": "medium", "explanation": "Ageist phrasing."},
    {"pattern": r"\bmaximum \d+ years?\s*(of\s*)?experience\b", "category": "age_bias", "suggestion": "open to varying experience levels", "severity": "high", "explanation": "Experience ceiling can violate age discrimination laws."},

    # ── Pedigree & Elitism Bias ───────────────────────────────────────────────
    {"pattern": r"\bivy league( only)?\b", "category": "pedigree_bias", "suggestion": "accredited university or equivalent experience", "severity": "high", "explanation": "Excludes candidates based on socioeconomic background."},
    {"pattern": r"\btop(-|\s)tier university\b", "category": "pedigree_bias", "suggestion": "relevant technical background", "severity": "high", "explanation": "Pedigree requirement unrelated to job performance."},
    {"pattern": r"\bnative (english|speaker)\b", "category": "pedigree_bias", "suggestion": "fluent in English", "severity": "high", "explanation": "Discriminates against non-native fluent speakers."},
    {"pattern": r"\bflawless english\b", "category": "pedigree_bias", "suggestion": "strong professional communication", "severity": "medium", "explanation": "Overly restrictive language requirement."},

    # ── Ability & Exclusionary Language ───────────────────────────────────────
    {"pattern": r"\bstands on (their|his|her) own two feet\b", "category": "ability_bias", "suggestion": "works independently", "severity": "high", "explanation": "Ableist idiom."},
    {"pattern": r"\bmust be able to stand for \d+ hours\b", "category": "ability_bias", "suggestion": "standard office environment", "severity": "medium", "explanation": "Physical requirement unrelated to desk roles."},
    {"pattern": r"\bpingpong\b|\bfoosball\b|\bbeer\b|\bkeg\b", "category": "cultural_bias", "suggestion": "collaborative team activities", "severity": "medium", "explanation": "Frat-like perks that can alienate diverse candidates."},
]


class HybridBiasDetector:
    """
    3-Layer Hybrid AI Bias Detection Engine.
    """

    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    def scan_lexicon(self, text: str) -> Dict[str, Any]:
        """Layer 1: Instant deterministic keystroke scanner (<50ms)."""
        flags = []
        flagged_spans = set()

        for rule in BIAS_PATTERNS:
            pattern = re.compile(rule["pattern"], re.IGNORECASE)
            for match in pattern.finditer(text):
                start, end = match.start(), match.end()
                span_key = (start, end)
                if span_key in flagged_spans:
                    continue
                flagged_spans.add(span_key)

                flags.append({
                    "id": f"f_{start}_{end}",
                    "phrase": match.group(0),
                    "category": rule["category"],
                    "suggestion": rule["suggestion"],
                    "severity": rule["severity"],  # 'high', 'medium', 'low'
                    "explanation": rule["explanation"],
                    "start": start,
                    "end": end,
                    "source": "lexicon",
                })

        score, rating = self._compute_composite_score(flags, structural_notes=[])
        return {
            "score": score,
            "rating": rating,
            "flags": flags,
            "flag_count": len(flags),
            "structural_notes": [],
            "source": "layer_1_lexicon",
        }

    async def scan_deep(self, text: str, role_title: Optional[str] = None) -> Dict[str, Any]:
        """Layer 2 + 3: Deep Scan combining Lexicon + LLM Analysis."""
        l1_result = self.scan_lexicon(text)
        l1_flags = l1_result["flags"]

        l2_flags = []
        structural_notes = []

        # Attempt Claude API call if key is present
        if self.anthropic_key and len(text.strip()) > 30:
            try:
                import anthropic
                client = anthropic.AsyncAnthropic(api_key=self.anthropic_key)

                system_prompt = (
                    "You are a hiring-bias auditor. Analyze the job description text and return ONLY "
                    "valid JSON matching this schema: "
                    '{ "flags": [{"phrase": string, "category": string, "explanation": string, "suggestion": string, "severity": "high"|"medium"|"low", "start": number, "end": number}], "structural_notes": [string] }.\n\n'
                    "Rules:\n"
                    "- Flag only text that appears verbatim in the input; include exact character offsets.\n"
                    "- Categories: gender_coded, age_bias, pedigree_bias, ability_bias, cultural_bias, structural_red_flag.\n"
                    "- Do not flag bona fide occupational qualifications.\n"
                    "- Return NO prose outside the JSON."
                )

                user_content = f"Job Title: {role_title or 'Not specified'}\n\nJob Description:\n{text}"

                response = await client.messages.create(
                    model="claude-3-5-haiku-20241022",
                    max_tokens=1000,
                    temperature=0.0,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_content}],
                )

                raw_json = response.content[0].text.strip()
                # Clean code fences if present
                if raw_json.startswith("```"):
                    raw_json = re.sub(r"^```(json)?\n|```$", "", raw_json, flags=re.MULTILINE).strip()

                parsed = json.loads(raw_json)
                for item in parsed.get("flags", []):
                    item["source"] = "llm"
                    item["id"] = f"llm_{item.get('start', 0)}_{item.get('end', 0)}"
                    l2_flags.append(item)
                structural_notes = parsed.get("structural_notes", [])
            except Exception as e:
                print(f"⚠️ [Layer 2 LLM Warning] Falling back to Lexicon: {e}")

        # Layer 3: Merge & Deduplicate
        merged_flags = self._merge_and_dedupe(l1_flags, l2_flags)
        score, rating = self._compute_composite_score(merged_flags, structural_notes)

        return {
            "score": score,
            "rating": rating,
            "flags": merged_flags,
            "flag_count": len(merged_flags),
            "structural_notes": structural_notes,
            "model": "hybrid-lexicon-claude" if l2_flags else "lexicon-layer1",
        }

    def _merge_and_dedupe(self, l1: List[Dict], l2: List[Dict]) -> List[Dict]:
        """Merge L1 and L2 flags avoiding duplicate character spans."""
        merged = list(l1)
        existing_spans = {(f["start"], f["end"]) for f in l1}

        for f2 in l2:
            span = (f2.get("start", -1), f2.get("end", -1))
            if span not in existing_spans and span[0] >= 0:
                merged.append(f2)
                existing_spans.add(span)

        return sorted(merged, key=lambda x: x.get("start", 0))

    def _compute_composite_score(self, flags: List[Dict], structural_notes: List[str]) -> (float, str):
        """
        Mathematical Composite Score Formula (v2 Spec):
        score = 100 - (Σ severity_weight capped at 20 per category) - structural_penalty
        """
        severity_map = {"high": 8, "medium": 4, "low": 2}
        category_deductions = {}

        for f in flags:
            cat = f.get("category", "general")
            sev = f.get("severity", "medium")
            weight = severity_map.get(sev, 4)
            category_deductions[cat] = category_deductions.get(cat, 0) + weight

        # Apply category cap of 20 points per category
        total_category_deduction = sum(min(20, ded) for ded in category_deductions.values())

        # Structural penalty: 2 points per note, capped at 10 points
        structural_penalty = min(10, len(structural_notes) * 2)

        raw_score = 100.0 - total_category_deduction - structural_penalty
        final_score = max(0.0, min(100.0, raw_score))

        if final_score >= 70.0:
            rating = "fair_and_inclusive"
        elif final_score >= 40.0:
            rating = "moderate_bias"
        else:
            rating = "high_bias"

        return round(final_score, 1), rating


# Singleton instance
bias_detector = HybridBiasDetector()
