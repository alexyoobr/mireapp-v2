import DashboardWrapper from '~/components/DashboardWrapper';
import { useTheme } from '~/components/ThemeContext';

export default function Configuracoes() {
    const { theme, toggleTheme } = useTheme();

    return (
        <DashboardWrapper>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configurações do sistema</p>
                    </div>
                </header>

                <div className="px-8 py-8">
                    <div className="max-w-4xl space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Banco de Dados</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Banco Atual
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        placeholder="Conectado"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Preferências</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Notificações</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações do sistema</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Modo Escuro</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Ativar tema escuro</p>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sobre</h2>
                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <p><span className="font-medium text-gray-900 dark:text-white">Versão:</span> 2.0.0</p>
                                <p><span className="font-medium text-gray-900 dark:text-white">Desenvolvido por:</span> MireData</p>
                                <p><span className="font-medium text-gray-900 dark:text-white">Suporte:</span> suporte@miredata.com.br</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}
