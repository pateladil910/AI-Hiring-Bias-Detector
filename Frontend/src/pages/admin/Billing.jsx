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
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-emerald-600" />
            Billing & Subscription Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Oversee employer tenant subscription tiers, assessment quota caps, and seat limits.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-sm text-emerald-700 shadow-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold uppercase">Current Tier</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{sub.tier}</div>
            <div className="text-sm text-emerald-700 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Subscription
            </div>
            <div className="text-xs text-slate-400 mt-4">Renews: {sub.renewalDate}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold uppercase">Recruiter Seats</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{sub.seatsUsed} <span className="text-slate-400 text-sm font-normal">/ {sub.seatLimit} seats</span></div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden border border-slate-200">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(sub.seatsUsed / sub.seatLimit) * 100}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-2">{sub.seatLimit - sub.seatsUsed} seats available to provision</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold uppercase">Monthly Assessment Volume</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{sub.assessmentsUsedThisMonth} <span className="text-slate-400 text-sm font-normal">/ {sub.monthlyAssessmentLimit}</span></div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden border border-slate-200">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${usagePercent}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-2">{usagePercent}% of monthly quota consumed</div>
          </div>
        </div>

        {/* Tier Comparison & Upgrade */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Available Enterprise Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Starter Plan</h3>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">$99<span className="text-xs text-slate-400 font-normal">/mo</span></div>
                <p className="text-xs text-slate-500 mt-2">For startups building fair hiring pipelines.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Up to 5 recruiter seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100 monthly candidate tests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Layer-1 Lexicon Bias Scan</li>
                </ul>
              </div>
              <button
                onClick={() => handlePlanChange('Starter')}
                disabled={loading || sub.tier.includes('Starter')}
                className="mt-6 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                {sub.tier.includes('Starter') ? 'Current Plan' : 'Select Starter'}
              </button>
            </div>

            {/* Growth */}
            <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-md">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-full uppercase shadow-xs">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Growth Plan</h3>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">$299<span className="text-xs text-slate-400 font-normal">/mo</span></div>
                <p className="text-xs text-slate-500 mt-2">For mid-size companies scaling blind technical assessments.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Up to 15 recruiter seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 500 monthly candidate tests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time WebSocket Bias Assistant</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sandbox code test runners</li>
                </ul>
              </div>
              <button
                onClick={() => handlePlanChange('Growth')}
                disabled={loading || sub.tier.includes('Growth')}
                className="mt-6 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-40 shadow-xs cursor-pointer"
              >
                {sub.tier.includes('Growth') ? 'Current Plan' : 'Select Growth'}
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enterprise Tier</h3>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">$999<span className="text-xs text-slate-400 font-normal">/mo</span></div>
                <p className="text-xs text-slate-500 mt-2">For high-volume hiring teams demanding bespoke EEOC legal compliance.</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlimited recruiter seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 5,000+ monthly candidate tests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full EEOC compliance legal hold reports</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated Technical Account Lead</li>
                </ul>
              </div>
              <button
                onClick={() => handlePlanChange('Enterprise')}
                disabled={loading || sub.tier.includes('Enterprise')}
                className="mt-6 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                {sub.tier.includes('Enterprise') ? 'Current Plan' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Payment & Invoice History</h2>
          <div className="divide-y divide-slate-100">
            {sub.invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{inv.id}</div>
                  <div className="text-slate-400">{inv.date}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-700">${inv.amount}.00</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
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
