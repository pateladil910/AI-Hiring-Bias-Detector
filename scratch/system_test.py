"""
FairHire — Automated End-to-End System Test Suite
Tests all 8 Phases across AI Microservice, Backend API, and Database.
"""

import sys
import time
import requests
import json

AI_SERVICE_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:5000"

PASSED = 0
FAILED = 0


def log_test(name, success, details=""):
    global PASSED, FAILED
    if success:
        PASSED += 1
        print(f"  ✅ PASS: {name}")
    else:
        FAILED += 1
        print(f"  ❌ FAIL: {name} — {details}")


print("================================================================")
print("🚀 FAIRHIRE — AUTOMATED SYSTEM TESTING SUITE")
print("================================================================\n")

# ─── 1. AI Microservice Health & Capabilities ──────────────────────────────────
print("📦 TEST SUITE 1: AI Microservice Direct Endpoints (:8000)")
try:
    # Health
    r = requests.get(f"{AI_SERVICE_URL}/health", timeout=5)
    log_test("AI Service Health Check", r.status_code == 200 and r.json().get("status") == "ok")

    # Phase 1: JD Bias Scan
    jd_payload = {
        "text": "We need a rockstar ninja developer who is a native English speaker to dominate in our fast-paced team."
    }
    r = requests.post(f"{AI_SERVICE_URL}/analyze/jd", json=jd_payload, timeout=10)
    data = r.json()
    log_test(
        "Phase 1: JD Bias Analysis",
        r.status_code == 200 and data.get("score") is not None and len(data.get("flags", [])) > 0,
        f"Score: {data.get('score')}, Flags: {len(data.get('flags', []))}"
    )

    # Phase 2: Resume Anonymization
    resume_payload = {
        "application_id": "test-app-001",
        "resume_text": "John Doe. Phone: +1-555-0199. Email: john.doe@example.com. Address: 123 Main St, New York. Skilled in React, Node.js, Python, SQL.",
        "anonymised": True
    }
    r = requests.post(f"{AI_SERVICE_URL}/analyze/resume/text", json=resume_payload, timeout=10)
    res_data = r.json()
    anonymised_text = res_data.get("anonymised_text", "")
    has_no_name = "John Doe" not in anonymised_text
    has_no_email = "john.doe@example.com" not in anonymised_text
    log_test(
        "Phase 2: Resume PII Anonymization",
        r.status_code == 200 and has_no_name and has_no_email,
        f"PII stripped: Name masked? {has_no_name}, Email masked? {has_no_email}"
    )

    # Phase 3: Test Generation & Grading
    gen_payload = {
        "job_id": "test-job-001",
        "skill_profile": {"tech_stack": ["react", "node.js", "sql"]},
        "num_mcq": 4,
        "num_short_answer": 1
    }
    r = requests.post(f"{AI_SERVICE_URL}/generate/test", json=gen_payload, timeout=10)
    gen_data = r.json()
    questions = gen_data.get("questions", [])
    log_test(
        "Phase 3: Skill-Tailored Test Generation",
        r.status_code == 200 and len(questions) > 0,
        f"Questions generated: {len(questions)}"
    )

    # Grade test
    if questions:
        grade_payload = {
            "test_id": "test-001",
            "questions": questions,
            "answers": [{"question_id": questions[0]["id"], "selected_index": 0}]
        }
        r = requests.post(f"{AI_SERVICE_URL}/grade", json=grade_payload, timeout=10)
        grade_data = r.json()
        log_test(
            "Phase 3: Automated Test Grader",
            r.status_code == 200 and grade_data.get("auto_score") is not None,
            f"Auto score: {grade_data.get('auto_score')}"
        )

    # Phase 4: Eligibility Engine (Objective thresholds)
    elig_payload = {
        "application_id": "app-001",
        "test_score": 85.0,
        "resume_skill_match": 0.75,
        "llm_confidence": 1.0
    }
    r = requests.post(f"{AI_SERVICE_URL}/eligibility", json=elig_payload, timeout=10)
    elig_data = r.json()
    log_test(
        "Phase 4: Objective Eligibility Engine (Eligible Case)",
        r.status_code == 200 and elig_data.get("verdict") == "eligible" and len(elig_data.get("explanation", "")) > 10,
        f"Verdict: {elig_data.get('verdict')}, Explanation: {elig_data.get('explanation')}"
    )

    # Borderline case -> needs_review
    border_payload = {
        "application_id": "app-002",
        "test_score": 55.0,
        "resume_skill_match": 0.50,
        "llm_confidence": 0.9
    }
    r = requests.post(f"{AI_SERVICE_URL}/eligibility", json=border_payload, timeout=10)
    border_data = r.json()
    log_test(
        "Phase 4: Borderline Score -> Needs Review Routing",
        r.status_code == 200 and border_data.get("verdict") == "needs_review",
        f"Verdict: {border_data.get('verdict')}"
    )

    # Phase 5: AI Chatbot Assistant
    chat_payload = {
        "role": "candidate",
        "message": "How does blind screening protect my privacy?"
    }
    r = requests.post(f"{AI_SERVICE_URL}/chatbot/message", json=chat_payload, timeout=10)
    chat_data = r.json()
    log_test(
        "Phase 5: Contextual AI Chatbot Assistant",
        r.status_code == 200 and len(chat_data.get("reply", "")) > 20 and len(chat_data.get("suggestions", [])) > 0,
        f"Suggestions returned: {len(chat_data.get('suggestions', []))}"
    )

except Exception as e:
    log_test("AI Microservice Connection", False, str(e))

print()

# ─── 2. Backend API & Database End-to-End Workflow ─────────────────────────────
print("🌐 TEST SUITE 2: Backend API & End-to-End Database Workflows (:5000)")
try:
    # Backend Health
    r = requests.get(f"{BACKEND_URL}/health", timeout=5)
    log_test("Backend Service Health Check", r.status_code == 200 and r.json().get("status") == "ok")

    timestamp = int(time.time())
    recruiter_email = f"recruiter_{timestamp}@test.com"
    candidate_email = f"candidate_{timestamp}@test.com"
    password = "Password123!"

    # 1. Register Recruiter
    r = requests.post(f"{BACKEND_URL}/api/auth/register", json={
        "firstName": "Alice",
        "lastName": "Recruiter",
        "email": recruiter_email,
        "password": password,
        "role": "recruiter",
        "orgName": "TechCorp Global"
    }, timeout=10)
    recruiter_auth = r.json()
    recruiter_token = recruiter_auth.get("token")
    log_test("Auth: Register Recruiter", r.status_code in (200, 201) and recruiter_token is not None)

    # 2. Register Candidate
    r = requests.post(f"{BACKEND_URL}/api/auth/register", json={
        "firstName": "Bob",
        "lastName": "Applicant",
        "email": candidate_email,
        "password": password,
        "role": "candidate"
    }, timeout=10)
    candidate_auth = r.json()
    candidate_token = candidate_auth.get("token")
    log_test("Auth: Register Candidate", r.status_code in (200, 201) and candidate_token is not None)

    recruiter_headers = {"Authorization": f"Bearer {recruiter_token}"}
    candidate_headers = {"Authorization": f"Bearer {candidate_token}"}

    # 3. Create Job (Recruiter)
    job_payload = {
        "title": f"Full Stack Engineer ({timestamp})",
        "rawText": "We are seeking a collaborative Full Stack Developer with strong React, Node.js, SQL, and Python proficiency."
    }
    r = requests.post(f"{BACKEND_URL}/api/jobs", json=job_payload, headers=recruiter_headers, timeout=10)
    job_data = r.json().get("job", {})
    job_id = job_data.get("id")
    log_test("Jobs: Create Job Description", r.status_code in (200, 201) and job_id is not None)

    # 4. Analyze and Publish Job
    if job_id:
        r = requests.post(f"{BACKEND_URL}/api/jobs/{job_id}/analyze", headers=recruiter_headers, timeout=10)
        analyzed_job = r.json().get("job", {})
        log_test("Jobs: Analyze Job Bias", r.status_code == 200 and analyzed_job.get("biasScore") is not None)

        r = requests.patch(f"{BACKEND_URL}/api/jobs/{job_id}/publish", headers=recruiter_headers, timeout=10)
        published_job = r.json().get("job", {})
        log_test("Jobs: Publish Job", r.status_code == 200 and published_job.get("status") == "published")

        # 5. Candidate Applies with Resume
        r = requests.post(f"{BACKEND_URL}/api/applications", data={
            "jobId": job_id,
            "coverLetter": "Excited to apply!"
        }, files={
            "resume": ("resume.txt", b"Bob Applicant. Email: bob@test.com. Phone: 555-1234. Experienced React and Node.js developer.", "text/plain")
        }, headers=candidate_headers, timeout=10)
        app_data = r.json().get("application", {})
        app_id = app_data.get("id")
        log_test("Applications: Candidate Apply with Resume Upload", r.status_code in (200, 201) and app_id is not None)

        # 6. Recruiter Views Candidates (Strict Blind Screening Check - ZERO PII)
        r = requests.get(f"{BACKEND_URL}/api/applications/job/{job_id}", headers=recruiter_headers, timeout=10)
        apps_list = r.json().get("applications", [])
        has_pii = any("bob" in str(a).lower() or "candidate_email" in str(a).lower() for a in apps_list)
        log_test(
            "Privacy Rule: Zero PII Exposed in Recruiter Candidate View",
            r.status_code == 200 and not has_pii and len(apps_list) > 0,
            f"Applicants found: {len(apps_list)}, PII leaked: {has_pii}"
        )

        # 7. Recruiter Generates Aptitude Test
        if app_id:
            r = requests.post(f"{BACKEND_URL}/api/tests/generate/{app_id}", headers=recruiter_headers, timeout=10)
            test_info = r.json().get("test", {})
            test_id = test_info.get("id")
            log_test("Tests: Recruiter Generates Test", r.status_code in (200, 201) and test_id is not None)

            # 8. Candidate Fetches Test (Verify correct_index is stripped)
            if test_id:
                r = requests.get(f"{BACKEND_URL}/api/tests/{test_id}", headers=candidate_headers, timeout=10)
                cand_test = r.json().get("test", {})
                cand_questions = cand_test.get("questions", [])
                correct_answers_leaked = any("correct_index" in q or "rubric_keywords" in q for q in cand_questions)
                log_test(
                    "Security Rule: Correct Answers Stripped for Candidate",
                    r.status_code == 200 and not correct_answers_leaked and len(cand_questions) > 0,
                    f"Questions returned: {len(cand_questions)}, Answers leaked: {correct_answers_leaked}"
                )

                # 9. Candidate Submits Test
                answers = [{"question_id": q["id"], "selected_index": 0} for q in cand_questions if q.get("type") == "mcq"]
                r = requests.post(f"{BACKEND_URL}/api/tests/{test_id}/submit", json={"answers": answers}, headers=candidate_headers, timeout=10)
                submission = r.json().get("submission", {})
                log_test("Tests: Candidate Submits Test Answers", r.status_code in (200, 201) and submission.get("autoScore") is not None)

                # 10. Recruiter Computes AI Eligibility
                r = requests.post(f"{BACKEND_URL}/api/eligibility/compute/{app_id}", headers=recruiter_headers, timeout=10)
                verdict_res = r.json().get("verdict", {})
                verdict_id = verdict_res.get("id")
                log_test(
                    "Eligibility: Compute AI Verdict with Plain-English Explanation",
                    r.status_code in (200, 201) and verdict_res.get("verdict") is not None and len(verdict_res.get("explanation", "")) > 10,
                    f"Verdict: {verdict_res.get('verdict')}"
                )

                # 11. Recruiter Overrides Verdict (Recorded in Audit Trail)
                if verdict_id:
                    r = requests.patch(f"{BACKEND_URL}/api/eligibility/{verdict_id}/override", json={
                        "newVerdict": "eligible",
                        "reason": "Exceptional portfolio reviewed and approved by engineering lead."
                    }, headers=recruiter_headers, timeout=10)
                    log_test("Eligibility: Human Override with Mandatory Reason", r.status_code == 200 and r.json().get("verdict", {}).get("verdict") == "eligible")

    # 12. Audit Trail Verification
    r = requests.get(f"{BACKEND_URL}/api/audit", headers=recruiter_headers, timeout=10)
    audit_data = r.json()
    logs_count = len(audit_data.get("logs", []))
    log_test("Audit: Fetch Filterable Audit Trail Logs", r.status_code == 200 and logs_count > 0, f"Logged events: {logs_count}")

    r = requests.get(f"{BACKEND_URL}/api/audit/stats", headers=recruiter_headers, timeout=10)
    stats_data = r.json()
    log_test("Audit: Fetch Audit Statistics", r.status_code == 200 and stats_data.get("totalLogs", 0) > 0)

    # 13. Analytics & Dashboard KPIs
    r = requests.get(f"{BACKEND_URL}/api/analytics/dashboard", headers=recruiter_headers, timeout=10)
    dashboard_data = r.json()
    kpis = dashboard_data.get("kpis", {})
    funnel = dashboard_data.get("pipelineFunnel", {})
    log_test(
        "Analytics: Live Dashboard KPI Calculation",
        r.status_code == 200 and kpis.get("totalJobs", 0) > 0 and funnel.get("applied") is not None,
        f"Jobs: {kpis.get('totalJobs')}, Apps: {kpis.get('totalApplications')}"
    )

    # 14. Chatbot Session & Messaging
    r = requests.post(f"{BACKEND_URL}/api/chatbot/session", headers=candidate_headers, timeout=10)
    sess_id = r.json().get("session", {}).get("id")
    log_test("Chatbot: Initialize User Session", r.status_code == 200 and sess_id is not None)

    if sess_id:
        r = requests.post(f"{BACKEND_URL}/api/chatbot/session/{sess_id}/message", json={
            "message": "Explain the blind hiring process."
        }, headers=candidate_headers, timeout=10)
        chat_msg = r.json()
        log_test(
            "Chatbot: Send Message and Persist History",
            r.status_code == 200 and chat_msg.get("assistantMessage", {}).get("content") is not None
        )

except Exception as e:
    log_test("Backend API & Database Workflows", False, str(e))

print("\n================================================================")
print(f"📊 FINAL TEST RESULTS: {PASSED} PASSED | {FAILED} FAILED")
print("================================================================")

if FAILED == 0:
    print("🎉 ALL SYSTEM TESTS PASSED SUCCESSFULLY!")
    sys.exit(0)
else:
    print(f"⚠️ {FAILED} TESTS FAILED.")
    sys.exit(1)
