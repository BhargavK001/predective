import { CheckCircle2, AlertTriangle } from 'lucide-react';

const StatusBadge = ({ isFailure }) => {
    if (isFailure) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                <AlertTriangle size={14} />
                Failure Risk
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 size={14} />
            Normal
        </span>
    );
};

export default StatusBadge;
