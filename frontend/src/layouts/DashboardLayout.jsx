import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  return (
    <div className="flex bg-[#f9fafb] font-sans text-gray-900 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-56">
            <TopNavbar />
            <main className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-5xl mx-auto space-y-6">
                    <Outlet />
                </div>
            </main>
        </div>
    </div>
  );
};

export default DashboardLayout;
