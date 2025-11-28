import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { getAuth, clearAuth } from '~/lib/api';
import Sidebar from './Sidebar';

interface DashboardWrapperProps {
    children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
    const navigate = useNavigate();
    const [dbName, setDbName] = useState<string>('');
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        if (!auth) {
            navigate('/login');
            return;
        }
        setDbName(auth);
    }, [navigate]);

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    if (!dbName) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar
                dbName={dbName}
                onLogout={handleLogout}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-20' : 'md:ml-64'} ml-0`}>
                {/* Mobile Header */}
                <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                        <span className="text-2xl">☰</span>
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white">MireData</span>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>

                {children}
            </main>
        </div>
    );
}
