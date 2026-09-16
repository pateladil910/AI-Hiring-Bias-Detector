import { AlertTriangle, AlertCircle, Info, Lightbulb, Check, X } from 'lucide-react';

const CATEGORY_META = {
  gender_coded:            { label: 'Gender-Coded Phrasing',    color: 'var(--color-warning)' },
  gendered_language:       { label: 'Gender-Coded Phrasing',    color: 'var(--color-warning)' },
  age_bias:                { label: 'Age Bias',                 color: 'var(--color-danger)' },
  pedigree_bias:           { label: 'Pedigree / Elitism Bias',  color: 'var(--color-danger)' },
  ability_bias:            { label: 'Ability / Physical Bias',  color: 'var(--color-danger)' },
  ableist_language:        { label: 'Ableist Language',         color: 'var(--color-danger)' },
  cultural_bias:           { label: 'Cultural / Slang Bias',    color: 'var(--color-warning)' },
  exclusionary_culture:    { label: 'Cultural / Slang Bias',    color: 'var(--color-warning)' },
  unnecessary_requirement: { label: 'Unnecessary Requirement',  color: 'var(--color-primary)' },
  structural_red_flag:     { label: 'Structural Red Flag',      color: 'var(--color-accent)' },
};

const SEVERITY_ICONS = {
  high:   <AlertCircle size={14} style={{ color: 'var(--color-danger)' }} />,
  medium: <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />,
  low:    <Info size={14} style={{ color: 'var(--color-primary)' }} />,
  3:      <AlertCircle size={14} style={{ color: 'var(--color-danger)' }} />,
  2:      <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />,
  1:      <Info size={14} style={{ color: 'var(--color-primary)' }} />,
};

function FlagItem({ flag, onReplace, onDismiss }) {
  const catKey = flag.category || flag.type || 'general';
  const meta = CATEGORY_META[catKey] || { label: catKey.replace(/_/g, ' '), color: 'var(--color-text-muted)' };
  const tokenText = flag.phrase || flag.token;

  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-alt)',
      border: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {SEVERITY_ICONS[flag.severity] || SEVERITY_ICONS['medium']}
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
            "{tokenText}"
          </span>
          <span style={{ fontSize: 11, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(flag)}
            title="Dismiss flag as legitimate occupational requirement"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Explanation */}
      {flag.explanation && (
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {flag.explanation}
        </p>
      )}

      {/* Context snippet */}
      {flag.context && (
        <p style={{
          fontSize: 11, color: 'var(--color-text-muted)', margin: 0,
          fontStyle: 'italic', lineHeight: 1.4,
          borderLeft: `2px solid var(--color-border)`,
          paddingLeft: 8,
        }}>
          …{flag.context}…
        </p>
      )}

      {/* One-Click Suggestion */}
      {flag.suggestion && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={13} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Try: <strong style={{ color: 'var(--color-success)' }}>"{flag.suggestion}"</strong>
            </span>
          </div>

          {onReplace && (
            <button
              type="button"
              onClick={() => onReplace(tokenText, flag.suggestion, flag)}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: 11, padding: '2px 8px', height: 'auto',
                color: 'var(--color-success)', border: '1px solid rgba(52,199,123,0.3)',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              <Check size={12} /> Replace
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * BiasFlagPanel — displays the list of bias flags from an analyzed JD with one-click replacements.
 */
export default function BiasFlagPanel({
  flags = [],
  structuralNotes = [],
  explanation = '',
  loading = false,
  analyzed = false,
  onReplace = null,
  onDismiss = null,
}) {
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

  if (!analyzed && flags.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '32px 16px',
        color: 'var(--color-text-muted)', fontSize: 13,
      }}>
        <AlertTriangle size={28} style={{ color: 'var(--color-border)', marginBottom: 10, display: 'block', margin: '0 auto 10px' }} />
        Type or click <strong>Deep Scan</strong> to view detected bias flags and replacement suggestions.
      </div>
    );
  }

  if (flags.length === 0 && structuralNotes.length === 0) {
    return (
      <div style={{
        padding: '20px 16px', borderRadius: 'var(--radius-md)',
        background: 'rgba(52,199,123,0.06)',
        border: '1px solid rgba(52,199,123,0.2)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>✅</div>
        <p style={{ fontSize: 13, color: 'var(--color-success)', margin: 0, fontWeight: 500 }}>
          No bias signals detected — this job description meets fairness standards!
        </p>
      </div>
    );
  }

  // Group by category
  const grouped = flags.reduce((acc, f) => {
    const cat = f.category || f.type || 'general';
    acc[cat] = acc[cat] || [];
    acc[cat].push(f);
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

      {/* Structural Notes (from Layer 2) */}
      {structuralNotes && structuralNotes.length > 0 && (
        <div style={{
          padding: 12, borderRadius: 'var(--radius-md)',
          background: 'rgba(124,92,255,0.1)', border: '1px solid rgba(124,92,255,0.25)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: 4 }}>
            Structural Red Flags ({structuralNotes.length})
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {structuralNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Flag list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(grouped).map(([category, catFlags]) => {
          const meta = CATEGORY_META[category] || { label: category.replace(/_/g, ' '), color: 'var(--color-text-muted)' };
          return (
            <div key={category}>
              <div style={{ fontSize: 11, fontWeight: 600, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                {meta.label} ({catFlags.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {catFlags.map((f, i) => (
                  <FlagItem
                    key={f.id || i}
                    flag={f}
                    onReplace={onReplace}
                    onDismiss={onDismiss}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
