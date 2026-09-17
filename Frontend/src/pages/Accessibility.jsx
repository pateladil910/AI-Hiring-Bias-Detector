import { Award, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Accessibility() {
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
            <Award className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Accessibility Statement</h1>
              <p className="text-xs text-slate-500">Target Standard: WCAG 2.1 AA Compliance</p>
            </div>
          </div>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Our Inclusive Design Mission</h2>
            <p>
              FairHire is dedicated to ensuring that digital accessibility is maintained for all job seekers and evaluators, including individuals with visual, motor, auditory, or cognitive disabilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Implemented Measures</h2>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Keyboard Navigability:</strong> All form controls, buttons, modals, and coding editors support full keyboard navigation without mouse traps.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Contrast Compliance:</strong> Minimum color contrast ratios of 4.5:1 for standard text and 3:1 for large graphical widgets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Screen Reader Optimization:</strong> Comprehensive ARIA labels and roles across live bias score gauges, timers, and test case result indicators.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Reduced Motion Support:</strong> Obeys <code>prefers-reduced-motion: reduce</code> to suppress all non-essential page animations.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Feedback & Accommodations</h2>
            <p>
              If you require specialized assessment accommodations (such as extended testing timers or screen magnifier adjustments), please contact our team at <a href="mailto:accessibility@fairhire.io" className="text-emerald-600 underline font-medium">accessibility@fairhire.io</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
