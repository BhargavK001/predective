import { colors, typography, radii } from '../tokens';
import { getStatus } from '../getStatus';

export default function SensorCard({ label, value, unit, metric }) {
  const status = getStatus(metric, value);
  const displayValue = typeof value === 'number'
    ? (Math.abs(value) >= 1000 ? Math.round(value).toLocaleString()
      : Math.abs(value) < 10 ? value.toFixed(2)
      : value.toFixed(1))
    : (value ?? '—');

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label */}
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: colors.textSecondary,
      }}>
        {label}
      </span>

      {/* Value + Unit */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{
          fontSize: 26,
          fontWeight: 400,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          color: colors.textPrimary,
          lineHeight: 1,
        }}>
          {displayValue}
        </span>
        {unit && (
          <span style={{ fontSize: 12, color: colors.textSecondary }}>
            {unit}
          </span>
        )}
      </div>

      {/* Status Badge */}
      <span style={{
        display: 'inline-block',
        alignSelf: 'flex-start',
        padding: '2px 7px',
        borderRadius: radii.badge,
        fontSize: 11,
        fontWeight: 500,
        color: status.color,
        background: status.bg,
        letterSpacing: '0.03em',
      }}>
        {status.label}
      </span>
    </div>
  );
}
