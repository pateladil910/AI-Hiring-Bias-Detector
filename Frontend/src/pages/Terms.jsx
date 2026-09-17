import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>

        <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-sm space-y-6 text-sm text-slate-600 leading-relaxed">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-xs text-slate-500">FairHire Platform Agreement | Version 3.0.0</p>
            </div>
          </div>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing FairHire or EquiHire AI systems, participating in candidate assessments, or utilizing recruiter screening tools, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Algorithmic Fair Hiring Commitment</h2>
            <p>
              Employer organizations utilizing FairHire agree to uphold non-discriminatory hiring practices in compliance with Title VII of the Civil Rights Act of 1964 and EEOC guidelines. Recruiters agree not to attempt de-anonymization of candidate records prior to the formal interview panel round.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Candidate Code of Conduct</h2>
            <p>
              Candidates agree to complete technical MCQs and coding test sandboxes independently without unauthorized third-party collaboration. Sandboxed executions are automatically monitored for programmatic timing integrity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Disclaimer of Legal Warranty</h2>
            <p>
              While FairHire's algorithmic bias engine significantly mitigates linguistic and procedural bias, automated process audits do not constitute an absolute legal guarantee of demographic neutrality. Employers retain ultimate responsibility for final hiring decisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
