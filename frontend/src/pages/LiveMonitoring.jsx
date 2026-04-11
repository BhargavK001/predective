import { useEffect, useState } from 'react';
import { 
    startSimulation, 
    stopSimulation, 
    getSimulationStatus, 
    getLiveLatest, 
    getLiveHistory 
} from '../services/api';
import Card, { CardHeader, CardTitle } from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalogGauge = ({ title, value, max, unit, color = "#111827" }) => {
    const percentage = value ? Math.min(value / max, 1) : 0;
    const data = [
        { name: 'Active', value: percentage * 100 },
        { name: 'Remaining', value: 100 - (percentage * 100) }
    ];
    return (
        <Card className="p-5 flex flex-col items-center justify-center relative shadow-sm border border-gray-200 bg-white">
             <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1 z-10">{title}</p>
             <div className="h-[100px] w-full flex justify-center -mt-2">
                 <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                            <Cell fill={color} />
                            <Cell fill="#f3f4f6" />
                        </Pie>
                    </PieChart>
                 </ResponsiveContainer>
             </div>
             <div className="absolute bottom-6 flex flex-col items-center">
                 <p className="text-3xl font-black tracking-tight text-gray-900 leading-none">{value || '--'}</p>
                 <p className="text-[10px] font-bold uppercase text-gray-400 mt-1 tracking-widest">{unit}</p>
             </div>
        </Card>
    );
};

const LiveMonitoring = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [latest, setLatest] = useState(null);
    const [history, setHistory] = useState([]);
    const [toastVisible, setToastVisible] = useState(false);
    
    useEffect(() => {
        getSimulationStatus().then(res => setIsRunning(res.isRunning)).catch(console.error);
    }, []);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(async () => {
                try {
                    const [latestData, historyData] = await Promise.all([
                        getLiveLatest(),
                        getLiveHistory()
                    ]);
                    setLatest(latestData);
                    setHistory(historyData);
                } catch (error) {
                    console.error("fetch error", error);
                }
            }, 2500);
        } else {
            getLiveHistory().then(setHistory).catch(() => {});
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const handleStart = async () => { await startSimulation(); setIsRunning(true); };
    const handleStop = async () => { await stopSimulation(); setIsRunning(false); };

    const chartData = history.map((item, idx) => ({
        time: idx,
        rpm: item.rotational_speed,
        torque: item.torque,
        toolWear: item.tool_wear
    })).slice(-20); 

    return (
        <div className="space-y-6">
            {/* Custom Sliding OEM Toast */}
            <div className={`fixed bottom-8 right-8 bg-gray-900 border-l-4 border-l-red-500 text-white p-5 rounded shadow-2xl w-80 z-50 transition-all duration-500 transform ${toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                        <h3 className="font-bold text-[11px] tracking-widest uppercase text-red-400">Automated Dispatch</h3>
                    </div>
                    <button onClick={() => setToastVisible(false)} className="text-gray-400 hover:text-white pb-1 font-bold">&times;</button>
                </div>
                <div className="text-[10px] text-gray-300 mt-2 font-mono bg-gray-800 p-2.5 rounded mb-2 border border-gray-700 shadow-inner">
                    <span className="text-blue-400">RPM:</span> {latest?.rotational_speed} | <span className="text-amber-400">TRQ:</span> {latest?.torque} | <span className="text-red-400">WEAR:</span> {latest?.tool_wear}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    Hardware trace securely transmitted to OEM. Rescue technician dispatched preventing assembly line halt.
                </p>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h2 className="text-base font-semibold text-gray-900 tracking-tight">Analog Hardware Monitoring Array</h2>
                <div className="flex items-center gap-4">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${isRunning ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {isRunning ? 'Streaming' : 'Offline'}
                    </span>
                    {isRunning ? (
                        <button onClick={handleStop} className="btn bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 h-8 px-4 text-xs font-semibold">Halt Metrics</button>
                    ) : (
                        <button onClick={handleStart} className="btn bg-gray-900 text-white hover:bg-gray-800 h-8 px-4 text-xs font-semibold">Initiate Hardware Stream</button>
                    )}
                </div>
            </div>

            {/* Hardware Gauge Cluster instead of flat boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalogGauge 
                    title="Rotational Velocity (Angle)" 
                    value={latest?.rotational_speed} 
                    max={2000} 
                    unit="RPM / Deg"
                    color="#2563eb" // Blue
                />
                <AnalogGauge 
                    title="Component Torque Load" 
                    value={latest?.torque} 
                    max={100} 
                    unit="Nm"
                    color="#f59e0b" // Amber/Yellow
                />
                <AnalogGauge 
                    title="Tool Degradation Factor" 
                    value={latest?.tool_wear} 
                    max={250} 
                    unit="Min Index"
                    color="#dc2626" // Red
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-2 min-h-[20rem] h-full flex flex-col shadow-sm">
                    <CardHeader><CardTitle>Hardware Axis Drift Analytics</CardTitle></CardHeader>
                    <div className="flex-1 min-h-0 pt-2 px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="time" tick={false} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 260]} tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{fontSize: '11px', borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                                <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} name="RPM" />
                                <Line yAxisId="left" type="monotone" dataKey="torque" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} name="Torque" />
                                <Line yAxisId="right" type="monotone" dataKey="toolWear" stroke="#dc2626" strokeWidth={2.5} dot={false} isAnimationActive={false} name="Degradation" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="min-h-[20rem] h-full flex flex-col shadow-sm">
                    <CardHeader><CardTitle>Neural Threat Analysis</CardTitle></CardHeader>
                    <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 border-t border-gray-100 p-4">
                        {latest ? (
                            <>
                                <StatusBadge isFailure={latest.prediction === 1} />
                                <div className="mt-3 text-center">
                                    <p className="text-4xl font-black tracking-tight text-gray-900">{(latest.confidence * 100).toFixed(1)}%</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Hazard Probability</p>
                                </div>
                                <div className="mt-3 p-3 bg-white border border-gray-200 rounded text-center w-full shadow-sm">
                                    <p className="text-[11px] font-medium text-gray-700 leading-relaxed">{latest.suggestion}</p>
                                    {latest.prediction === 1 && (
                                        <button 
                                            onClick={() => setToastVisible(true)}
                                            className="mt-2 w-full border border-red-700 bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase font-bold tracking-widest py-1.5 rounded shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                            Contact OEM & Dispatch Service
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-gray-400 font-medium">Awaiting analog pipeline</p>
                        )}
                    </div>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader><CardTitle>Analog Transmission History</CardTitle></CardHeader>
                <div className="mt-2 overflow-x-auto rounded-md border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-[10px] text-gray-500 uppercase tracking-widest bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Hardware Timestamp</th>
                                <th className="px-5 py-3 font-semibold">[Angle RPM] : [Axis Trq] : [Degradation]</th>
                                <th className="px-5 py-3 font-semibold text-center">Neural Readout</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...history].reverse().map((record, index) => (
                                <tr key={index} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-[11px] font-mono text-gray-500 whitespace-nowrap">
                                        {new Date(record.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2 })}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap text-[12px] space-x-2 font-mono">
                                        <span className="text-blue-600 font-bold">{record.rotational_speed}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-amber-500 font-bold">{record.torque.toFixed(1)}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-red-600 font-bold">{record.tool_wear}</span>
                                    </td>
                                    <td className="px-5 py-2.5 text-center">
                                        <StatusBadge isFailure={record.prediction === 1} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default LiveMonitoring;
