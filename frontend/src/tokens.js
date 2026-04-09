// ─── Design Tokens ──────────────────────────────────────────────────────────
// Single source of truth for all colors, spacing, typography, and radii.
// Every component imports from this file — NO hardcoded hex strings in components.

export const colors = {
  // Page & Surface
  pageBg: '#F5F4F0',
  cardBg: '#FFFFFF',
  cardBorder: '#E8E6E0',

  // Text
  textPrimary: '#1A1916',
  textSecondary: '#6B6860',

  // Accent / Interactive
  accent: '#1A1916',

  // Status — Normal
  normalColor: '#2D6A4F',
  normalBg: '#EAF3EE',

  // Status — Warning
  warningColor: '#92400E',
  warningBg: '#FEF3C7',

  // Status — Critical
  criticalColor: '#991B1B',
  criticalBg: '#FEE2E2',

  // Chart
  chartGrid: '#E8E6E0',
  chartPrimaryLine: '#1A1916',
  chartSecondaryLine: '#6B6860',
  chartWarningRef: '#92400E',
  chartCriticalRef: '#991B1B',

  // Gauge arcs
  gaugeTrack: '#E8E6E0',
  gaugeGreen: '#2D6A4F',
  gaugeAmber: '#D97706',
  gaugeRed: '#DC2626',
};

export const typography = {
  fontStack: "'Inter', 'system-ui', sans-serif",
  headingWeight: 500,
  dataWeight: 400,
  dataLetterSpacing: '-0.02em',
  labelSize: '11px',
  labelWeight: 500,
  labelLetterSpacing: '0.06em',
};

export const spacing = {
  pageDesktop: '24px',
  pageMobile: '16px',
  cardPadding: '20px',
  cardGap: '12px',
  sectionGap: '24px',
};

export const radii = {
  card: '8px',
  badge: '6px',
  small: '4px',
};

export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.06)',
};

export const FAULT_LABELS = {
  0: 'HEALTHY',
  1: 'UNBALANCE',
  2: 'MISALIGNMENT',
  3: 'BEARING_WEAR',
  4: 'OVERLOAD',
  5: 'LOOSE_MOUNTING',
  6: 'SHAFT_ECCENTRICITY',
  7: 'WINDING_SHORT',
  8: 'STALLED_ROTOR',
};
