import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  Briefcase,
  Wallet,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  Send,
  Lock,
  Clock,
  Eye,
  Code2,
  Users,
  Wand2,
  AlertTriangle,
  Save,
  MapPin,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { jobsAPI } from "../../lib/api";

/* ------------------------------------------------------------------ */
/*  Inclusive-language rules (used for the inline bias check)          */
/* ------------------------------------------------------------------ */
const BIAS_RULES = [
  { term: "ninja", fix: "expert", why: "Informal, masculine-coded" },
  { term: "rockstar", fix: "high performer", why: "Masculine-coded" },
  { term: "guru", fix: "specialist", why: "Informal jargon" },
  { term: "wizard", fix: "specialist", why: "Informal jargon" },
  { term: "aggressive", fix: "proactive", why: "Masculine-coded" },
  { term: "dominant", fix: "influential", why: "Masculine-coded" },
  { term: "competitive", fix: "motivated", why: "Masculine-coded" },
  { term: "fearless", fix: "confident", why: "Masculine-coded" },
  { term: "digital native", fix: "comfortable with digital tools", why: "Age bias" },
  { term: "young", fix: "early-career", why: "Age bias" },
  { term: "energetic", fix: "motivated", why: "Age bias" },
  { term: "recent graduate", fix: "early-career candidate", why: "Age bias" },
  { term: "culture fit", fix: "values alignment", why: "Encourages sameness" },
  { term: "work hard, play hard", fix: "we value a healthy balance", why: "Exclusionary culture cue" },
  { term: "manpower", fix: "workforce", why: "Gendered" },
  { term: "salesman", fix: "salesperson", why: "Gendered" },
  { term: "guys", fix: "team", why: "Gendered" },
  { term: "he or she", fix: "they", why: "Excludes non-binary people" },
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ruleRe = (term) => new RegExp(`\\b${escapeRe(term)}\\b`, "gi");

function analyseText(text) {
  if (!text) return [];
  const found = [];
  BIAS_RULES.forEach((r) => {
    const m = text.match(ruleRe(r.term));
    if (m) found.push({ ...r, count: m.length });
  });
  return found;
}

const SKILL_SUGGESTIONS = ["React", "Node.js", "Python", "SQL", "System design", "TypeScript", "AWS", "Docker", "Go", "TailwindCSS"];
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */
function Field({ label, optional, error, hint, children, htmlFor }) {
  return (
    <div className="pj-field">
      <label htmlFor={htmlFor} className="pj-label">
        {label} {optional && <span className="pj-optional">(Optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="pj-error" role="alert">{error}</p>
      ) : hint ? (
        <p className="pj-hint">{hint}</p>
      ) : null}
    </div>
  );
}

function Toggle({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <div className={`pj-toggle ${checked ? "on" : ""}`}>
      <span className="pj-toggle-icon"><Icon size={18} /></span>
      <div className="pj-toggle-text">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className={`pj-switch ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

function Section({ icon: Icon, kicker, title, sub, children }) {
  return (
    <section className="pj-card pj-section">
      <div className="pj-sec-head">
        <div className="pj-kicker"><Icon size={16} /> {kicker}</div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component: PostJob / JobCreate with Backend Sync             */
/* ------------------------------------------------------------------ */
export default function JobCreate({ onBack }) {
  const navigate = useNavigate();
  const { id: jobId } = useParams();
  const { user } = useAuth();

  const companyName = user?.companyName || user?.orgName || (user?.email ? user.email.split("@")[1].split(".")[0].toUpperCase() + " Inc." : "Acme Technologies Inc.");

  const [form, setForm] = useState({
    title: "",
    department: "Engineering",
    level: "Mid-level",
    employmentType: "Full-time",
    workMode: "Hybrid",
    location: "",
    currency: "USD",
    salaryMin: "",
    salaryMax: "",
    openings: 1,
    deadline: "",
    description: "",
    blindMask: true,
    biasCheck: true,
    sandbox: false,
    audit: true,
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [published, setPublished] = useState(null);
  const [savedJobId, setSavedJobId] = useState(jobId || null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(Boolean(jobId));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/recruiter/jobs");
    }
  };

  /* Fetch existing job if in edit mode */
  useEffect(() => {
    if (jobId) {
      setLoadingInitial(true);
      jobsAPI
        .get(jobId)
        .then(({ data }) => {
          const j = data.job;
          if (j) {
            setForm({
              title: j.title || "",
              department: j.department || "Engineering",
              level: j.level || "Mid-level",
              employmentType: j.employmentType || "Full-time",
              workMode: j.workMode || "Hybrid",
              location: j.location || "",
              currency: j.currency || "USD",
              salaryMin: j.salaryMin || "",
              salaryMax: j.salaryMax || "",
              openings: j.openings || 1,
              deadline: j.deadline || "",
              description: j.rawText || j.description || "",
              blindMask: j.fairnessSettings?.blindMask !== false,
              biasCheck: j.fairnessSettings?.biasCheck !== false,
              sandbox: Boolean(j.fairnessSettings?.sandbox),
              audit: j.fairnessSettings?.audit !== false,
            });
            if (Array.isArray(j.skills) && j.skills.length > 0) {
              setSkills(j.skills);
            } else if (j.skillProfileJson?.required_skills) {
              setSkills(j.skillProfileJson.required_skills);
            }
            setSavedJobId(j.id);
            if (j.status === "published") {
              setDraftSaved(true);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load job for editing", err);
          setServerError("Failed to load job details. Please try again.");
        })
        .finally(() => {
          setLoadingInitial(false);
        });
    }
  }, [jobId]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setDraftSaved(false);
    setServerError("");
  };

  /* inline bias analysis */
  const flagged = useMemo(
    () => analyseText(`${form.title}\n${form.description}`),
    [form.title, form.description]
  );
  const totalFlags = flagged.reduce((n, f) => n + f.count, 0);
  const hasText = form.description.trim().length > 20;
  const score = hasText ? Math.max(40, 100 - totalFlags * 12) : null;

  const fixAll = () => {
    let d = form.description;
    let t = form.title;
    flagged.forEach((r) => {
      d = d.replace(ruleRe(r.term), r.fix);
      t = t.replace(ruleRe(r.term), r.fix);
    });
    setForm((f) => ({ ...f, description: d, title: t }));
  };

  /* skills */
  const addSkill = (raw) => {
    const s = raw.trim().replace(/,$/, "");
    if (!s || skills.some((x) => x.toLowerCase() === s.toLowerCase()) || skills.length >= 12) return;
    setSkills([...skills, s]);
    setSkillInput("");
  };

  const onSkillKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length) {
      setSkills(skills.slice(0, -1));
    }
  };

  /* completion progress */
  const progress = useMemo(() => {
    const checks = [
      form.title.trim().length >= 3,
      form.workMode === "Remote" || form.location.trim().length > 0,
      Number(form.salaryMin) > 0 && Number(form.salaryMax) >= Number(form.salaryMin),
      form.description.trim().length >= 50,
      skills.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, skills]);

  /* validation */
  const validate = () => {
    const e = {};
    if (form.title.trim().length < 3) e.title = "Enter a job title of at least 3 characters.";
    if (form.workMode !== "Remote" && !form.location.trim()) e.location = "Add a city or office location.";
    const min = Number(form.salaryMin);
    const max = Number(form.salaryMax);
    if (!form.salaryMin || !form.salaryMax) e.salary = "Enter a salary range. Pay transparency is required in many regions.";
    else if (min > max) e.salary = "Minimum salary can't be higher than the maximum.";
    if (form.description.trim().length < 50) e.description = "Describe the role in at least 50 characters.";
    if (skills.length === 0) e.skills = "Add at least one required skill.";
    if (form.deadline && form.deadline < todayISO()) e.deadline = "Pick a deadline that is today or later.";
    return e;
  };

  /* Save draft to backend */
  const saveDraft = async () => {
    if (!form.title.trim()) {
      setErrors({ title: "Please provide at least a job title to save a draft." });
      return;
    }
    setSubmitting(true);
    setServerError("");
    try {
      const payload = {
        title: form.title,
        department: form.department,
        level: form.level,
        employmentType: form.employmentType,
        workMode: form.workMode,
        location: form.location,
        currency: form.currency,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
        openings: form.openings ? Number(form.openings) : 1,
        deadline: form.deadline,
        rawText: form.description,
        description: form.description,
        skills,
        fairnessSettings: {
          blindMask: form.blindMask,
          biasCheck: form.biasCheck,
          sandbox: form.sandbox,
          audit: form.audit,
        },
        companyName,
        biasScore: score !== null ? score : null,
        status: "draft",
      };

      if (savedJobId) {
        await jobsAPI.update(savedJobId, payload);
      } else {
        const { data } = await jobsAPI.create(payload);
        if (data.job?.id) {
          setSavedJobId(data.job.id);
          window.history.replaceState(null, "", `/recruiter/jobs/${data.job.id}/edit`);
        }
      }
      setDraftSaved(true);
    } catch (err) {
      setServerError(err.response?.data?.error?.message || "Failed to save draft. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Publish job to backend */
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector(".pj-input.invalid, .pj-tags.invalid");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const computedScore = score !== null ? score : 92;
      const payload = {
        title: form.title,
        department: form.department,
        level: form.level,
        employmentType: form.employmentType,
        workMode: form.workMode,
        location: form.location,
        currency: form.currency,
        salaryMin: Number(form.salaryMin),
        salaryMax: Number(form.salaryMax),
        openings: Number(form.openings) || 1,
        deadline: form.deadline,
        rawText: form.description,
        description: form.description,
        skills,
        fairnessSettings: {
          blindMask: form.blindMask,
          biasCheck: form.biasCheck,
          sandbox: form.sandbox,
          audit: form.audit,
        },
        companyName,
        biasScore: computedScore,
        status: "published",
      };

      let finalJob;
      if (savedJobId) {
        const { data } = await jobsAPI.update(savedJobId, payload);
        finalJob = data.job;
      } else {
        const { data } = await jobsAPI.create(payload);
        finalJob = data.job;
      }

      const displayId = finalJob?.id ? `FH-${finalJob.id.slice(0, 6).toUpperCase()}` : `FH-${Math.floor(100000 + Math.random() * 900000)}`;

      setPublished({
        id: displayId,
        rawId: finalJob?.id,
        title: form.title,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Job publish error:", err);
      setServerError(err.response?.data?.error?.message || "Failed to publish job. Please review your entries.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setPublished(null);
    setSavedJobId(null);
    setSkills([]);
    setErrors({});
    setForm({
      title: "",
      department: "Engineering",
      level: "Mid-level",
      employmentType: "Full-time",
      workMode: "Hybrid",
      location: "",
      currency: "USD",
      salaryMin: "",
      salaryMax: "",
      openings: 1,
      deadline: "",
      description: "",
      blindMask: true,
      biasCheck: true,
      sandbox: false,
      audit: true,
    });
    window.history.replaceState(null, "", "/recruiter/jobs/new");
  };

  const cls = (k) => `pj-input ${errors[k] ? "invalid" : ""}`;

  if (loadingInitial) {
    return (
      <div className="pj-root" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center" }}>
          <div className="pj-logo" style={{ margin: "0 auto 16px" }}>
            <ShieldCheck size={28} />
          </div>
          <p style={{ color: "#64748b", fontWeight: 600 }}>Loading job posting details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pj-root">
      <style>{CSS}</style>

      {/* ---------------- Header ---------------- */}
      <header className="pj-header">
        <div className="pj-container pj-header-in">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }} className="pj-brand">
            <span className="pj-logo"><ShieldCheck size={26} /></span>
            <span className="pj-wordmark">Fair<b>Hire</b></span>
            <span className="pj-badge">ENTERPRISE</span>
          </Link>
          <div className="pj-header-right">
            <span className="pj-muted pj-hide-sm">
              Hiring as <strong>{companyName}</strong>
            </span>
            <button type="button" className="pj-btn-outline" onClick={handleBack}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
        </div>
        {!published && (
          <div
            className="pj-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Form completion"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      <main className="pj-container pj-narrow">
        {/* ---------------- Hero ---------------- */}
        <section className="pj-hero">
          <span className="pj-pill"><Sparkles size={14} /> BLIND-HIRING JOB POST</span>
          <h1>{jobId ? "Edit Job Posting" : "Post a New Role"}</h1>
          <p>
            Publish a job that attracts every qualified candidate. Applicant identity is masked, your wording
            is checked for bias, and the posting stays audit-ready for NYC Local Law 144.
          </p>
        </section>

        {serverError && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              fontSize: "14.5px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertTriangle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {published ? (
          <div className="pj-card pj-success">
            <span className="pj-success-icon"><CheckCircle2 size={38} /></span>
            <h2>Job published successfully</h2>
            <p>
              <strong>{published.title}</strong> is now live in your redacted candidate pool and public listings. Applicants will
              appear with names, photos, and demographic markers masked.
            </p>
            <div className="pj-jobid">Reference ID <code>{published.id}</code></div>
            <div className="pj-row">
              <button className="pj-btn-primary pj-auto" onClick={reset}>
                <Plus size={18} /> Post another role
              </button>
              <button className="pj-btn-outline" onClick={handleBack}>
                View in dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="pj-stack">
            {/* Role details */}
            <Section
              icon={Briefcase}
              kicker="Role Details"
              title="What are you hiring for?"
              sub="Use a clear, standard title. Avoid slang like “ninja” or “rockstar”."
            >
              <Field label="Job Title" error={errors.title} htmlFor="title">
                <input
                  id="title"
                  className={cls("title")}
                  value={form.title}
                  onChange={set("title")}
                  placeholder="e.g. Senior Backend Engineer"
                />
              </Field>

              <div className="pj-two">
                <Field label="Department" htmlFor="dept">
                  <select id="dept" className="pj-input" value={form.department} onChange={set("department")}>
                    {["Engineering", "Data & AI", "Product", "Design", "Sales", "Marketing", "Operations", "People"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Experience Level" htmlFor="level">
                  <select id="level" className="pj-input" value={form.level} onChange={set("level")}>
                    {["Entry-level", "Mid-level", "Senior", "Lead / Staff", "Manager"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="pj-two">
                <Field label="Employment Type" htmlFor="etype">
                  <select id="etype" className="pj-input" value={form.employmentType} onChange={set("employmentType")}>
                    {["Full-time", "Part-time", "Contract", "Internship"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Work Mode" htmlFor="wmode">
                  <select id="wmode" className="pj-input" value={form.workMode} onChange={set("workMode")}>
                    {["On-site", "Hybrid", "Remote"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {form.workMode !== "Remote" && (
                <Field label="Office Location" error={errors.location} htmlFor="loc">
                  <div className="pj-icon-input">
                    <MapPin size={18} />
                    <input
                      id="loc"
                      className={cls("location")}
                      value={form.location}
                      onChange={set("location")}
                      placeholder="e.g. New York, NY or San Francisco, CA"
                    />
                  </div>
                </Field>
              )}
            </Section>

            {/* Compensation */}
            <Section
              icon={Wallet}
              kicker="Compensation & Openings"
              title="Pay and timeline"
              sub="Listing a range improves application rates and satisfies pay-transparency laws."
            >
              <div className="pj-salary">
                <Field label="Currency" htmlFor="cur">
                  <select id="cur" className="pj-input" value={form.currency} onChange={set("currency")}>
                    {["USD", "INR", "EUR", "GBP"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Minimum / yr" htmlFor="smin">
                  <input
                    id="smin"
                    type="number"
                    min="0"
                    className={cls("salary")}
                    value={form.salaryMin}
                    onChange={set("salaryMin")}
                    placeholder="90000"
                  />
                </Field>
                <Field label="Maximum / yr" htmlFor="smax">
                  <input
                    id="smax"
                    type="number"
                    min="0"
                    className={cls("salary")}
                    value={form.salaryMax}
                    onChange={set("salaryMax")}
                    placeholder="130000"
                  />
                </Field>
              </div>
              {errors.salary && <p className="pj-error pj-mt-neg" role="alert">{errors.salary}</p>}

              <div className="pj-two">
                <Field label="Open Positions" htmlFor="open">
                  <input
                    id="open"
                    type="number"
                    min="1"
                    max="99"
                    className="pj-input"
                    value={form.openings}
                    onChange={set("openings")}
                  />
                </Field>
                <Field label="Application Deadline" optional error={errors.deadline} htmlFor="dl">
                  <input
                    id="dl"
                    type="date"
                    min={todayISO()}
                    className={cls("deadline")}
                    value={form.deadline}
                    onChange={set("deadline")}
                  />
                </Field>
              </div>
            </Section>

            {/* Description */}
            <Section
              icon={FileText}
              kicker="Job Description"
              title="Describe the work, not the person"
              sub="Focus on outcomes and required skills. Wording is checked for bias as you type."
            >
              <Field label="Role Overview & Responsibilities" error={errors.description} htmlFor="desc">
                <textarea
                  id="desc"
                  rows={8}
                  className={cls("description")}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Describe what this person will build, own and improve in their first 6–12 months…"
                />
                <div className="pj-count">{form.description.length} characters (minimum 50)</div>
              </Field>

              {/* inline inclusive-language check */}
              {form.biasCheck && (
                <div className={`pj-bias ${score === null ? "idle" : flagged.length ? "warn" : "good"}`} aria-live="polite">
                  <div className="pj-bias-head">
                    <span className="pj-bias-title"><Wand2 size={16} /> Inclusive language check</span>
                    <span className="pj-bias-score">{score === null ? "—" : `${score}/100`}</span>
                  </div>
                  {score === null ? (
                    <p>Start writing and we'll scan your wording for bias.</p>
                  ) : flagged.length === 0 ? (
                    <p className="pj-bias-ok"><CheckCircle2 size={16} /> No biased wording found. Great job!</p>
                  ) : (
                    <>
                      <ul>
                        {flagged.map((f) => (
                          <li key={f.term}>
                            <AlertTriangle size={14} />
                            <span><s>{f.term}</s> → <em>{f.fix}</em></span>
                            <small>{f.why}</small>
                          </li>
                        ))}
                      </ul>
                      <button type="button" className="pj-fix" onClick={fixAll}>
                        <Wand2 size={15} /> Apply all suggestions
                      </button>
                    </>
                  )}
                </div>
              )}

              <Field
                label="Required Skills"
                error={errors.skills}
                htmlFor="skill"
                hint="Press Enter or comma to add. Up to 12 skills."
              >
                <div className={`pj-tags ${errors.skills ? "invalid" : ""}`}>
                  {skills.map((s) => (
                    <span className="pj-tag" key={s}>
                      {s}
                      <button type="button" aria-label={`Remove ${s}`} onClick={() => setSkills(skills.filter((x) => x !== s))}>
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                  <input
                    id="skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={onSkillKey}
                    onBlur={() => addSkill(skillInput)}
                    placeholder={skills.length ? "Add another…" : "e.g. React, SQL, System design"}
                  />
                </div>
                <div className="pj-suggest">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map((s) => (
                    <button type="button" key={s} onClick={() => addSkill(s)}>
                      <Plus size={12} /> {s}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>

            {/* Fairness */}
            <Section
              icon={ShieldCheck}
              kicker="Fairness & Screening"
              title="How applicants are evaluated"
              sub="These settings apply to every applicant for this role."
            >
              <div className="pj-toggles">
                <Toggle
                  icon={Eye}
                  title="Blind PII masking"
                  desc="Hide name, photo, age, gender and address from reviewers."
                  checked={form.blindMask}
                  onChange={(v) => setForm({ ...form, blindMask: v })}
                />
                <Toggle
                  icon={Wand2}
                  title="Inclusive language check"
                  desc="Flag biased wording in this posting before it goes live."
                  checked={form.biasCheck}
                  onChange={(v) => setForm({ ...form, biasCheck: v })}
                />
                <Toggle
                  icon={Code2}
                  title="Sandbox coding test"
                  desc="Send a live coding assessment to shortlisted applicants."
                  checked={form.sandbox}
                  onChange={(v) => setForm({ ...form, sandbox: v })}
                />
                <Toggle
                  icon={Users}
                  title="Demographic parity audit"
                  desc="Generate an NYC LL144 audit report for this role."
                  checked={form.audit}
                  onChange={(v) => setForm({ ...form, audit: v })}
                />
              </div>
            </Section>

            {/* Actions */}
            <div className="pj-actions">
              <button type="submit" className="pj-btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="spinner" style={{ width: 18, height: 18, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                ) : (
                  <Send size={18} />
                )}
                {submitting ? "Publishing Job…" : jobId ? "Update & Publish Job" : "Publish Job Posting"}
              </button>

              <button
                type="button"
                className="pj-btn-ghost"
                onClick={saveDraft}
                disabled={submitting}
              >
                <Save size={16} /> {draftSaved ? "✓ Draft saved to database" : "Save as draft"}
              </button>

              <div className="pj-trust">
                <span><Lock size={14} /> 256-Bit SSL</span>
                <i />
                <span><Clock size={14} /> Live in seconds</span>
                <i />
                <span><ShieldCheck size={14} /> SOC-2 Aligned</span>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles (self-contained: Inter font, responsive, polished)          */
/* ------------------------------------------------------------------ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pj-root{
  --green:#059669; --green-d:#047857; --green-t:#ecfdf5; --green-b:#a7f3d0;
  --ink:#0f172a; --muted:#64748b; --line:#e2e8f0; --bg:#f8fafc; --danger:#dc2626;
  font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  color:var(--ink); background:var(--bg); min-height:100vh; box-sizing:border-box;
  padding-bottom:env(safe-area-inset-bottom,0px);
}
.pj-root *{box-sizing:border-box}
.pj-root button{font-family:inherit;cursor:pointer}
.pj-root :focus-visible{outline:3px solid rgba(5,150,105,.35);outline-offset:2px}
.pj-container{max-width:1440px;margin:0 auto;padding:0 32px}
.pj-narrow{max-width:860px;padding-bottom:80px}

/* header */
.pj-header{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20;padding-top:env(safe-area-inset-top,0px)}
.pj-header-in{display:flex;align-items:center;justify-content:space-between;height:72px}
.pj-brand{display:flex;align-items:center;gap:12px;text-decoration:none}
.pj-logo{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#fff;display:grid;place-items:center;box-shadow:0 6px 16px rgba(5,150,105,.28)}
.pj-wordmark{font-size:24px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.pj-wordmark b{font-weight:800;color:var(--green)}
.pj-badge{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--green);background:var(--green-t);border:1px solid var(--green-b);padding:4px 9px;border-radius:6px}
.pj-header-right{display:flex;align-items:center;gap:16px}
.pj-muted{color:var(--muted);font-size:14px}
.pj-muted strong{color:var(--green);font-weight:600}
.pj-btn-outline{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);color:var(--ink);font-weight:600;font-size:14px;padding:9px 16px;border-radius:10px;transition:background .15s,border-color .15s}
.pj-btn-outline:hover{background:var(--bg);border-color:#cbd5e1}
.pj-progress{height:3px;background:var(--line)}
.pj-progress span{display:block;height:100%;background:var(--green);transition:width .35s ease}

/* hero */
.pj-hero{text-align:center;padding:42px 0 32px}
.pj-pill{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--green-d);background:var(--green-t);border:1px solid var(--green-b);padding:6px 16px;border-radius:999px}
.pj-hero h1{font-size:clamp(30px,4.5vw,46px);line-height:1.12;font-weight:800;letter-spacing:-.035em;margin:18px 0 12px;color:var(--ink)}
.pj-hero p{max-width:640px;margin:0 auto;color:#475569;font-size:16px;line-height:1.65}

/* cards */
.pj-stack{display:flex;flex-direction:column;gap:24px}
.pj-card{background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 1px 3px rgba(15,23,42,.04),0 12px 28px rgba(15,23,42,.04)}
.pj-section{padding:32px 36px}
.pj-sec-head{margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--line)}
.pj-kicker{display:flex;align-items:center;gap:7px;color:var(--green);font-weight:600;font-size:14px;margin-bottom:6px}
.pj-sec-head h2{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px;color:var(--ink)}
.pj-sec-head p{margin:0;color:var(--muted);font-size:14.5px;line-height:1.5}

/* fields */
.pj-field{margin-bottom:20px}
.pj-field:last-child{margin-bottom:0}
.pj-label{display:block;font-weight:600;font-size:14.5px;margin-bottom:8px;color:var(--ink)}
.pj-optional{color:var(--muted);font-weight:400}
.pj-input{width:100%;height:50px;padding:0 15px;font:inherit;font-size:15px;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:11px;transition:border-color .15s,box-shadow .15s}
textarea.pj-input{height:auto;padding:13px 15px;line-height:1.6;resize:vertical;min-height:160px}
.pj-input::placeholder{color:#94a3b8}
.pj-input:hover{border-color:#cbd5e1}
.pj-input:focus{outline:none;border-color:var(--green);box-shadow:0 0 0 4px rgba(5,150,105,.12)}
.pj-input.invalid,.pj-tags.invalid{border-color:var(--danger);box-shadow:0 0 0 4px rgba(220,38,38,.08)}
select.pj-input{appearance:auto;padding:0 12px}
.pj-icon-input{position:relative}
.pj-icon-input svg{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none}
.pj-icon-input .pj-input{padding-left:44px}
.pj-two{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.pj-salary{display:grid;grid-template-columns:120px 1fr 1fr;gap:16px}
.pj-hint{color:var(--muted);font-size:13.5px;margin:7px 0 0;line-height:1.5}
.pj-error{color:var(--danger);font-size:13.5px;font-weight:500;margin:7px 0 0}
.pj-mt-neg{margin:-6px 0 20px}
.pj-count{text-align:right;color:#94a3b8;font-size:12.5px;margin-top:6px}

/* inline bias check */
.pj-bias{border:1px solid var(--line);background:var(--bg);border-radius:13px;padding:15px 16px;margin:-2px 0 24px}
.pj-bias p{margin:7px 0 0;font-size:14px;color:var(--muted);line-height:1.5}
.pj-bias-head{display:flex;justify-content:space-between;align-items:center}
.pj-bias-title{display:inline-flex;align-items:center;gap:7px;font-weight:600;font-size:14.5px}
.pj-bias-score{font-weight:800;font-size:14px;padding:3px 9px;border-radius:7px;background:#e2e8f0;color:var(--muted)}
.pj-bias.good{background:var(--green-t);border-color:var(--green-b)}
.pj-bias.good .pj-bias-score{background:#d1fae5;color:var(--green-d)}
.pj-bias.good .pj-bias-title{color:var(--green-d)}
.pj-bias-ok{display:flex;align-items:center;gap:7px;color:var(--green-d)!important}
.pj-bias.warn{background:#fffbeb;border-color:#fde68a}
.pj-bias.warn .pj-bias-score{background:#fef3c7;color:#b45309}
.pj-bias ul{list-style:none;margin:10px 0 12px;padding:0;display:flex;flex-direction:column;gap:7px}
.pj-bias li{display:flex;align-items:center;flex-wrap:wrap;gap:5px 8px;font-size:14px}
.pj-bias li svg{color:#d97706;flex:none}
.pj-bias s{color:#b91c1c}
.pj-bias em{font-style:normal;color:var(--green-d);font-weight:600}
.pj-bias small{color:var(--muted);font-size:12.5px}
.pj-fix{display:inline-flex;align-items:center;gap:7px;background:#fff;color:var(--green-d);border:1px solid var(--green-b);padding:8px 14px;font-weight:600;font-size:13.5px;border-radius:9px}
.pj-fix:hover{background:var(--green-t)}

/* skill tags */
.pj-tags{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:50px;padding:7px 11px;border:1px solid var(--line);border-radius:11px;background:#fff;transition:border-color .15s,box-shadow .15s}
.pj-tags:focus-within{border-color:var(--green);box-shadow:0 0 0 4px rgba(5,150,105,.12)}
.pj-tags input{flex:1;min-width:140px;border:0;outline:0;font:inherit;font-size:15px;padding:5px 4px;background:transparent}
.pj-tag{display:inline-flex;align-items:center;gap:5px;background:var(--green-t);color:var(--green-d);border:1px solid var(--green-b);font-weight:600;font-size:13.5px;padding:5px 8px 5px 11px;border-radius:999px}
.pj-tag button{display:grid;place-items:center;border:0;background:transparent;color:var(--green-d);padding:2px;border-radius:50%}
.pj-tag button:hover{background:var(--green-b)}
.pj-suggest{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.pj-suggest button{display:inline-flex;align-items:center;gap:4px;border:1px dashed #cbd5e1;background:#fff;color:#475569;font-size:12.5px;font-weight:500;padding:5px 10px;border-radius:999px}
.pj-suggest button:hover{border-color:var(--green);color:var(--green-d);background:var(--green-t)}

/* toggles */
.pj-toggles{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pj-toggle{display:flex;align-items:flex-start;gap:12px;padding:16px;border:1px solid var(--line);border-radius:14px;background:#fff;transition:border-color .2s,background .2s}
.pj-toggle.on{border-color:var(--green-b);background:var(--green-t)}
.pj-toggle-icon{flex:none;width:38px;height:38px;border-radius:10px;background:var(--green-t);color:var(--green);display:grid;place-items:center}
.pj-toggle.on .pj-toggle-icon{background:#fff}
.pj-toggle-text{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}
.pj-toggle-text strong{font-size:14.5px;font-weight:600;color:var(--ink)}
.pj-toggle-text span{font-size:13px;color:var(--muted);line-height:1.45}
.pj-switch{flex:none;width:44px;height:24px;border-radius:999px;border:0;background:#cbd5e1;padding:2px;transition:background .2s;display:flex;margin-top:2px}
.pj-switch span{width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}
.pj-switch.on{background:var(--green)}
.pj-switch.on span{transform:translateX(20px)}

/* actions */
.pj-actions{padding:6px 0 0}
.pj-btn-primary{width:100%;height:56px;display:flex;align-items:center;justify-content:center;gap:9px;background:var(--green);color:#fff;border:0;border-radius:13px;font-size:16.5px;font-weight:700;box-shadow:0 10px 24px rgba(5,150,105,.28);transition:background .15s,transform .1s}
.pj-btn-primary:hover{background:var(--green-d)}
.pj-btn-primary:active{transform:translateY(1px)}
.pj-btn-primary.pj-auto{width:auto;padding:0 24px;height:50px;font-size:15.5px}
.pj-btn-ghost{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin-top:10px;height:44px;background:transparent;border:0;color:var(--muted);font-weight:600;font-size:14.5px;border-radius:11px;transition:background .15s}
.pj-btn-ghost:hover{color:var(--ink);background:#eef2f6}
.pj-trust{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px 12px;margin-top:16px;color:var(--green);font-size:13.5px;font-weight:500}
.pj-trust span{display:inline-flex;align-items:center;gap:5px}
.pj-trust i{width:4px;height:4px;border-radius:50%;background:var(--green)}

/* success */
.pj-success{text-align:center;padding:48px 30px}
.pj-success-icon{width:68px;height:68px;border-radius:50%;background:var(--green-t);color:var(--green);display:inline-grid;place-items:center;margin-bottom:16px}
.pj-success h2{font-size:28px;font-weight:800;letter-spacing:-.02em;margin:0 0 10px;color:var(--ink)}
.pj-success p{color:#475569;line-height:1.65;max-width:460px;margin:0 auto 18px;font-size:15px}
.pj-jobid{display:inline-block;background:var(--bg);border:1px solid var(--line);padding:9px 16px;border-radius:11px;font-size:14px;color:var(--muted);margin-bottom:24px}
.pj-jobid code{color:var(--ink);font-weight:700;margin-left:6px}
.pj-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* responsive */
@media (max-width:720px){
  .pj-container{padding:0 16px}
  .pj-header-in{height:64px}
  .pj-hide-sm,.pj-badge{display:none}
  .pj-btn-outline{padding:8px 12px;font-size:13.5px}
  .pj-wordmark{font-size:21px}
  .pj-logo{width:38px;height:38px}
  .pj-hero{padding:28px 0 24px}
  .pj-hero p{font-size:15px}
  .pj-section{padding:22px 18px;border-radius:18px}
  .pj-two,.pj-salary,.pj-toggles{grid-template-columns:1fr;gap:0}
  .pj-toggles{gap:12px}
  .pj-salary .pj-field,.pj-two .pj-field{margin-bottom:20px}
}
@media (prefers-reduced-motion:reduce){
  .pj-root *{transition:none!important}
}
`;
