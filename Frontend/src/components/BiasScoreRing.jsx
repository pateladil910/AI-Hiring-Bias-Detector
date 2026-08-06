/**
 * BiasScoreRing — Circular SVG progress ring showing bias score (0–100).
 * Per design.md: 0–39 = danger, 40–69 = warning, 70–100 = success.
 * Always paired with numeric label for accessibility.
 */
export default function BiasScoreRing({ score, size = 100, strokeWidth = 8, loading = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Color bands
  const getColor = (s) => {
    if (s === null || s === undefined) return 'var(--color-border)';
    if (s >= 70) return 'var(--color-success)';
    if (s >= 40) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const getLabel = (s) => {
    if (s === null || s === undefined) return '—';
    if (s >= 70) return 'Inclusive';
    if (s >= 40) return 'Review';
    return 'Biased';
  };

  const color = getColor(score);
  const displayScore = score !== null && score !== undefined ? Math.round(score) : null;
  const progress = displayScore !== null ? (displayScore / 100) * circumference : 0;
  const strokeDashoffset = circumference - progress;

  const fontSize = size < 80 ? 14 : size < 120 ? 20 : 28;
  const labelFontSize = size < 80 ? 9 : 11;

  return (
    <div
      role="img"
      aria-label={`Bias score: ${displayScore !== null ? displayScore + '/100' : 'not yet scored'}`}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          {!loading && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 600ms ease-out, stroke 300ms ease-out' }}
            />
          )}
          {/* Spinner arc when loading */}
          {loading && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
              strokeLinecap="round"
              style={{ animation: 'spin 0.9s linear infinite' }}
            />
          )}
        </svg>

        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {loading ? (
            <span style={{ fontSize: labelFontSize, color: 'var(--color-text-muted)' }}>…</span>
          ) : (
            <>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: fontSize,
                fontWeight: 700,
                color,
                lineHeight: 1,
              }}>
                {displayScore !== null ? displayScore : '—'}
              </span>
              {size >= 80 && (
                <span style={{ fontSize: labelFontSize, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  /100
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Verbal label below ring */}
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {loading ? 'Scoring…' : getLabel(score)}
      </span>
    </div>
  );
}
