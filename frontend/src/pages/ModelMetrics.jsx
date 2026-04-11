import { useEffect, useState } from 'react';
import { getModelMetrics } from '../services/api';
import Card, { CardHeader, CardTitle } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ModelMetrics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await getModelMetrics();
                setMetrics(data);
            } catch (err) {
                setError('Failed to load metrics data.');
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="text-sm text-gray-500 font-medium">Retrieving model metrics...</div>;
    if (error) return <div className="text-sm border border-red-200 bg-red-50 text-red-600 font-medium p-3 rounded">{error}</div>;
    if (!metrics || !metrics.All_Models_Metrics) return <div className="text-sm text-gray-500 border border-gray-200 p-4 rounded bg-white">Metrics unavailable. Ensure model is trained via python scripts.</div>;

    const bestModelName = metrics.Best_Model.replace("Classifier", "").trim();
    const bestMetrics = metrics.All_Models_Metrics[metrics.Best_Model];

    const featureData = bestMetrics?.Feature_Importance 
        ? Object.entries(bestMetrics.Feature_Importance)
            .map(([key, val]) => ({ name: key.replace(/\[.*?\]/, '').trim(), importance: val }))
            .sort((a, b) => b.importance - a.importance)
        : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h2 className="text-base font-semibold text-gray-900 tracking-tight">Champion Baseline: {bestModelName}</h2>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-semibold uppercase tracking-wider">Active</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader><CardTitle>Accuracy</CardTitle></CardHeader>
                    <div className="text-2xl font-semibold tracking-tight text-gray-900">{(bestMetrics.Accuracy * 100).toFixed(2)}%</div>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Precision</CardTitle></CardHeader>
                    <div className="text-2xl font-semibold tracking-tight text-gray-900">{(bestMetrics.Precision * 100).toFixed(2)}%</div>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Recall</CardTitle></CardHeader>
                    <div className="text-2xl font-semibold tracking-tight text-gray-900">{(bestMetrics.Recall * 100).toFixed(2)}%</div>
                </Card>
                <Card>
                    <CardHeader><CardTitle>F1-Score</CardTitle></CardHeader>
                    <div className="text-2xl font-semibold tracking-tight text-gray-900">{(bestMetrics['F1-score'] * 100).toFixed(2)}%</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Confusion Matrix</CardTitle></CardHeader>
                    <div className="overflow-x-auto mt-4 rounded-md border border-gray-200">
                        <table className="w-full text-xs text-left text-gray-700">
                            <thead className="text-[10px] text-gray-500 uppercase tracking-widest bg-gray-50 border-b border-gray-200 font-semibold">
                                <tr>
                                    <th className="px-4 py-2.5 border-r border-gray-200">Evaluated Segment</th>
                                    <th className="px-4 py-2.5 border-r border-gray-200">Pred: Normal (0)</th>
                                    <th className="px-4 py-2.5">Pred: Failure (1)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bestMetrics.Confusion_Matrix.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100">
                                        <td className="px-4 py-3 font-medium bg-gray-50 border-r border-gray-200 text-gray-600">Actual {i === 0 ? 'Normal (0)' : 'Failure (1)'}</td>
                                        <td className="px-4 py-3 bg-white font-semibold text-gray-900 border-r border-gray-100">{row[0]}</td>
                                        <td className="px-4 py-3 bg-white font-semibold text-gray-900">{row[1]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {featureData.length > 0 && (
                    <Card className="h-80 flex flex-col">
                        <CardHeader><CardTitle>Feature Importance Ratios</CardTitle></CardHeader>
                        <div className="flex-1 min-h-0 pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                    <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#6b7280'}} width={110} axisLine={false} tickLine={false} />
                                    <XAxis type="number" tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{fontSize: '12px', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: 'none'}} />
                                    <Bar dataKey="importance" fill="#111827" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ModelMetrics;
