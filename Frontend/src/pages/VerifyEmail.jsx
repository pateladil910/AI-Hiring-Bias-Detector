import { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, Mail, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { authAPI } from '../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');

  const passedEmail = location.state?.email || '';
  const isUnverifiedLogin = location.state?.unverified || false;

  const [status, setStatus] = useState(token ? 'verifying' : 'idle');
  const [error, setError] = useState('');

  // Resend state
  const [resendEmail, setResendEmail] = useState(passedEmail);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendError, setResendError] = useState('');
  const [showResendForm, setShowResendForm] = useState(Boolean(passedEmail));

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await axios.get(`${apiUrl}/api/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.error?.message || 'Verification token is invalid or has expired.');
      }
    })();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResending(true);
    setResendMsg('');
    setResendError('');
    try {
      const { data } = await authAPI.resendVerification(resendEmail.trim());
      setResendMsg(data.message || 'Verification email sent! Check your inbox.');
      setResendEmail('');
    } catch (err) {
      setResendError(err.response?.data?.error?.message || 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--color-bg)',
    }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: 40, textAlign: 'center', background: 'var(--color-surface)' }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--color-text-primary)' }}>
            Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
          </span>
        </Link>

        {/* ─ Idle: no token in URL ─────────────────────────────────────── */}
        {status === 'idle' && (
          <div>
            {isUnverifiedLogin && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '12px 14px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 8,
                marginBottom: 20,
                textAlign: 'left',
                color: '#f59e0b',
                fontSize: 13,
                lineHeight: 1.45,
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>Verification Required:</strong> Your account email is not yet confirmed. A verification link was dispatched to <strong>{passedEmail || 'your email'}</strong>. Click below to resend if needed.
                </div>
              </div>
            )}

            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(91,127,255,0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Mail size={30} />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Verify your Email Address</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              {isUnverifiedLogin
                ? `Please click the link sent to ${passedEmail || 'your email'} to activate your account and start applying.`
                : 'We sent a verification link to your registered email address. Please open your inbox and click the link to activate your candidate account.'}
            </p>

            {/* Resend section */}
            {!showResendForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowResendForm(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}
                >
                  <RefreshCw size={14} /> Resend Verification Email
                </button>
                <Link to="/login" className="btn btn-ghost" style={{ fontSize: 13 }}>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResend} style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  Enter the email address you registered with:
                </p>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  style={{ marginBottom: 12 }}
                />
                {resendMsg && (
                  <div className="alert alert-success" style={{ marginBottom: 12, textAlign: 'left' }}>
                    <CheckCircle2 size={14} /> {resendMsg}
                  </div>
                )}
                {resendError && (
                  <div className="alert alert-error" style={{ marginBottom: 12, textAlign: 'left' }}>
                    {resendError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={resending}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {resending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <RefreshCw size={14} />}
                    {resending ? 'Sending…' : 'Send Link'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setShowResendForm(false); setResendMsg(''); setResendError(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ─ Verifying ─────────────────────────────────────────────────── */}
        {status === 'verifying' && (
          <div>
            <div className="spinner" style={{ margin: '30px auto' }} />
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Verifying your email…</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Please wait while we confirm your verification token.
            </p>
          </div>
        )}

        {/* ─ Success ───────────────────────────────────────────────────── */}
        {status === 'success' && (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,199,123,0.15)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Email Verified Successfully!</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              Your candidate account is now fully verified. You can now explore verified open positions and submit blind applications.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Sign In to Candidate Portal <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* ─ Error ─────────────────────────────────────────────────────── */}
        {status === 'error' && (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(240,85,76,0.15)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={32} />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Verification Failed</h2>
            <p style={{ fontSize: 14, color: 'var(--color-danger)', lineHeight: 1.6, marginBottom: 24 }}>
              {error}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => { setStatus('idle'); setError(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <RefreshCw size={14} /> Request a New Link
              </button>
              <Link to="/register/candidate" className="btn btn-ghost">
                Register Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
