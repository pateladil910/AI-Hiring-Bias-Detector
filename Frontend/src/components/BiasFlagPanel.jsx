import { AlertTriangle, AlertCircle, Info, ChevronRight, Lightbulb } from 'lucide-react';

const TYPE_META = {
  gendered_language:       { label: 'Gendered Language',         color: 'var(--color-warning)' },
  age_bias:                { label: 'Age Bias',                  color: 'var(--color-danger)' },
  exclusionary_culture:    { label: 'Exclusionary Culture',      color: 'var(--color-warning)' },
  ableist_language:        { label: 'Ableist Language',          color: 'var(--color-danger)' },
  unnecessary_requirement: { label: 'Unnecessary Requirement',   color: 'var(--color-primary)' },
};

const SEVERITY_ICONS = {
  3: <AlertCircle size={14} style={{ color: 'var(--color-danger)' }} />,
  2: <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />,
  1: <Info size={14} style={{ color: 'var(--color-primary)' }} />,
};

function FlagItem({ flag }) {
  const meta = TYPE_META[flag.type] || { label: flag.type, color: 'var(--color-text-muted)' };

  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-alt)',
      border: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {SEVERITY_ICONS[flag.severity] || SEVERITY_ICONS[1]}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          background: `${meta.color}18`,
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${meta.color}40`,
        }}>
          "{flag.token}"
        </span>
        <span style={{ fontSize: 11, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
      </div>

      {/* Context */}
      {flag.context && (
        <p style={{
          fontSize: 12, color: 'var(--color-text-muted)', margin: 0,
          fontStyle: 'italic', lineHeight: 1.5,
          borderLeft: `2px solid var(--color-border)`,
          paddingLeft: 8,
        }}>
          …{flag.context}…
        </p>
      )}

      {/* Suggestion */}
      {flag.suggestion && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <Lightbulb size={13} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Try: <strong style={{ color: 'var(--color-success)' }}>"{flag.suggestion}"</strong>
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * BiasFlagPanel — displays the list of bias flags from an analyzed JD.
 * Shows loading skeleton, empty state, and grouped flag list.
 */
export default function BiasFlagPanel({ flags = [], explanation = '', loading = false, analyzed = false }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            height: 72, borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-alt)',
            animation: 'pulse 1.5s ease-in-out infinite',
            opacity: 0.7,
          }} />
        ))}
      </div>
    );
  }

  if (!analyzed) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 16px',
        color: 'var(--color-text-muted)', fontSize: 13,
      }}>
        <AlertTriangle size={28} style={{ color: 'var(--color-border)', marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
        Click <strong>Analyze Bias</strong> to see inline flags and suggestions.
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div style={{
        padding: '20px 16px', borderRadius: 'var(--radius-md)',
        background: 'rgba(52,199,123,0.06)',
        border: '1px solid rgba(52,199,123,0.2)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>✅</div>
        <p style={{ fontSize: 13, color: 'var(--color-success)', margin: 0, fontWeight: 500 }}>
          No bias signals detected — this JD looks inclusive!
        </p>
      </div>
    );
  }

  // Group by type
  const grouped = flags.reduce((acc, f) => {
    acc[f.type] = acc[f.type] || [];
    acc[f.type].push(f);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      {explanation && (
        <div className="alert alert-warning" style={{ fontSize: 12 }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          {explanation}
        </div>
      )}

      {/* Flag list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(grouped).map(([type, typeFlags]) => {
          const meta = TYPE_META[type] || { label: type, color: 'var(--color-text-muted)' };
          return (
            <div key={type}>
              <div style={{ fontSize: 11, fontWeight: 600, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {meta.label} ({typeFlags.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {typeFlags.map((f, i) => <FlagItem key={i} flag={f} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
