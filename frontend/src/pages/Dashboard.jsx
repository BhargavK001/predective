import { useEffect, useState } from 'react';
import { getPredictionHistory, getModelMetrics } from '../services/api';
import Card, { CardHeader, CardTitle } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, failures: 0, normals: 0 });
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch in parallel, catching independently to prevent cascading failures
                const [historyData, metricsData] = await Promise.all([
                    getPredictionHistory().catch(() => []),
                    getModelMetrics().catch(() => null)
                ]);
                
                const total = Array.isArray(historyData) ? historyData.length : 0;
                const failures = Array.isArray(historyData) ? historyData.filter(d => d.prediction === 1).length : 0;
                const normals = total - failures;

                setStats({ total, failures, normals });
                setMetrics(metricsData || {});
            } catch (error) {
                console.error("Dashboard core loop failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-sm text-gray-500 font-medium">Gathering workspace insights...</div>;

    const pieData = [
        { name: 'Normal Ops', value: stats.normals },
        { name: 'Failures', value: stats.failures },
    ];
    const COLORS = ['#111827', '#ef4444'];

    const accuracyData = metrics?.All_Models_Metrics 
        ? Object.entries(metrics.All_Models_Metrics).map(([key, val]) => ({
            name: key.replace("Classifier", "").trim(),
            Accuracy: Number((val.Accuracy * 100).toFixed(1))
          }))
        : [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader><CardTitle>Total Predictions</CardTitle></CardHeader>
                    <div className="text-2xl font-semibold tracking-tight text-gray-900">{stats.total} <span className="text-xs font-normal text-gray-500 ml-1">queries</span></div>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Normal Operations</CardTitle></CardHeader>
                    <div className="text-2xl font-semibold tracking-tight text-gray-900">{stats.normals} <span className="text-xs font-normal text-gray-500 ml-1">healthy</span></div>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Failure Detects</CardTitle></CardHeader>
                    <div className="text-2xl font-semibold tracking-tight text-gray-900">{stats.failures} <span className="text-xs font-normal text-gray-500 ml-1">risks</span></div>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Best Accuracy</CardTitle></CardHeader>
                    <div className="text-2xl font-semibold tracking-tight text-gray-900">
                        {metrics?.Best_Accuracy ? (metrics.Best_Accuracy * 100).toFixed(1) : 0}%
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-80 flex flex-col">
                    <CardHeader><CardTitle>Model Comparisons</CardTitle></CardHeader>
                    <div className="flex-1 min-h-0 pt-4 flex items-center justify-center">
                        {accuracyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{fontSize: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}} />
                                    <Bar dataKey="Accuracy" fill="#111827" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-xs font-medium">Awaiting model calibration.</p>
                        )}
                    </div>
                </Card>

                <Card className="h-80 flex flex-col">
                    <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
                    <div className="flex-1 min-h-0 flex items-center justify-center pt-2">
                        {stats.total > 0 ? (
                            <ResponsiveContainer width={240} height={240}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{fontSize: '11px', borderRadius: '4px', border: '1px solid #e5e7eb', outline: 'none'}} />
                                    <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600, color: '#4b5563'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-xs font-medium">Awaiting network streams.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
