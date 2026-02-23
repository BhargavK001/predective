import React from 'react';

const StatusCard = ({ title, value, status, icon: Icon, description }) => {
    const getDotClass = () => {
        if (status === 'normal' || status === 'running') return 'dot-normal';
        if (status === 'warning') return 'dot-warning';
        if (status === 'critical' || status === 'shock') return 'dot-critical';
        return '';
    };

    return (
        <div className="card">
            <div className="card-title">
                {Icon && <Icon size={14} />}
                {title}
            </div>
            <div className="status-value">
                {status && <span className={`status-dot ${getDotClass()}`}></span>}
                {value}
            </div>
            {description && <div className="subtitle" style={{ marginTop: '0.5rem' }}>{description}</div>}
        </div>
    );
};

export default StatusCard;
