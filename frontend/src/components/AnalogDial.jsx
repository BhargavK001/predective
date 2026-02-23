import React from 'react';

const AnalogDial = ({ title, value, min = 0, max = 100, unit = '' }) => {
    // Calculate rotation for the needle
    const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
    const rotation = -90 + (percentage * 180);

    return (
        <div className="dial-container">
            <span className="dial-title">{title}</span>
            <div className="dial-svg-wrapper">
                <svg viewBox="0 0 100 60" className="dial-svg">
                    {/* Background Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Value Arc */}
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="125.6"
                        strokeDashoffset={125.6 * (1 - percentage)}
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                    {/* Needle */}
                    <line
                        x1="50" y1="50" x2="50" y2="15"
                        stroke="#000"
                        strokeWidth="2"
                        transform={`rotate(${rotation} 50 50)`}
                        style={{ transition: 'transform 0.5s ease-out' }}
                    />
                    <circle cx="50" cy="50" r="3" fill="#000" />
                </svg>
            </div>
            <div className="dial-value">
                {value} {unit}
            </div>
        </div>
    );
};

export default AnalogDial;
