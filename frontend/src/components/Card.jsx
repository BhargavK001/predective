export const Card = ({ children, className = '' }) => (
    <div className={`card ${className}`}>
        {children}
    </div>
);

export const CardHeader = ({ children, className = '' }) => (
    <div className={`flex flex-col space-y-1 mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-sm font-medium text-gray-900 ${className}`}>
        {children}
    </h3>
);

export default Card;
