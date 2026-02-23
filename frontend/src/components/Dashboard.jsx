import { useState, useEffect, useRef } from "react";
import { Activity, Settings, AlertTriangle, Gauge, Zap, Wind, ShieldCheck, HeartPulse } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Data provided by App.jsx ──────────────────────────────────────────────────

// ─── Color helpers ────────────────────────────────────────────────────────────
const statusColor = (s) =>
    ({ normal: "#22c55e", running: "#2563eb", warning: "#f59e0b", critical: "#ef4444", shock: "#ef4444", stopped: "#94a3b8" }[s] || "#22c55e");

const statusBg = (s) =>
    ({ normal: "rgba(34,197,94,0.08)", running: "rgba(37,99,235,0.08)", warning: "rgba(245,158,11,0.08)", critical: "rgba(239,68,68,0.08)", shock: "rgba(239,68,68,0.08)", stopped: "rgba(148,163,184,0.08)" }[s] || "rgba(34,197,94,0.08)");

// ─── Recharts Sparkline ──────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 40, showAxes = false }) {
    if (!data || data.length === 0) return null;
    return (
        <div style={{ width: "100%", height, marginTop: showAxes ? "1rem" : 0 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 5, left: showAxes ? -20 : 0, bottom: 0 }}>
                    {showAxes && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
                    {showAxes && <XAxis dataKey="time" hide={true} />}
                    {showAxes && <YAxis domain={["dataMin - 0.05", "dataMax + 0.05"]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />}
                    <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}
                        labelStyle={{ display: "none" }}
                        itemStyle={{ color: "#0f172a", fontWeight: "bold" }}
                        isAnimationActive={false}
                    />
                    <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Analog Gauge ─────────────────────────────────────────────────────────────
function AnalogGauge({ title, value, max, unit, color = "#2563eb" }) {
    const pct = Math.min(value / max, 1);
    const startAngle = -220, endAngle = 40;
    const angle = startAngle + pct * (endAngle - startAngle);
    const R = 52, cx = 64, cy = 64;
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
    const [nx, ny] = toXY(angle, R - 10);
    const ticks = Array.from({ length: 11 }, (_, i) => {
        const a = startAngle + (i / 10) * (endAngle - startAngle);
        const [ox, oy] = toXY(a, R + 3);
        const [ix, iy] = toXY(a, R - 4);
        return { a, ox, oy, ix, iy, major: i % 5 === 0 };
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
            <svg width="128" height="90" viewBox="0 0 128 90">
                <defs>
                    <linearGradient id={`gauge-${title}`} x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor={color} />
                    </linearGradient>
                </defs>
                {/* track */}
                <path d={arcPath(R, startAngle, endAngle)} fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                {/* fill */}
                <path d={arcPath(R, startAngle, angle)} fill="none" stroke={`url(#gauge-${title})`} strokeWidth="6" strokeLinecap="round" />
                {/* ticks */}
                {ticks.map((t, i) => (
                    <line key={i} x1={t.ox} y1={t.oy} x2={t.ix} y2={t.iy} stroke={t.major ? "#64748b" : "#cbd5e1"} strokeWidth={t.major ? 1.5 : 1} />
                ))}
                {/* needle */}
                <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r="5" fill={color} />
                <circle cx={cx} cy={cy} r="2.5" fill="#fff" />
                {/* value */}
                <text x={cx} y={cy + 22} textAnchor="middle" fontSize="11" fontWeight="700" fill={color} fontFamily="'JetBrains Mono', monospace">
                    {typeof value === "number" && value < 10 ? value.toFixed(2) : Math.round(value)}{unit}
                </text>
            </svg>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b" }}>{title}</span>
        </div>
    );
}

// ─── Status Card ──────────────────────────────────────────────────────────────
function StatusCard({ title, value, status, icon: Icon }) {
    const col = statusColor(status);
    const bg = statusBg(status);
    return (
        <div style={{
            background: "#fff", borderRadius: "14px", padding: "1rem 1.25rem",
            border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column", gap: "0.5rem", position: "relative", overflow: "hidden"
        }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: "3px", height: "100%", borderRadius: "0 14px 14px 0", background: col }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: 26, height: 26, borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={13} color={col} />
                </div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>{title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, boxShadow: `0 0 6px ${col}88`, flexShrink: 0 }} />
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</span>
            </div>
        </div>
    );
}

// ─── Metric Tile ──────────────────────────────────────────────────────────────
function MetricTile({ icon: Icon, label, value, spark, color = "#2563eb" }) {
    return (
        <div style={{
            background: "#fff", borderRadius: "14px", padding: "1rem 1.25rem",
            border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <Icon size={13} color="#94a3b8" />
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>{label}</span>
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", marginBottom: "0.5rem" }}>{value}</div>
            {spark && <Sparkline data={spark} color={color} height={36} />}
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ data, history = [] }) {
    if (!data) return null;

    // Safety fallback for stability
    const stabilityValue = typeof data.stability === 'number' ? data.stability : 0;

    const vStatus = data.vibration ? data.vibration.toLowerCase() : 'normal';
    const mStatus = data.motor === "MOTOR RUNNING" ? "running" : "stopped";
    const shStatus = data.shock ? "shock" : "normal";
    const isWarn = vStatus === "warning" || vStatus === "critical" || data.shock || stabilityValue < 0.7;
    const sysStatus = isWarn ? "warning" : "normal";

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f0f4ff; }
        .dash-root {
          min-height: 100vh; overflow-y: auto; overflow-x: hidden;
          display: flex; flex-direction: column;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
          font-family: 'DM Sans', sans-serif;
        }
        .grid-12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 0.65rem; }
        .c2  { grid-column: span 2; }
        .c3  { grid-column: span 3; }
        .c4  { grid-column: span 4; }
        .c5  { grid-column: span 5; }
        .c6  { grid-column: span 6; }
        .c7  { grid-column: span 7; }
        .c8  { grid-column: span 8; }
        .c12 { grid-column: span 12; }

        @media (max-width: 1024px) {
          .c2, .c3, .c4, .c5, .c6, .c7, .c8 { grid-column: span 12 !important; }
        }
      `}</style>

            <div className="dash-root">
                {/* ── Header ── */}
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#1d4ed8,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
                            <Activity size={18} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Predictive Maintenance</div>
                            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>Real-time Motor & Vibration Analytics</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748b" }}>LIVE</span>
                        </div>
                        <div style={{ background: "#fff", borderRadius: "8px", padding: "0.3rem 0.75rem", border: "1px solid #e2e8f0", fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", color: "#2563eb", fontWeight: 700 }}>
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </header>

                {/* ── Row 1: Status Cards ── */}
                <div className="grid-12" style={{ marginBottom: "0.65rem" }}>
                    <div className="c3"><StatusCard title="Motor Operation" value={data.motor === "MOTOR RUNNING" ? "Running" : "Stopped"} status={mStatus} icon={Settings} /></div>
                    <div className="c3"><StatusCard title="Vibration Level" value={data.vibration} status={vStatus} icon={Activity} /></div>
                    <div className="c3"><StatusCard title="Shock Monitor" value={data.shock ? "ALERT" : "Normal"} status={shStatus} icon={AlertTriangle} /></div>
                    <div className="c3"><StatusCard title="Stability Index" value={stabilityValue.toFixed(3)} status="normal" icon={Gauge} /></div>
                </div>

                {/* ── Row 2: Health + Fault ── */}
                <div className="grid-12" style={{ marginBottom: "0.65rem" }}>
                    <div className="c6"><StatusCard title="System Health Status" value={isWarn ? "Needs Attention" : "Optimal"} status={sysStatus} icon={HeartPulse} /></div>
                    <div className="c6"><StatusCard title="Fault Detection" value={isWarn ? "EARLY WARNING DETECTED" : "NORMAL OPERATION"} status={sysStatus} icon={ShieldCheck} /></div>
                </div>

                {/* ── Row 3: Gauges + Metrics ── */}
                <div className="grid-12" style={{ flex: 1, minHeight: 0 }}>
                    {/* Left Column: Huge Chart */}
                    <div className="c6" style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        <div style={{ background: "#fff", borderRadius: "14px", padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", color: "#64748b", textTransform: "uppercase" }}>Stability Trend</span>
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>{stabilityValue.toFixed(3)}</span>
                            </div>
                            <div style={{ flex: 1, minHeight: "220px" }}>
                                {history.length > 0 && <Sparkline data={history.map((d) => ({ v: +(d.stability !== undefined ? d.stability : 0).toFixed(3), time: d.time }))} color="#22c55e" height="100%" showAxes={true} />}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Gauges & Metrics */}
                    <div className="c6" style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                            {/* Analog Gauges Stacked/SideBySide */}
                            <div style={{ background: "#fff", borderRadius: "14px", padding: "1rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", gridColumn: "span 2" }}>
                                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8" }}>Analog Instruments</span>
                                <div style={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
                                    <AnalogGauge title="PWM Drive" value={data.pwm || 0} max={255} unit="" color="#2563eb" />
                                    <AnalogGauge title="Stability" value={stabilityValue} max={1} unit="" color="#22c55e" />
                                </div>
                            </div>
                        </div>

                        {/* Metric tiles */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.65rem" }}>
                            <MetricTile icon={Zap} label="Duty" value={`${data.duty || 0}%`} spark={history.length > 0 ? history.map((d) => ({ v: d.duty || 0, time: d.time })) : null} color="#2563eb" />
                            <MetricTile icon={Wind} label="Pulse" value={data.pulse || 0} spark={history.length > 0 ? history.map((d) => ({ v: d.pulse || 0, time: d.time })) : null} color="#7c3aed" />
                            <MetricTile icon={Activity} label="Dist" value={data.distance || "0 m"} color="#0891b2" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}