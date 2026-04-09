import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { colors, typography, radii, FAULT_LABELS } from '../tokens';
import { getStatus } from '../getStatus';

export default function FFTPanel({ data }) {
  if (!data) return null;

  const fftData = [
    { name: '1×',   value: +(data.fft_1x_amplitude ?? 0).toFixed(3) },
    { name: '2×',   value: +(data.fft_2x_amplitude ?? 0).toFixed(3) },
    { name: '3×',   value: +(data.fft_3x_amplitude ?? 0).toFixed(3) },
    { name: 'BPFO', value: +(data.fft_bpfo         ?? 0).toFixed(3) },
    { name: 'BPFI', value: +(data.fft_bpfi         ?? 0).toFixed(3) },
  ];

  const faultLabel  = data.fault_label ?? 0;
  const faultName   = FAULT_LABELS[faultLabel] || 'UNKNOWN';
  const healthStatus = getStatus('health_index', data.health_index ?? 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* FFT Chart */}
      <div className="card">
        <div className="chart-label">FFT Harmonics (g)</div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fftData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={colors.chartGrid} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: colors.textSecondary }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: colors.textSecondary }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: radii.card,
                  boxShadow: 'none',
                  fontSize: 12,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              />
              <Bar dataKey="value" fill={colors.chartPrimaryLine} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fault Card */}
      <div className="card">
        <span style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: colors.textSecondary,
          marginBottom: 8,
        }}>
          Fault Classification
        </span>

        <div style={{
          fontSize: 18,
          fontWeight: 400,
          color: colors.textPrimary,
          letterSpacing: '-0.01em',
          marginBottom: 10,
        }}>
          {faultName.replace(/_/g, '\u00A0')}
        </div>

        {/* Key stats row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health</div>
            <div style={{ fontSize: 20, fontWeight: 400, color: healthStatus.color, fontVariantNumeric: 'tabular-nums' }}>
              {(data.health_index ?? 0).toFixed(1)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dom. Freq</div>
            <div style={{ fontSize: 20, fontWeight: 400, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
              {(data.fft_dominant_freq ?? 0).toFixed(0)} <span style={{ fontSize: 12, color: colors.textSecondary }}>Hz</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kurtosis</div>
            <div style={{ fontSize: 20, fontWeight: 400, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
              {(data.accel_kurtosis ?? 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          display: 'inline-block',
          marginTop: 12,
          padding: '2px 8px',
          borderRadius: radii.badge,
          fontSize: 11,
          fontWeight: 500,
          color: healthStatus.color,
          background: healthStatus.bg,
          letterSpacing: '0.03em',
        }}>
          {healthStatus.label}
        </span>
      </div>

      {/* Power Mix card */}
      <div className="card">
        <span style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: colors.textSecondary,
          marginBottom: 10,
        }}>
          Spectral Power Mix
        </span>
        {['Low', 'Mid', 'High'].map((band, i) => {
          const keys = ['fft_power_ratio_low', 'fft_power_ratio_mid', 'fft_power_ratio_high'];
          const ratio = data[keys[i]] ?? 0;
          return (
            <div key={band} style={{ marginBottom: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: colors.textSecondary }}>{band}</span>
                <span style={{ fontSize: 11, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                  {(ratio * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ height: 4, background: colors.chartGrid, borderRadius: 2 }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(ratio * 100, 100)}%`,
                  background: colors.chartPrimaryLine,
                  borderRadius: 2,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
