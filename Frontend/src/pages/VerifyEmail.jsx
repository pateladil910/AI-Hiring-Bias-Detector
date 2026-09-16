import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Mail, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState(token ? 'verifying' : 'idle');
  const [error, setError] = useState('');

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

        {status === 'idle' && (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(91,127,255,0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Mail size={30} />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Verify your Email Address</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              We sent a verification link to your registered email address. Please open your inbox and click the link to activate your candidate account.
            </p>
            <Link to="/login" className="btn btn-ghost">
              Back to Sign In
            </Link>
          </div>
        )}

        {status === 'verifying' && (
          <div>
            <div className="spinner" style={{ margin: '30px auto' }} />
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Verifying your email…</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Please wait while we confirm your verification token.
            </p>
          </div>
        )}

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

        {status === 'error' && (
          <div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(240,85,76,0.15)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={32} />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Verification Failed</h2>
            <p style={{ fontSize: 14, color: 'var(--color-danger)', lineHeight: 1.6, marginBottom: 24 }}>
              {error}
            </p>
            <Link to="/register/candidate" className="btn btn-ghost">
              Register Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
