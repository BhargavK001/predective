import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { colors, typography, radii, shadows, FAULT_LABELS } from '../tokens';
import { getStatus } from '../getStatus';
import SensorCard from './SensorCard';
import FFTPanel from './FFTPanel';
import AnalogDial from './AnalogDial';

// ─── Time-Series Chart ───────────────────────────────────────────────────────
function TimeSeriesChart({ history, dataKey, label, unit, warningLine, criticalLine }) {
  const chartData = useMemo(
    () => history.map(d => ({ time: d.time, v: d[dataKey] ?? 0 })),
    [history, dataKey],
  );

  return (
    <div className="card">
      <div className="chart-label">{label}</div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke={colors.chartGrid} vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              axisLine={false}
              tickLine={false}
              width={46}
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
              labelStyle={{ display: 'none' }}
              formatter={val => [`${Number(val).toFixed(2)} ${unit}`, label]}
              isAnimationActive={false}
            />
            {warningLine != null && (
              <ReferenceLine y={warningLine} stroke={colors.chartWarningRef} strokeDasharray="5 3" strokeWidth={1} />
            )}
            {criticalLine != null && (
              <ReferenceLine y={criticalLine} stroke={colors.chartCriticalRef} strokeDasharray="5 3" strokeWidth={1} />
            )}
            <Line
              type="monotone"
              dataKey="v"
              stroke={colors.chartPrimaryLine}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <div className="section-header">
      <span className="section-label">{title}</span>
      <div className="section-divider" />
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard({ data, history = [] }) {
  if (!data) return null;

  const healthIndex = data.health_index ?? 0;
  const faultLabel  = data.fault_label ?? 0;
  const faultName   = FAULT_LABELS[faultLabel] || 'UNKNOWN';
  const healthStatus = getStatus('health_index', healthIndex);

  const faultBadgeStyle = faultLabel === 0
    ? { color: colors.normalColor,   background: colors.normalBg }
    : { color: colors.criticalColor, background: colors.criticalBg };

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="machine-name">Motor Unit A1</span>

          {/* Health score block */}
          <div>
            <div className="health-score-label">Health Index</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="health-score" style={{ color: healthStatus.color }}>
                {healthIndex.toFixed(1)}
              </span>
              <span style={{ fontSize: 11, color: colors.textSecondary }}>/100</span>
            </div>
          </div>

          <span className="fault-badge" style={faultBadgeStyle}>
            {faultName.replace(/_/g, '\u00A0')}
          </span>
        </div>

        <span className="timestamp">
          Updated&nbsp;{data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '—'}
        </span>
      </div>

      {/* ── Section 1 — Sensor Overview ─────────────────────────────────── */}
      <div className="section">
        <SectionHeader title="Sensor Overview" />
        <div className="sensor-grid">
          <SensorCard label="Vibration RMS"  value={data.accel_rms        ?? 0} unit="m/s²" metric="accel_rms" />
          <SensorCard label="Speed"           value={data.rpm_current      ?? 0} unit="RPM"  metric="rpm_std" />
          <SensorCard label="Temperature"     value={data.temp_current     ?? 0} unit="°C"   metric="temp_current" />
          <SensorCard label="Current"         value={data.current_mean     ?? 0} unit="A"    metric="current_mean" />
          <SensorCard label="Voltage"         value={data.voltage_instant  ?? 0} unit="V"    metric={null} />
          <SensorCard label="Sound Level"     value={data.sound_level_instant ?? 0} unit="dB" metric={null} />
        </div>
      </div>

      {/* ── Section 2 — Trend & Frequency Analysis ───────────────────────── */}
      <div className="section">
        <SectionHeader title="Trend & Frequency Analysis" />
        <div className="main-grid">
          {/* Left: stacked time-series */}
          <div className="chart-stack">
            <TimeSeriesChart
              history={history}
              dataKey="accel_rms"
              label="Vibration RMS (m/s²)"
              unit="m/s²"
              warningLine={1.5}
              criticalLine={3.5}
            />
            <TimeSeriesChart
              history={history}
              dataKey="rpm_current"
              label="Speed (RPM)"
              unit="RPM"
            />
            <TimeSeriesChart
              history={history}
              dataKey="temp_current"
              label="Temperature (°C)"
              unit="°C"
              warningLine={60}
              criticalLine={80}
            />
          </div>

          {/* Right: FFT + fault */}
          <FFTPanel data={data} />
        </div>
      </div>

      {/* ── Section 3 — Instrument Panel ────────────────────────────────── */}
      <div className="section" style={{ marginBottom: 0 }}>
        <SectionHeader title="Instrument Panel" />
        <div className="gauge-row">
          <AnalogDial
            label="Health Index"
            value={healthIndex}
            min={0} max={100}
            thresholds={{ warning: 50, critical: 80 }}
            inverted
          />
          <AnalogDial
            label="Vibration RMS"
            value={data.accel_rms ?? 0}
            min={0} max={5}
            unit="m/s²"
            thresholds={{ warning: 1.5, critical: 3.5 }}
          />
          <AnalogDial
            label="Temperature"
            value={data.temp_current ?? 0}
            min={0} max={100}
            unit="°C"
            thresholds={{ warning: 60, critical: 80 }}
          />
          <AnalogDial
            label="Current"
            value={data.current_mean ?? 0}
            min={0} max={15}
            unit="A"
            thresholds={{ warning: 8, critical: 12 }}
          />
        </div>
      </div>
    </>
  );
}