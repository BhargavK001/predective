import { NavLink } from 'react-router-dom';
import { Home, Activity, BarChart2, History, Info } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/', icon: <Home size={16} strokeWidth={2.5} />, label: 'Dashboard' },
    { to: '/monitoring', icon: <Activity size={16} strokeWidth={2.5} />, label: 'Live Monitoring' },
    { to: '/metrics', icon: <BarChart2 size={16} strokeWidth={2.5} />, label: 'Model Metrics' },
    { to: '/history', icon: <History size={16} strokeWidth={2.5} />, label: 'Prediction History' },
  ];

  return (
    <div className="w-56 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">

      <nav className="flex-1 overflow-y-auto py-5">
        <div className="px-3 mb-2">
           <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Overview</h2>
        </div>
        <ul className="space-y-0.5 px-3">
          {links.map((link) => (
             <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    isActive 
                      ? 'bg-gray-100/80 text-gray-900' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
