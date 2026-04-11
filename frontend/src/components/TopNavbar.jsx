import { useLocation } from 'react-router-dom';

const TopNavbar = () => {
    const location = useLocation();
    
    const getPageTitle = () => {
        switch(location.pathname) {
            case '/': return 'Dashboard Overview';
            case '/monitoring': return 'Real-Time Streaming Analytics';
            case '/predict': return 'Manual Sensor Prediction Input';
            case '/metrics': return 'Model Performance Metrics';
            case '/history': return 'Prediction History';
            case '/about': return 'About Project';
            default: return 'Predictive Maintenance';
        }
    };

    return (
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 w-full transition-all">
            <div className="flex items-center gap-3">
               <h2 className="text-sm font-semibold text-gray-900 tracking-tight">{getPageTitle()}</h2>
            </div>
        </header>
    );
};

export default TopNavbar;
