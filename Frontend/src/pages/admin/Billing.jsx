import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Users, Zap, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { billingAPI } from '../../lib/api';

export default function Billing() {
  const [sub, setSub] = useState({
    tier: 'Growth Plan',
    seatLimit: 15,
    seatsUsed: 8,
    monthlyAssessmentLimit: 500,
    assessmentsUsedThisMonth: 182,
    priceMonthly: 299,
    status: 'active',
    renewalDate: '2026-10-01',
    invoices: [
      { id: 'INV-2026-09', date: '2026-09-01', amount: 299, status: 'Paid' },
      { id: 'INV-2026-08', date: '2026-08-01', amount: 299, status: 'Paid' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    try {
      const res = await billingAPI.getSubscription();
      if (res.data?.subscription) {
        setSub(res.data.subscription);
      }
    } catch (e) {
      console.warn('Using default billing data');
    }
  };

  const handlePlanChange = async (tier) => {
    setLoading(true);
    try {
      const res = await billingAPI.changePlan(tier);
      setSub(res.data.subscription);
      setSuccessMessage(`Organization plan upgraded to ${tier}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) {
      alert('Plan update failed. Please verify payment method.');
    } finally {
      setLoading(false);
    }
  };

  const usagePercent = Math.round((sub.assessmentsUsedThisMonth / sub.monthlyAssessmentLimit) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-emerald-400" />
            Billing & Subscription Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Oversee employer tenant subscription tiers, assessment quota caps, and seat limits.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-900/30 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
            <div className="text-xs text-slate-400 font-semibold uppercase">Current Tier</div>
            <div className="text-2xl font-bold text-white mt-1">{sub.tier}</div>
            <div className="text-sm text-emerald-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Active Subscription
            </div>
            <div className="text-xs text-slate-500 mt-4">Renews: {sub.renewalDate}</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
            <div className="text-xs text-slate-400 font-semibold uppercase">Recruiter Seats</div>
            <div className="text-2xl font-bold text-white mt-1">{sub.seatsUsed} <span className="text-slate-500 text-sm font-normal">/ {sub.seatLimit} seats</span></div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(sub.seatsUsed / sub.seatLimit) * 100}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-2">{sub.seatLimit - sub.seatsUsed} seats available to provision</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
            <div className="text-xs text-slate-400 font-semibold uppercase">Monthly Assessment Volume</div>
            <div className="text-2xl font-bold text-white mt-1">{sub.assessmentsUsedThisMonth} <span className="text-slate-500 text-sm font-normal">/ {sub.monthlyAssessmentLimit}</span></div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${usagePercent}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-2">{usagePercent}% of monthly quota consumed</div>
          </div>
        </div>

        {/* Tier Comparison & Upgrade */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Available Enterprise Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter Plan</h3>
                <div className="text-3xl font-extrabold text-white mt-2">$99<span className="text-xs text-slate-500 font-normal">/mo</span></div>
                <p className="text-xs text-slate-400 mt-2">For startups building fair hiring pipelines.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 5 recruiter seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100 monthly candidate tests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Layer-1 Lexicon Bias Scan</li>
                </ul>
              </div>
              <button
                onClick={() => handlePlanChange('Starter')}
                disabled={loading || sub.tier.includes('Starter')}
                className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
              >
                {sub.tier.includes('Starter') ? 'Current Plan' : 'Select Starter'}
              </button>
            </div>

            {/* Growth */}
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between relative shadow-lg shadow-emerald-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full uppercase">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Growth Plan</h3>
                <div className="text-3xl font-extrabold text-white mt-2">$299<span className="text-xs text-slate-500 font-normal">/mo</span></div>
                <p className="text-xs text-slate-400 mt-2">For mid-size companies scaling blind technical assessments.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 15 recruiter seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 500 monthly candidate tests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time WebSocket Bias Assistant</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sandbox code test runners</li>
                </ul>
              </div>
              <button
                onClick={() => handlePlanChange('Growth')}
                disabled={loading || sub.tier.includes('Growth')}
                className="mt-6 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold disabled:opacity-40"
              >
                {sub.tier.includes('Growth') ? 'Current Plan' : 'Select Growth'}
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise Tier</h3>
                <div className="text-3xl font-extrabold text-white mt-2">$999<span className="text-xs text-slate-500 font-normal">/mo</span></div>
                <p className="text-xs text-slate-400 mt-2">For high-volume hiring teams demanding bespoke EEOC legal compliance.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited recruiter seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 5,000+ monthly candidate tests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full EEOC compliance legal hold reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated Technical Account Lead</li>
                </ul>
              </div>
              <button
                onClick={() => handlePlanChange('Enterprise')}
                disabled={loading || sub.tier.includes('Enterprise')}
                className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
              >
                {sub.tier.includes('Enterprise') ? 'Current Plan' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-4">Payment & Invoice History</h2>
          <div className="divide-y divide-slate-800">
            {sub.invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{inv.id}</div>
                  <div className="text-slate-500">{inv.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-200">${inv.amount}.00</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
