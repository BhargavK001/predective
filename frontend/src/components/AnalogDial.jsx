import { colors, typography, radii } from '../tokens';

export default function AnalogDial({ label, value, min = 0, max = 100, unit = '', thresholds, inverted = false }) {
  // thresholds = { warning: number, critical: number }
  // inverted = true means higher values are better (e.g. health_index)
  const warn = thresholds?.warning ?? max * 0.5;
  const crit = thresholds?.critical ?? max * 0.8;

  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);

  // Determine current color based on value
  let arcColor;
  if (inverted) {
    // Higher is better: >crit = green, warn..crit = amber, <warn = red
    if (value > crit) arcColor = colors.gaugeGreen;
    else if (value >= warn) arcColor = colors.gaugeAmber;
    else arcColor = colors.gaugeRed;
  } else {
    // Higher is worse: >=crit = red, >=warn = amber, <warn = green
    if (value >= crit) arcColor = colors.gaugeRed;
    else if (value >= warn) arcColor = colors.gaugeAmber;
    else arcColor = colors.gaugeGreen;
  }

  // SVG arc math
  const cx = 60, cy = 55, R = 42;
  const startAngle = -210;
  const endAngle = 30;
  const totalSweep = endAngle - startAngle; // 240°
  const valueAngle = startAngle + pct * totalSweep;

  const toXY = (deg, r) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const arcPath = (r, a1, a2) => {
    const [x1, y1] = toXY(a1, r);
    const [x2, y2] = toXY(a2, r);
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
  };

  // 3 tick marks: min, mid, max
  const tickAngles = [startAngle, startAngle + totalSweep / 2, endAngle];
  const tickLabels = [min, +((min + max) / 2).toFixed(0), max];

  const displayValue = typeof value === 'number'
    ? (Math.abs(value) < 10 ? value.toFixed(2) : value.toFixed(1))
    : value;


  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        fontSize: typography.labelSize,
        fontWeight: typography.labelWeight,
        letterSpacing: typography.labelLetterSpacing,
        textTransform: 'uppercase',
        color: colors.textSecondary,
        marginBottom: 4,
      }}>
        {label}
      </div>

      <svg width="120" height="80" viewBox="0 0 120 80">
        {/* Track arc */}
        <path
          d={arcPath(R, startAngle, endAngle)}
          fill="none"
          stroke={colors.gaugeTrack}
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Value arc */}
        {pct > 0.005 && (
          <path
            d={arcPath(R, startAngle, valueAngle)}
            fill="none"
            stroke={arcColor}
            strokeWidth="7"
            strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {tickAngles.map((a, i) => {
          const [ox, oy] = toXY(a, R + 5);
          const [ix, iy] = toXY(a, R - 1);
          return (
            <g key={i}>
              <line x1={ox} y1={oy} x2={ix} y2={iy} stroke={colors.textSecondary} strokeWidth="1" />
              <text
                x={toXY(a, R + 12)[0]}
                y={toXY(a, R + 12)[1]}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8"
                fill={colors.textSecondary}
              >
                {tickLabels[i]}
              </text>
            </g>
          );
        })}

        {/* Value text */}
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fontSize="22"
          fontWeight={typography.dataWeight}
          fill={colors.textPrimary}
          fontFamily={typography.fontStack}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {displayValue}
        </text>

        {/* Unit text */}
        <text
          x={cx}
          y={cy + 19}
          textAnchor="middle"
          fontSize="11"
          fill={colors.textSecondary}
        >
          {unit}
        </text>
      </svg>
    </div>
  );
}
