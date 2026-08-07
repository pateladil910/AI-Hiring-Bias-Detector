"""
AI Hiring Bias Detector — Test Generator Service
Phase 3: Generates aptitude test questions from a JD skill profile.

Strategy:
  - If ANTHROPIC_API_KEY is set and valid → call Claude API for dynamic, JD-tailored questions.
  - Otherwise → MOCK generator that produces topic-relevant questions based on
    the skill_profile tags (NOT a generic stub — actual useful questions per domain).

MOCK question bank covers: frontend, backend, data_science, devops, databases, general_engineering.
"""

import os
import json
import uuid
from typing import Dict, Any, List

# ─── MOCK Question Bank ────────────────────────────────────────────────────────
# Organised by skill domain. Each question has: type, question, options (MCQ),
# correct_index, topic, rubric_keywords (short answer).

MOCK_QUESTION_BANK: Dict[str, List[Dict]] = {
    "react": [
        {
            "type": "mcq",
            "question": "Which React hook is used to perform side effects in a functional component?",
            "options": ["useState", "useEffect", "useContext", "useReducer"],
            "correct_index": 1,
            "topic": "React Hooks",
        },
        {
            "type": "mcq",
            "question": "What does the virtual DOM in React primarily help with?",
            "options": [
                "Directly manipulating the real DOM for every change",
                "Minimising costly real DOM updates via efficient diffing",
                "Providing server-side rendering by default",
                "Replacing CSS styling with JavaScript objects",
            ],
            "correct_index": 1,
            "topic": "React Core Concepts",
        },
        {
            "type": "mcq",
            "question": "When should you use `useCallback` in React?",
            "options": [
                "To memoize the result of an expensive computation",
                "To memoize a function reference to prevent unnecessary re-renders",
                "To fetch data from an API on component mount",
                "To manage complex state transitions",
            ],
            "correct_index": 1,
            "topic": "React Performance",
        },
        {
            "type": "short_answer",
            "question": "Explain the difference between `useEffect` with an empty dependency array `[]` and with no dependency array at all.",
            "rubric_keywords": ["empty array", "once", "mount", "every render", "cleanup", "dependency"],
            "topic": "React Hooks",
        },
    ],
    "node.js": [
        {
            "type": "mcq",
            "question": "What is the event loop in Node.js responsible for?",
            "options": [
                "Compiling JavaScript to machine code",
                "Handling asynchronous callbacks in a non-blocking way",
                "Managing memory allocation for variables",
                "Providing multi-threading support",
            ],
            "correct_index": 1,
            "topic": "Node.js Architecture",
        },
        {
            "type": "mcq",
            "question": "Which module in Node.js is used to create an HTTP server?",
            "options": ["path", "fs", "http", "url"],
            "correct_index": 2,
            "topic": "Node.js Core Modules",
        },
        {
            "type": "short_answer",
            "question": "Explain the difference between `process.nextTick()` and `setImmediate()` in Node.js.",
            "rubric_keywords": ["event loop", "microtask", "I/O", "priority", "queue", "phase"],
            "topic": "Node.js Event Loop",
        },
    ],
    "javascript": [
        {
            "type": "mcq",
            "question": "What does the `typeof null` expression return in JavaScript?",
            "options": ["null", "undefined", "object", "boolean"],
            "correct_index": 2,
            "topic": "JavaScript Quirks",
        },
        {
            "type": "mcq",
            "question": "Which method creates a shallow copy of an array in JavaScript?",
            "options": ["Array.from(arr)", "arr.slice()", "arr.concat()", "All of the above"],
            "correct_index": 3,
            "topic": "JavaScript Arrays",
        },
        {
            "type": "mcq",
            "question": "What is a closure in JavaScript?",
            "options": [
                "A function that is immediately invoked",
                "A function that remembers variables from its outer scope even after the outer function has returned",
                "A method used to close a WebSocket connection",
                "A design pattern for singleton objects",
            ],
            "correct_index": 1,
            "topic": "JavaScript Closures",
        },
        {
            "type": "short_answer",
            "question": "Explain the difference between `==` and `===` in JavaScript. Give an example where they produce different results.",
            "rubric_keywords": ["type coercion", "strict equality", "loose equality", "type conversion", "example"],
            "topic": "JavaScript Operators",
        },
    ],
    "python": [
        {
            "type": "mcq",
            "question": "What is the output of `[i**2 for i in range(4)]` in Python?",
            "options": ["[1, 4, 9, 16]", "[0, 1, 4, 9]", "[0, 1, 2, 3]", "[1, 2, 3, 4]"],
            "correct_index": 1,
            "topic": "Python List Comprehensions",
        },
        {
            "type": "mcq",
            "question": "Which Python data structure is immutable?",
            "options": ["list", "dict", "set", "tuple"],
            "correct_index": 3,
            "topic": "Python Data Structures",
        },
        {
            "type": "mcq",
            "question": "What does the `*args` syntax do in a Python function definition?",
            "options": [
                "Accepts keyword arguments as a dictionary",
                "Accepts any number of positional arguments as a tuple",
                "Unpacks a list into positional arguments",
                "Defines a required argument",
            ],
            "correct_index": 1,
            "topic": "Python Functions",
        },
        {
            "type": "short_answer",
            "question": "Explain the difference between a Python `list` and a `generator`. When would you prefer a generator?",
            "rubric_keywords": ["lazy evaluation", "memory", "iterator", "yield", "large data", "performance"],
            "topic": "Python Iterables",
        },
    ],
    "sql": [
        {
            "type": "mcq",
            "question": "Which SQL clause is used to filter records AFTER a GROUP BY?",
            "options": ["WHERE", "FILTER", "HAVING", "ORDER BY"],
            "correct_index": 2,
            "topic": "SQL Aggregation",
        },
        {
            "type": "mcq",
            "question": "What type of JOIN returns all rows from the left table even if there is no match in the right table?",
            "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
            "correct_index": 1,
            "topic": "SQL Joins",
        },
        {
            "type": "short_answer",
            "question": "Explain the difference between a clustered and a non-clustered index in a relational database.",
            "rubric_keywords": ["physical order", "data rows", "pointer", "primary key", "lookup", "performance"],
            "topic": "SQL Indexing",
        },
    ],
    "data_structures": [
        {
            "type": "mcq",
            "question": "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correct_index": 1,
            "topic": "Trees",
        },
        {
            "type": "mcq",
            "question": "Which data structure uses LIFO (Last In, First Out) ordering?",
            "options": ["Queue", "Stack", "Heap", "Linked List"],
            "correct_index": 1,
            "topic": "Linear Data Structures",
        },
        {
            "type": "mcq",
            "question": "What is the average time complexity of a HashMap (Hash Table) lookup?",
            "options": ["O(log n)", "O(n)", "O(1)", "O(n²)"],
            "correct_index": 2,
            "topic": "Hash Tables",
        },
        {
            "type": "short_answer",
            "question": "Explain the concept of dynamic programming. How does memoization differ from tabulation?",
            "rubric_keywords": ["overlapping subproblems", "optimal substructure", "top-down", "bottom-up", "cache", "state"],
            "topic": "Dynamic Programming",
        },
    ],
    "devops": [
        {
            "type": "mcq",
            "question": "What is the primary purpose of a Dockerfile?",
            "options": [
                "To orchestrate multiple containers",
                "To define instructions for building a Docker image",
                "To configure network settings for Docker",
                "To manage Docker container volumes",
            ],
            "correct_index": 1,
            "topic": "Docker",
        },
        {
            "type": "mcq",
            "question": "In CI/CD, what does 'CD' most commonly stand for?",
            "options": [
                "Code Deployment",
                "Continuous Delivery / Continuous Deployment",
                "Container Distribution",
                "Centralised Development",
            ],
            "correct_index": 1,
            "topic": "CI/CD",
        },
    ],
    "general": [
        {
            "type": "mcq",
            "question": "What does REST stand for in the context of APIs?",
            "options": [
                "Representational State Transfer",
                "Remote Execution Service Technology",
                "Request-Response Standard Transfer",
                "Real-time Event Streaming Technology",
            ],
            "correct_index": 0,
            "topic": "API Design",
        },
        {
            "type": "mcq",
            "question": "Which HTTP status code indicates a successful resource creation?",
            "options": ["200 OK", "201 Created", "204 No Content", "202 Accepted"],
            "correct_index": 1,
            "topic": "HTTP Protocol",
        },
        {
            "type": "mcq",
            "question": "What is the SOLID principle 'S' (Single Responsibility Principle)?",
            "options": [
                "A class should only have one instance",
                "A class should have only one reason to change",
                "A system should have a single entry point",
                "A function should only call one other function",
            ],
            "correct_index": 1,
            "topic": "Software Design Principles",
        },
        {
            "type": "short_answer",
            "question": "Describe the difference between horizontal scaling and vertical scaling. Which approach is generally preferred for cloud-native applications and why?",
            "rubric_keywords": ["horizontal", "more servers", "vertical", "bigger machine", "cloud", "stateless", "availability", "cost"],
            "topic": "System Design",
        },
    ],
}

# Mapping of skill_profile tech_stack tags → question bank keys
SKILL_TAG_MAP = {
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "node": "node.js",
    "node.js": "node.js",
    "nodejs": "node.js",
    "express": "node.js",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "javascript",
    "ts": "javascript",
    "python": "python",
    "fastapi": "python",
    "django": "python",
    "flask": "python",
    "sql": "sql",
    "postgresql": "sql",
    "mysql": "sql",
    "sqlite": "sql",
    "algorithms": "data_structures",
    "data_structures": "data_structures",
    "dsa": "data_structures",
    "docker": "devops",
    "kubernetes": "devops",
    "ci/cd": "devops",
    "devops": "devops",
}


def _pick_questions(pool: List[Dict], n: int) -> List[Dict]:
    """Pick up to n questions from pool, cycling if pool is smaller than n."""
    if not pool:
        return []
    selected = []
    idx = 0
    while len(selected) < n:
        selected.append(pool[idx % len(pool)])
        idx += 1
    return selected[:n]


def generate_questions_mock(
    skill_profile: Dict[str, Any],
    num_mcq: int = 10,
    num_short_answer: int = 2,
) -> Dict[str, Any]:
    """
    MOCK generator: produces topic-relevant questions from skill_profile.
    Falls back to general engineering questions if no tags match.
    """
    tech_stack: List[str] = skill_profile.get("tech_stack", [])
    primary_field: str = skill_profile.get("primary_field", "general")

    # Resolve bank keys from tech_stack tags
    bank_keys = []
    for tag in tech_stack:
        key = SKILL_TAG_MAP.get(tag.lower().strip())
        if key and key not in bank_keys:
            bank_keys.append(key)

    # Fallback: use primary_field
    if not bank_keys:
        field_map = {
            "frontend": ["javascript", "react"],
            "backend": ["node.js", "python", "sql"],
            "fullstack": ["javascript", "react", "node.js", "sql"],
            "data_science": ["python", "sql", "data_structures"],
            "devops": ["devops", "general"],
        }
        bank_keys = field_map.get(primary_field, ["general", "data_structures"])

    # Always append general + data_structures as filler
    for filler in ["general", "data_structures"]:
        if filler not in bank_keys:
            bank_keys.append(filler)

    # Build MCQ pool and short-answer pool from resolved banks
    mcq_pool = []
    sa_pool = []
    for key in bank_keys:
        for q in MOCK_QUESTION_BANK.get(key, []):
            if q["type"] == "mcq" and len(mcq_pool) < num_mcq * 3:
                mcq_pool.append(q)
            elif q["type"] == "short_answer" and len(sa_pool) < num_short_answer * 3:
                sa_pool.append(q)

    selected_mcq = _pick_questions(mcq_pool, num_mcq)
    selected_sa = _pick_questions(sa_pool, num_short_answer)

    # Assign unique IDs and build final question list
    questions = []
    for i, q in enumerate(selected_mcq + selected_sa):
        questions.append({
            "id": f"q{i + 1}_{uuid.uuid4().hex[:6]}",
            "type": q["type"],
            "question": q["question"],
            "topic": q.get("topic", "General"),
            "options": q.get("options"),                     # MCQ only
            "correct_index": q.get("correct_index"),         # MCQ only — stripped before sending to candidate
            "rubric_keywords": q.get("rubric_keywords"),     # Short-answer only — server-side only
        })

    return {
        "questions": questions,
        "num_mcq": len(selected_mcq),
        "num_short_answer": len(selected_sa),
        "topics_covered": list({q["topic"] for q in questions}),
        "model_version": "mock-v1",
    }


def generate_questions_claude(
    skill_profile: Dict[str, Any],
    num_mcq: int = 10,
    num_short_answer: int = 2,
) -> Dict[str, Any]:
    """
    Claude API generator — called if ANTHROPIC_API_KEY is present.
    Builds a rich, JD-specific test using Claude claude-3-5-haiku-20241022.
    Falls back to MOCK on any error.
    """
    try:
        import anthropic  # type: ignore

        client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

        prompt = f"""You are an expert technical recruiter creating a fair, bias-free aptitude test.

Skill Profile of the Job:
{json.dumps(skill_profile, indent=2)}

Generate exactly {num_mcq} multiple-choice questions and {num_short_answer} short-answer questions
based ONLY on the technical skills listed in the profile above.

Rules:
- Questions must be technical and directly relevant to the tech_stack and primary_field.
- MCQ: 4 options, exactly one correct. Plausible distractors.
- Short-answer: open-ended, should take 3-5 sentences to answer well.
- Do NOT ask anything that could reveal age, gender, ethnicity, or personal background.
- Return ONLY a valid JSON array (no markdown) with this structure:
[
  {{
    "type": "mcq",
    "question": "...",
    "topic": "...",
    "options": ["A", "B", "C", "D"],
    "correct_index": 1,
    "rubric_keywords": null
  }},
  {{
    "type": "short_answer",
    "question": "...",
    "topic": "...",
    "options": null,
    "correct_index": null,
    "rubric_keywords": ["keyword1", "keyword2", "keyword3"]
  }}
]"""

        message = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = message.content[0].text.strip()
        # Strip markdown code fence if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        parsed: List[Dict] = json.loads(raw)

        questions = []
        for i, q in enumerate(parsed):
            questions.append({
                "id": f"q{i + 1}_{uuid.uuid4().hex[:6]}",
                "type": q.get("type", "mcq"),
                "question": q.get("question", ""),
                "topic": q.get("topic", "General"),
                "options": q.get("options"),
                "correct_index": q.get("correct_index"),
                "rubric_keywords": q.get("rubric_keywords"),
            })

        mcq_count = sum(1 for q in questions if q["type"] == "mcq")
        sa_count = sum(1 for q in questions if q["type"] == "short_answer")

        return {
            "questions": questions,
            "num_mcq": mcq_count,
            "num_short_answer": sa_count,
            "topics_covered": list({q["topic"] for q in questions}),
            "model_version": "claude-3-5-haiku-20241022",
        }

    except Exception as e:
        print(f"[TEST_GENERATOR] Claude API failed, falling back to MOCK: {e}")
        return generate_questions_mock(skill_profile, num_mcq, num_short_answer)


def generate_questions(
    skill_profile: Dict[str, Any],
    num_mcq: int = 10,
    num_short_answer: int = 2,
) -> Dict[str, Any]:
    """
    Main entry point. Uses Claude if API key present, else MOCK.
    """
    if os.environ.get("ANTHROPIC_API_KEY") and os.environ["ANTHROPIC_API_KEY"] not in (
        "your_claude_api_key_here", "", "YOUR_KEY_HERE"
    ):
        return generate_questions_claude(skill_profile, num_mcq, num_short_answer)
    return generate_questions_mock(skill_profile, num_mcq, num_short_answer)
