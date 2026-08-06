"""
skill_profiler.py — JD Skill Profiler (Phase 1)

Extracts a structured skill/field profile from a JD text.
Used to drive aptitude test generation in Phase 3.

MOCK: Uses keyword matching. Replace with Claude API extraction in Phase 1.5.
"""

import re
from typing import Dict, Any, List


# ─── Field detection keywords ─────────────────────────────────────────────────
FIELD_SIGNATURES = {
    "frontend": [
        "react", "vue", "angular", "svelte", "next.js", "html", "css", "javascript",
        "typescript", "webpack", "tailwind", "ui", "ux", "frontend", "front-end",
        "web developer", "dom", "responsive design",
    ],
    "backend": [
        "node.js", "express", "django", "flask", "fastapi", "spring", "rails",
        "api", "rest", "graphql", "backend", "back-end", "server-side",
        "microservices", "postgresql", "mysql", "mongodb", "redis",
    ],
    "fullstack": [
        "full stack", "fullstack", "full-stack", "mern", "mean", "lamp",
    ],
    "data_science": [
        "machine learning", "deep learning", "neural network", "python", "pandas",
        "numpy", "sklearn", "tensorflow", "pytorch", "data science", "ml engineer",
        "nlp", "computer vision", "statistics", "r programming", "jupyter",
    ],
    "devops": [
        "devops", "kubernetes", "docker", "ci/cd", "jenkins", "github actions",
        "terraform", "ansible", "aws", "azure", "gcp", "infrastructure", "cloud",
        "linux", "bash", "monitoring", "prometheus", "grafana",
    ],
    "mobile": [
        "android", "ios", "react native", "flutter", "swift", "kotlin", "mobile",
        "app development", "xcode", "android studio",
    ],
    "embedded": [
        "embedded", "firmware", "rtos", "c++", "microcontroller", "arduino",
        "raspberry pi", "fpga", "vhdl", "verilog", "ece", "electronics",
        "signal processing", "plc", "iot",
    ],
    "security": [
        "security", "cybersecurity", "penetration testing", "soc", "siem",
        "encryption", "vulnerability", "firewall", "network security", "ethical hacking",
    ],
    "product": [
        "product manager", "product owner", "roadmap", "agile", "scrum",
        "user stories", "backlog", "kpi", "metrics", "stakeholder",
    ],
}

# ─── Experience level detection ────────────────────────────────────────────────
EXPERIENCE_PATTERNS = [
    (r"(\d+)\+?\s*years?\s*(of\s*)?experience", "years"),
    (r"(junior|entry[\s-]level|fresher|graduate)", "entry"),
    (r"(mid[\s-]?level|intermediate|(\d+)[\s-](\d+)\s*years?)", "mid"),
    (r"(senior|lead|principal|staff|(\d+)\+\s*years?)", "senior"),
]


def extract_skill_profile(text: str) -> Dict[str, Any]:
    """
    MOCK: Keyword-based skill extractor.
    Replace with Claude API call in Phase 1.5 for richer extraction.
    """
    text_lower = text.lower()

    # ── Detect field ──────────────────────────────────────────────────────────
    field_scores: Dict[str, int] = {}
    for field, keywords in FIELD_SIGNATURES.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            field_scores[field] = score

    # Pick primary field (highest score)
    primary_field = max(field_scores, key=field_scores.get) if field_scores else "general"
    # Secondary fields (any with score > 1 that aren't primary)
    secondary_fields = [
        f for f, s in field_scores.items()
        if f != primary_field and s >= 2
    ][:2]

    # ── Extract tech stack keywords ───────────────────────────────────────────
    tech_keywords = []
    all_field_keywords = []
    for kws in FIELD_SIGNATURES.values():
        all_field_keywords.extend(kws)

    for kw in set(all_field_keywords):
        if kw in text_lower:
            tech_keywords.append(kw)

    # ── Detect experience level ───────────────────────────────────────────────
    experience_level = "mid"  # default
    years_required = None

    for pattern, level in EXPERIENCE_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            if level == "years":
                years_required = int(match.group(1))
                experience_level = "senior" if years_required >= 5 else ("entry" if years_required <= 1 else "mid")
            else:
                experience_level = level
            break

    # ── Extract soft skills ───────────────────────────────────────────────────
    soft_skill_patterns = [
        "communication", "teamwork", "collaboration", "problem.solving",
        "leadership", "analytical", "attention to detail", "time management",
        "critical thinking", "adaptability",
    ]
    soft_skills = [s for s in soft_skill_patterns if re.search(s, text_lower)]

    return {
        "primary_field": primary_field,
        "secondary_fields": secondary_fields,
        "tech_stack": tech_keywords[:15],  # cap at 15
        "experience_level": experience_level,
        "years_required": years_required,
        "soft_skills": soft_skills,
        "model_version": "mock-keyword-v1",
    }
