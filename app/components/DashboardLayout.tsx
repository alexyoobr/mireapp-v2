import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { getAuth, clearAuth } from '~/lib/api';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const [dbName, setDbName] = useState<string>('');

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar dbName={dbName} onLogout={handleLogout} />
            <main className="flex-1 ml-64 transition-all duration-300">
                <Outlet context={{ dbName }} />
            </main>
        </div>
    );
}
