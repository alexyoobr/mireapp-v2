import { Link, useLocation } from 'react-router';
import { useTheme } from '~/components/ThemeContext';
import InstallPWA from '~/components/InstallPWA';

interface SidebarProps {
    dbName: string;
    onLogout: () => void;
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
}

export default function Sidebar({ dbName, onLogout, collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/vendas', label: 'Vendas', icon: '💰' },
        { path: '/clientes', label: 'Clientes', icon: '👥' },
        { path: '/produtos', label: 'Produtos', icon: '📦' },
        { path: '/relatorios', label: 'Relatórios', icon: '📈' },
        { path: '/configuracoes', label: 'Configurações', icon: '⚙️' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 
                    bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 
                    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
                    text-white transition-all duration-300 shadow-2xl
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 
                    ${collapsed ? 'md:w-20' : 'md:w-64'}
                    w-64
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-indigo-700 dark:border-gray-700">
                    {(!collapsed || mobileOpen) && (
                        <div className="overflow-hidden">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent whitespace-nowrap">
                                MireData
                            </h1>
                            <p className="text-xs text-indigo-300 mt-1 truncate">{dbName}</p>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:block p-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors"
                        title={collapsed ? 'Expandir' : 'Recolher'}
                    >
                        <span className="text-xl">{collapsed ? '→' : '←'}</span>
                    </button>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden p-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-white text-indigo-900 shadow-lg dark:bg-gray-800 dark:text-white'
                                    : 'hover:bg-indigo-700 text-indigo-100 dark:hover:bg-gray-700'
                                    }`}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="text-2xl">{item.icon}</span>
                                {(!collapsed || mobileOpen) && (
                                    <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                                )}
                                {(!collapsed || mobileOpen) && isActive && (
                                    <span className="ml-auto w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-indigo-700 dark:border-gray-700 space-y-2">
                    {(!collapsed || mobileOpen) && <InstallPWA />}

                    <button
                        onClick={toggleTheme}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-800 hover:bg-indigo-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors ${collapsed && !mobileOpen ? 'justify-center' : ''
                            }`}
                        title={collapsed ? (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro') : ''}
                    >
                        <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
                        {(!collapsed || mobileOpen) && <span className="font-medium text-sm whitespace-nowrap">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
                    </button>

                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors ${collapsed && !mobileOpen ? 'justify-center' : ''
                            }`}
                        title={collapsed ? 'Sair' : ''}
                    >
                        <span className="text-xl">🚪</span>
                        {(!collapsed || mobileOpen) && <span className="font-medium text-sm whitespace-nowrap">Sair</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
