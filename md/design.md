# design.md — UI/UX Design System

Goal: a calm, trustworthy, "fairness dashboard" feel — not a flashy consumer app. Think
compliance/analytics-tool polish (Linear, Vercel dashboard, Notion) rather than marketing-site
flash.

## 1. Brand Feel

- **Tone:** clean, precise, transparent. Every score/flag should feel explained, not judged.
- **Avoid:** red/green traffic-light overload everywhere; harsh "FAILED" language toward
  candidates. Use "Not a match for this role" rather than "REJECTED".

## 2. Color System

Use CSS variables so both SVG widgets and Tailwind config reference the same tokens.

```css
:root {
  /* Base */
  --color-bg: #0B0F17;              /* app background, dark mode default */
  --color-surface: #131826;          /* cards, panels */
  --color-surface-alt: #1B2233;      /* nested cards, hover */
  --color-border: #262E42;

  /* Text */
  --color-text-primary: #F4F6FB;
  --color-text-secondary: #9AA4BF;
  --color-text-muted: #626C87;

  /* Brand */
  --color-primary: #5B7FFF;          /* primary actions, links */
  --color-primary-hover: #4A6BE0;
  --color-accent: #7C5CFF;           /* chatbot, AI-generated content accents */

  /* Status (used sparingly, for score/verdict states) */
  --color-success: #34C77B;          /* Eligible / low bias */
  --color-warning: #F5B93D;          /* Needs Review / medium bias */
  --color-danger:  #F0554C;          /* Not Eligible / high bias */

  /* Bias heat-map scale (low -> high) */
  --heat-0: #1B2233;
  --heat-1: #2F3A5C;
  --heat-2: #5B6FC7;
  --heat-3: #F5B93D;
  --heat-4: #F0554C;
}
```

Light mode: keep the same hues, invert `--color-bg`/`--color-surface` to `#FFFFFF` / `#F5F7FB`,
and darken text tokens accordingly — don't reinvent the palette per mode.

## 3. Typography

| Token | Font | Use |
|---|---|---|
| `--font-sans` | Inter (or system-ui fallback) | All UI text |
| `--font-mono` | JetBrains Mono | Scores, code, JSON/API examples, audit log entries |

Scale (Tailwind-style):
- `text-xs` 12px — meta labels, timestamps
- `text-sm` 14px — body/table text
- `text-base` 16px — default body
- `text-lg` 18px — card titles
- `text-xl`/`text-2xl` — section headers
- `text-3xl`+ — dashboard KPI numbers only

Weight: 400 body, 500 for labels/buttons, 600–700 for headings and KPI numbers only — avoid bold
overuse.

## 4. Core Components & States

- **Bias Score Ring:** circular progress, 0–100, uses `--color-success/warning/danger` by band
  (0–39 danger, 40–69 warning, 70–100 success). Always paired with the number, never color alone
  (accessibility).
- **Verdict Badge:** pill component — Eligible (success), Needs Review (warning), Not Eligible
  (neutral gray + short reason link, *not* danger red — keep candidate-facing rejection neutral).
- **Explanation Panel:** every flag/verdict opens a side panel with plain-English reasoning —
  consistent slide-over pattern across bias flags, test grading, and eligibility verdicts.
- **Chat Widget:** fixed bottom-right on candidate portal, docked panel on recruiter dashboard;
  uses `--color-accent` for AI-authored bubbles vs `--color-primary` for user bubbles.
- **Audit Log Row:** monospace timestamp + actor + action + reason, table view with filters.

## 5. Layout Rules

- 12-column grid, `max-w-7xl` container on dashboard pages.
- Card padding: `p-6`, corner radius `rounded-xl`, border `1px solid var(--color-border)`, no
  heavy drop shadows (flat, dashboard-style depth via borders not shadows).
- Consistent spacing scale: 4/8/12/16/24/32/48px — no arbitrary values.
- Sidebar nav (recruiter/admin) fixed width `w-64`, collapsible on mobile to a bottom tab bar.

## 6. Accessibility

- Minimum contrast ratio 4.5:1 for text; verify status colors against dark background.
- Every color-coded element (score ring, heat-map, verdict badge) also carries a text label/icon.
- All interactive elements keyboard-navigable; chat widget must be fully usable without a mouse.

## 7. Motion

- Keep it minimal: 150–200ms ease-out for hover/press states, no bouncy easing.
- Live bias score updates animate the number and ring smoothly (no jump-cut), signaling
  "real-time" without feeling jittery.
