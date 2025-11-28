import { Link, useLocation } from 'react-router';
import { useState } from 'react';

interface SidebarProps {
    dbName: string;
    onLogout: () => void;
}

export default function Sidebar({ dbName, onLogout }: SidebarProps) {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/vendas', label: 'Vendas', icon: '💰' },
        { path: '/clientes', label: 'Clientes', icon: '👥' },
        { path: '/produtos', label: 'Produtos', icon: '📦' },
        { path: '/relatorios', label: 'Relatórios', icon: '📈' },
        { path: '/configuracoes', label: 'Configurações', icon: '⚙️' },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 text-white transition-all duration-300 shadow-2xl ${collapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-indigo-700">
                {!collapsed && (
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                            MireData
                        </h1>
                        <p className="text-xs text-indigo-300 mt-1 truncate">{dbName}</p>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    title={collapsed ? 'Expandir' : 'Recolher'}
                >
                    <span className="text-xl">{collapsed ? '→' : '←'}</span>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-white text-indigo-900 shadow-lg'
                                    : 'hover:bg-indigo-700 text-indigo-100'
                                }`}
                            title={collapsed ? item.label : ''}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            {!collapsed && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}
                            {!collapsed && isActive && (
                                <span className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-indigo-700">
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors ${collapsed ? 'justify-center' : ''
                        }`}
                    title={collapsed ? 'Sair' : ''}
                >
                    <span className="text-xl">🚪</span>
                    {!collapsed && <span className="font-medium text-sm">Sair</span>}
                </button>
            </div>
        </aside>
    );
}
