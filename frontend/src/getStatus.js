import { colors } from './tokens';

// ─── Status Thresholds ──────────────────────────────────────────────────────
// Returns { level, label, color, bg } for a given metric and value.

const THRESHOLDS = {
  health_index: {
    normal: (v) => v > 80,
    warning: (v) => v >= 50 && v <= 80,
    // critical: everything else (< 50)
  },
  accel_rms: {
    normal: (v) => v < 1.5,
    warning: (v) => v >= 1.5 && v <= 3.5,
  },
  temp_current: {
    normal: (v) => v < 60,
    warning: (v) => v >= 60 && v <= 80,
  },
  current_mean: {
    normal: (v) => v < 8,
    warning: (v) => v >= 8 && v <= 12,
  },
  rpm_std: {
    normal: (v) => v < 20,
    warning: (v) => v >= 20 && v <= 50,
  },
};

const LEVEL_STYLES = {
  normal: {
    label: 'Normal',
    color: colors.normalColor,
    bg: colors.normalBg,
  },
  warning: {
    label: 'Warning',
    color: colors.warningColor,
    bg: colors.warningBg,
  },
  critical: {
    label: 'Critical',
    color: colors.criticalColor,
    bg: colors.criticalBg,
  },
};

export function getStatus(metric, value) {
  const thresholds = THRESHOLDS[metric];

  if (!thresholds) {
    // Default to normal for any unrecognized metric
    return { level: 'normal', ...LEVEL_STYLES.normal };
  }

  if (thresholds.normal(value)) {
    return { level: 'normal', ...LEVEL_STYLES.normal };
  }

  if (thresholds.warning(value)) {
    return { level: 'warning', ...LEVEL_STYLES.warning };
  }

  return { level: 'critical', ...LEVEL_STYLES.critical };
}

export default getStatus;
