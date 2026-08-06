"""
resume_parser.py — PDF/DOCX resume text extractor + PII anonymiser (Phase 2)

Extracts clean text from uploaded resumes and strips PII before bias scanning.
MOCK: Uses regex PII stripping. Replace with a named-entity recognition (NER)
      model (e.g. spaCy en_core_web_trf) in Phase 2.5 for higher accuracy.
"""

import re
from typing import Dict, Any, Optional


# ─── PII patterns to strip before bias scoring ────────────────────────────────
PII_PATTERNS = [
    # Full name (standalone capitalized words at line start — heuristic)
    (r'^[A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?$', '[NAME]', re.MULTILINE),
    # Email addresses
    (r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b', '[EMAIL]', 0),
    # Phone numbers (international + local formats)
    (r'(\+?\d{1,3}[\s\-\.]?)?\(?\d{3,5}\)?[\s\-\.]?\d{3,5}[\s\-\.]?\d{3,5}', '[PHONE]', 0),
    # Physical addresses (house number + street name heuristic)
    (r'\d{1,5}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}(?:\s+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Court|Ct|Way|Place|Pl))\b', '[ADDRESS]', 0),
    # LinkedIn, GitHub, portfolio URLs
    (r'https?://(?:www\.)?(?:linkedin\.com|github\.com|twitter\.com|behance\.net|medium\.com)/[\w\-/.?=&%]+', '[PROFILE_URL]', re.IGNORECASE),
    # Any URL
    (r'https?://\S+', '[URL]', 0),
    # Date of birth patterns
    (r'\b(?:DOB|Date of Birth|Born)[:\s]+\d{1,2}[\s/\-]\d{1,2}[\s/\-]\d{2,4}\b', '[DOB]', re.IGNORECASE),
    # Gender mentions
    (r'\b(?:male|female|non[\s\-]binary|gender)\b', '[GENDER]', re.IGNORECASE),
    # Nationality / citizenship
    (r'\b(?:nationality|citizen(?:ship)?|passport)\b[:\s]*\w+', '[NATIONALITY]', re.IGNORECASE),
    # Marital status
    (r'\b(?:married|single|divorced|widowed|marital status)\b', '[MARITAL_STATUS]', re.IGNORECASE),
    # Age
    (r'\b(?:age[:\s]+\d{2}|\d{2}\s+years?\s+old)\b', '[AGE]', re.IGNORECASE),
    # Photo/image references
    (r'\b(?:photo|photograph|profile picture)\b', '[PHOTO_REF]', re.IGNORECASE),
]


def anonymise_text(text: str) -> Dict[str, Any]:
    """
    MOCK: Regex-based PII stripping. Replace with spaCy NER in Phase 2.5.
    
    Returns:
        anonymised_text: cleaned text with PII replaced by placeholders
        redacted_fields: list of what was redacted (for audit)
    """
    anonymised = text
    redacted_fields = []

    for pattern, replacement, flags in PII_PATTERNS:
        if flags:
            compiled = re.compile(pattern, flags)
        else:
            compiled = re.compile(pattern)

        matches = compiled.findall(anonymised)
        if matches:
            redacted_fields.append({
                "type": replacement.strip("[]"),
                "count": len(matches),
            })
            anonymised = compiled.sub(replacement, anonymised)

    return {
        "anonymised_text": anonymised,
        "redacted_fields": redacted_fields,
        "model_version": "mock-regex-v1",
    }


def extract_text_from_bytes(file_bytes: bytes, filename: str) -> Optional[str]:
    """
    Extract plain text from PDF or DOCX bytes.
    Returns None if extraction fails.
    
    Phase 2 dependencies: pypdf2, python-docx
    """
    filename_lower = filename.lower()
    
    try:
        if filename_lower.endswith('.pdf'):
            return _extract_from_pdf(file_bytes)
        elif filename_lower.endswith('.docx'):
            return _extract_from_docx(file_bytes)
        elif filename_lower.endswith('.txt'):
            return file_bytes.decode('utf-8', errors='ignore')
        else:
            return None
    except Exception as e:
        print(f"[RESUME PARSER] Extraction failed for {filename}: {e}")
        return None


def _extract_from_pdf(file_bytes: bytes) -> Optional[str]:
    try:
        import pypdf
        import io
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()
    except ImportError:
        # Graceful degradation if pypdf not installed
        return _mock_pdf_text()


def _extract_from_docx(file_bytes: bytes) -> Optional[str]:
    try:
        from docx import Document
        import io
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs).strip()
    except ImportError:
        return _mock_pdf_text()


def _mock_pdf_text() -> str:
    """
    MOCK: Return placeholder text when PDF/DOCX parsing libraries aren't available.
    Install: pip install pypdf python-docx
    """
    return (
        "MOCK RESUME TEXT — pypdf/python-docx not installed.\n"
        "Install dependencies: pip install pypdf python-docx\n"
        "Candidate has relevant experience and technical skills."
    )


def extract_metadata(text: str) -> Dict[str, Any]:
    """
    Extract basic metadata from resume text (word count, estimated sections).
    """
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    words = text.split()
    
    # Detect common resume sections
    section_keywords = {
        'experience': ['experience', 'work history', 'employment'],
        'education': ['education', 'academic', 'qualification', 'degree'],
        'skills': ['skills', 'technologies', 'technical skills', 'competencies'],
        'projects': ['projects', 'portfolio', 'work samples'],
    }
    
    detected_sections = []
    text_lower = text.lower()
    for section, keywords in section_keywords.items():
        if any(kw in text_lower for kw in keywords):
            detected_sections.append(section)
    
    return {
        "word_count": len(words),
        "line_count": len(lines),
        "detected_sections": detected_sections,
        "char_count": len(text),
    }
