import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CRITICAL UI ERROR]', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', padding: 36, textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 'var(--radius-full)',
              background: 'rgba(240, 85, 76, 0.12)', border: '1px solid rgba(240, 85, 76, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-danger)', margin: '0 auto 20px',
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Something went wrong</h2>
            <p style={{ margin: '0 0 24px', fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              An unexpected interface error occurred. You can reload the page or return to the main dashboard.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={this.handleReload}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={14} /> Reload Page
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={this.handleGoHome}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Home size={14} /> Go to Home
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details style={{ textAlign: 'left', marginTop: 16 }}>
                <summary style={{ fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                  Technical Error Details
                </summary>
                <pre style={{
                  background: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-danger)',
                  overflowX: 'auto',
                  marginTop: 8,
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
