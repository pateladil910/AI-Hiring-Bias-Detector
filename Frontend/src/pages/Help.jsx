import { useState } from 'react';
import { HelpCircle, Search, Mail, MessageSquare, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Help() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(0);
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketData, setTicketData] = useState({ subject: '', message: '', email: '' });

  const faqs = [
    {
      q: "How does the Demographic Shield work?",
      a: "When a candidate uploads a resume, our automated regex and NLP pipeline extracts skills and experience while immediately masking names, email addresses, phone numbers, postal addresses, gendered pronouns, age indicators, and photos before any recruiter can access the profile."
    },
    {
      q: "What is the Composite Scoring formula?",
      a: "FairHire calculates candidate ranking using an objective, deterministic formula: Composite = (MCQ Score × 0.4) + (Coding Sandbox Score × 0.4) + (Resume Skill Match × 0.2). This formula is transparent and displayed to candidates alongside their test results."
    },
    {
      q: "Can recruiters see candidate personal information?",
      a: "No. Recruiters evaluate applicants blindly using non-identifying reference numbers (e.g. CAND-7F21). A candidate's identity can only be revealed for authorized interview scheduling, which generates an immutable entry in the compliance audit trail."
    },
    {
      q: "How does the Real-Time Bias Detection assistant work?",
      a: "As recruiters author Job Descriptions, the text streams over WebSockets to our hybrid bias engine. Layer 1 uses research-backed lexicons to detect masculine, feminine, and exclusionary terms; Layer 2 validates contextual semantics and offers neutral alternatives with one-click replacement."
    },
    {
      q: "Is FairHire compliant with EEOC and GDPR regulations?",
      a: "Yes. Every assessment consistency check, redaction event, and evaluator score modification is recorded in our tamper-evident audit log. Candidates can request full data export or right-to-erasure (GDPR Art. 17) directly from their profile settings."
    }
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    setTicketSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Help & Support Center</h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Browse frequently asked questions regarding algorithmic neutrality, blind evaluation, and platform functionality.
          </p>

          <div className="relative max-w-md mx-auto mt-4">
            <input
              type="text"
              placeholder="Search help articles, formulas, or guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-300 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 shadow-xs"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs transition">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  className="w-full p-4 text-left flex items-center justify-between font-semibold text-sm text-slate-900 hover:text-emerald-700 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openIndex === i ? <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {openIndex === i && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600" /> Need Further Assistance?
          </h2>
          <p className="text-xs text-slate-600 mb-6">
            Submit a support inquiry or report an algorithmic fairness question to our technical compliance team.
          </p>

          {ticketSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-700">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>Your support ticket #FH-{Date.now().toString().slice(-4)} has been logged. Our engineering desk will respond within 1 business day.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={ticketData.email}
                    onChange={(e) => setTicketData({ ...ticketData, email: e.target.value })}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assessment Timer Question"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                    className="w-full rounded-lg bg-white border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Message Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail your request or inquiry..."
                  value={ticketData.message}
                  onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Submit Ticket
              </button>
            </form>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="text-center pt-4 border-t border-slate-200 text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-600 transition mx-3">Home</Link>
          <Link to="/privacy" className="hover:text-emerald-600 transition mx-3">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-emerald-600 transition mx-3">Terms of Service</Link>
          <Link to="/status" className="hover:text-emerald-600 transition mx-3">System Status</Link>
        </div>
      </div>
    </div>
  );
}
