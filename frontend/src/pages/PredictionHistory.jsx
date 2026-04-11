import { useEffect, useState } from 'react';
import { getPredictionHistory } from '../services/api';
import Card, { CardHeader, CardTitle } from '../components/Card';
import StatusBadge from '../components/StatusBadge';

const PredictionHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getPredictionHistory();
                setHistory(data.reverse()); // Latest first
            } catch (error) {
                console.error("Dashboard data load error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="text-sm text-gray-500 font-medium">Loading execution logs...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Prediction Inferences</CardTitle>
            </CardHeader>
            <div className="mt-2">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 bg-[#f9fafb] rounded-md border border-gray-200">
                        <p className="text-gray-500 text-sm font-medium">No inferences recorded.</p>
                        <p className="text-gray-400 text-xs mt-1">Execute live predictions to populate the telemetry logs.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-[10px] text-gray-500 uppercase tracking-widest bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Timestamp</th>
                                    <th className="px-5 py-3 font-semibold">Sensor Payload</th>
                                    <th className="px-5 py-3 font-semibold text-center">Status</th>
                                    <th className="px-5 py-3 font-semibold text-right">Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((record, index) => (
                                    <tr key={index} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5 text-xs font-mono text-gray-500 whitespace-nowrap">
                                            {new Date(record.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-[11px] space-x-1.5 font-mono">
                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded tracking-tight" title="Air Temp">{record.input.air_temperature.toFixed(1)}</span>
                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded tracking-tight" title="Process Temp">{record.input.process_temperature.toFixed(1)}</span>
                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded tracking-tight" title="RPM">{record.input.rotational_speed}</span>
                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded tracking-tight" title="Torque">{record.input.torque.toFixed(1)}</span>
                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded tracking-tight" title="Tool Wear">{record.input.tool_wear}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <StatusBadge isFailure={record.prediction === 1} />
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900 tracking-tight text-xs">
                                            {(record.confidence * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default PredictionHistory;
