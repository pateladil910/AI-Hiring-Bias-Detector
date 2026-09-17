import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6 text-sm text-slate-300 leading-relaxed">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Privacy Policy & PII Redaction Charter</h1>
              <p className="text-xs text-slate-400">Effective Date: September 2026 | Version 3.0.0</p>
            </div>
          </div>

          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-base font-bold text-white">1. Demographic Shield & Automated PII Cloaking</h2>
            <p>
              FairHire is built on the principle of demographic neutrality. When candidates submit resumes or profile details, our pipeline immediately strips personally identifiable markers before any evaluator or recruiter receives access.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
              <li><strong>Names:</strong> Masked and substituted with pseudonymous identifiers (e.g. <code>CAND-7F21</code>).</li>
              <li><strong>Contact Details:</strong> Emails and telephone numbers replaced with <code>[REDACTED_EMAIL]</code> and <code>[REDACTED_PHONE]</code>.</li>
              <li><strong>Geographic Markers:</strong> Street addresses and zip codes are scrubbed to eliminate location-based bias.</li>
              <li><strong>Gender & Age:</strong> Gendered pronouns are neutralized to <code>[THEY/THEM]</code>, and dates of birth or graduation cohorts are unlinked.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Data Retention & GDPR Subject Rights</h2>
            <p>
              In strict accordance with the General Data Protection Regulation (GDPR) and global privacy mandates, candidates retain absolute control over their submitted documents:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
              <li><strong>Right to Portability (Art. 20):</strong> Candidates can download an export of all parsed skills and evaluation records in structured JSON format from their profile.</li>
              <li><strong>Right to Erasure (Art. 17):</strong> Candidates can trigger complete account deletion, removing all personal references, resumes, and test attempts from our databases within 24 hours.</li>
              <li><strong>Retention Timelines:</strong> Inactive applicant records are automatically purged after 180 days unless extended by mutual consent.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Immutable Audit Trails & Non-Disclosure</h2>
            <p>
              Candidate evaluations are tracked via cryptographic, tamper-evident audit logs. Evaluators cannot unmask candidate identity without entering an authorized business justification, which is permanently logged in the EEOC Compliance Ledger.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Data Security & Storage Architecture</h2>
            <p>
              All data in transit is encrypted using TLS 1.3, and data at rest is encrypted using AES-256. Resumes are stored on private, access-controlled storage buckets and served exclusively through time-limited, signed URLs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
