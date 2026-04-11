import { useState } from 'react';
import { predictMachineFailure } from '../services/api';
import Card, { CardHeader, CardTitle } from '../components/Card';
import StatusBadge from '../components/StatusBadge';

const LivePrediction = () => {
    const [formData, setFormData] = useState({
        rotational_speed: 1500,
        torque: 40,
        tool_wear: 0
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setToastVisible(false); // Reset toast
        try {
            const payload = {
                air_temperature: 300,
                process_temperature: 310,
                ...formData
            };
            const response = await predictMachineFailure(payload);
            setResult(response);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to predict hardware state.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
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
                    <span className="text-blue-400">RPM:</span> {formData.rotational_speed} | <span className="text-amber-400">TRQ:</span> {formData.torque} | <span className="text-red-400">WEAR:</span> {formData.tool_wear}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    Hardware trace securely transmitted to OEM. Rescue technician dispatched preventing assembly line halt.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manual Hardware Input</CardTitle>
                </CardHeader>
                <div className="p-6 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Angle / Rotational RPM</label>
                                <input type="number" name="rotational_speed" className="input" value={formData.rotational_speed} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Axis Torque (Nm)</label>
                                <input type="number" name="torque" className="input" value={formData.torque} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Hardware Wear (Time/Degradation)</label>
                                <input type="number" name="tool_wear" className="input" value={formData.tool_wear} onChange={handleChange} required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn bg-gray-900 text-white hover:bg-gray-800 w-full shadow-sm mt-4 font-semibold">
                            {loading ? 'Evaluating Protocol...' : 'Run Neural Diagnostics'}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-4 p-3 bg-red-50 rounded border border-red-100">{error}</p>}
                </div>
            </Card>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Hardware Diagnostics Output</CardTitle>
                </CardHeader>
                <div className="flex-1 p-6 flex flex-col justify-center items-center bg-gray-50 border-t border-gray-100">
                    {result ? (
                        <div className="text-center w-full max-w-sm">
                            <div className="mb-6"><StatusBadge isFailure={result.prediction === 1} /></div>
                            <div className="bg-white p-5 rounded border border-gray-200 shadow-sm relative overflow-hidden">
                                <p className="text-5xl font-black text-gray-900 tracking-tight">{(result.confidence * 100).toFixed(1)}<span className="text-2xl text-gray-400">%</span></p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Neural Confidence Score</p>
                            </div>
                            <div className="mt-4 text-left p-4 bg-white rounded border border-gray-200 shadow-sm">
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">{result.suggestion}</p>
                                {result.prediction === 1 && (
                                    <button 
                                        onClick={() => setToastVisible(true)}
                                        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white text-[11px] uppercase font-bold tracking-widest py-3 rounded shadow transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                        Transmit Diagnostics to OEM
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 font-medium">Awaiting manual inputs...</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default LivePrediction;
